import { API_PREFIX } from '@/config';
import { DEFAULT_USER } from '@/config';

export interface IOnDataMoreInfo {
  conversationId?: string;
  messageId?: string;
  eventType?: string;
  thought?: string;
  observation?: string;
  tool?: string;
  toolInput?: string;
  files?: string[];
  isComplete?: boolean; // 标记是否是完整消息
  errorMessage?: string; // 错误消息
  debugInfo?: {
    currentText?: string;
    accumulatedLength?: number;
    finalLength?: number;
    timestamp?: string;
    messageId?: string;
  }; // 调试信息
};

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void;
export type IOnCompleted = () => void;
export type IOnError = (msg: string) => void;

// 内容类型定义
const ContentType = {
  json: 'application/json',
  stream: 'text/event-stream',
};

// 处理流式响应
const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
) => {
  if (!response.ok)
    throw new Error('网络响应异常');

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let isFirstMessage = true;
  let messageContent = ''; // 完整消息内容
  let messageId = ''; // 消息ID
  let conversationId = ''; // 对话ID

  console.log('开始流式处理...');

  function read() {
    reader?.read().then((result: any) => {
      if (result.done) {
        // 确保在完全结束时发送最终完整消息
        if (messageContent) {
          console.log('发送最终完整消息:', messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent);
          onData(messageContent, false, {
            conversationId,
            messageId,
            eventType: 'message',
            isComplete: true
          });
        }
        console.log('流处理完成，调用onCompleted');
        onCompleted && onCompleted();
        return;
      }

      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留可能不完整的最后一行

      try {
        for (const line of lines) {
          if (!line || line === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              // 在收到[DONE]时发送最终完整消息
              if (messageContent) {
                console.log('收到[DONE]，发送最终消息');
                onData(messageContent, false, {
                  conversationId,
                  messageId,
                  eventType: 'message',
                  isComplete: true
                });
              }
              console.log('收到[DONE]标记，调用onCompleted');
              onCompleted && onCompleted();
              return;
            }

            try {
              const parsedData = JSON.parse(data);

              // 记录对话ID
              if (parsedData.conversation_id) {
                conversationId = parsedData.conversation_id;
              }

              // 处理不同的事件类型
              switch (parsedData.event) {
                case 'message':
                case 'agent_message':
                  // 获取回复内容
                  const text = parsedData.answer || '';

                  // 记录消息ID
                  if (!messageId && parsedData.message_id) {
                    messageId = parsedData.message_id || parsedData.id || '';
                    console.log('设置消息ID:', messageId);
                  }

                  // 关键处理：累积消息
                  messageContent = messageContent + text; // 累加每个片段
                  console.log('累加消息:', text, ' | 当前长度:', messageContent.length, '当前完整内容:', messageContent);

                  // 发送累积后的完整消息给客户端
                  onData(messageContent, isFirstMessage, {
                    conversationId,
                    messageId,
                    eventType: parsedData.event,
                    isComplete: false, // 流式传输中的消息，尚未完成
                    // 调试信息
                    debugInfo: {
                      currentText: text,
                      accumulatedLength: messageContent.length,
                      timestamp: new Date().toISOString(),
                      messageId: messageId
                    }
                  });

                  if (isFirstMessage) {
                    isFirstMessage = false;
                  }
                  break;

                case 'agent_thought':
                  // 处理Agent思考步骤
                  onData(
                    parsedData.thought || '',
                    isFirstMessage,
                    {
                      conversationId: parsedData.conversation_id,
                      messageId: parsedData.message_id || '',
                      eventType: 'agent_thought',
                      thought: parsedData.thought || '',
                      observation: parsedData.observation || '',
                      tool: parsedData.tool || '',
                      toolInput: parsedData.tool_input || '',
                      files: parsedData.message_files || []
                    }
                  );

                  // 对于第一个thought事件，可能需要重置isFirstMessage
                  if (isFirstMessage && parsedData.thought) {
                    console.log('收到首个agent_thought事件，重置isFirstMessage');
                    isFirstMessage = false;
                  }

                  // 如果thought事件中包含完整的消息，也更新messageContent
                  if (parsedData.thought && parsedData.thought.length > 0 && parsedData.position === 1) {
                    console.log('从agent_thought中获取完整消息内容:', parsedData.thought);
                    // 只有在position为1的情况下才使用thought内容更新messageContent
                    // 这表示这是思考的第一个部分，通常包含完整消息
                    if (!messageContent || messageContent.length === 0) {
                      messageContent = parsedData.thought;
                      console.log('使用agent_thought更新messageContent:', messageContent);
                    }
                  }
                  break;

                case 'message_file':
                  // 处理文件事件
                  onData(
                    '文件已生成',
                    isFirstMessage,
                    {
                      conversationId: parsedData.conversation_id,
                      messageId: parsedData.id || '',
                      eventType: 'message_file',
                      files: [parsedData.id]
                    }
                  );
                  if (isFirstMessage) {
                    isFirstMessage = false;
                  }
                  break;

                case 'tts_message':
                  // 处理TTS音频流事件
                  // 这里可以根据需要处理音频数据
                  break;

                case 'message_end':
                  // 消息结束事件
                  console.log('消息结束事件触发，最终消息长度:', messageContent.length);

                  // 检查元数据中是否有消息更新
                  if (parsedData.metadata && parsedData.metadata.usage) {
                    console.log('消息元数据:', parsedData.metadata);
                  }

                  // 确保传递最新的完整消息
                  if (messageContent) {
                    console.log('消息结束事件：发送最终完整消息 | 长度:', messageContent.length);
                    onData(
                      messageContent,
                      false,
                      {
                        conversationId,
                        messageId: parsedData.message_id || messageId || '',
                        eventType: 'message_end',
                        isComplete: true, // 标记消息已完成
                        debugInfo: {
                          finalLength: messageContent.length,
                          timestamp: new Date().toISOString(),
                          messageId: parsedData.message_id || messageId || ''
                        }
                      }
                    );
                  } else {
                    console.warn('警告：消息结束时messageContent为空');
                  }

                  onCompleted && onCompleted();
                  break;

                case 'error':
                  // 错误事件
                  console.error('Dify API错误:', parsedData.message);
                  onData(
                    '',
                    isFirstMessage,
                    {
                      conversationId: parsedData.conversation_id,
                      messageId: parsedData.message_id || '',
                      errorMessage: parsedData.message || '未知错误'
                    }
                  );
                  onCompleted && onCompleted();
                  break;

                case 'ping':
                  // ping事件，保持连接
                  break;

                default:
                  console.log('未处理的事件类型:', parsedData.event);
                  break;
              }
            } catch (e) {
              console.error('解析JSON数据出错:', e);
              // 即使解析错误，也尝试继续处理后续数据
            }
          }
        }
      } catch (e) {
        console.error('处理消息时出错:', e);
        buffer = ''; // 清空缓冲区，避免错误数据积累
      }

      // 继续读取下一块数据
      read();
    }).catch((e) => {
      console.error('读取流时出错:', e);
      // 出错时也确保调用完成回调
      if (messageContent) {
        // 即使在出错的情况下，也尝试发送已累积的消息内容
        console.log('出错时发送已累积的消息内容:', messageContent.length);
        try {
          onData(messageContent, false, {
            conversationId,
            messageId,
            eventType: 'message',
            isComplete: true,
            errorMessage: e.toString()
          });
        } catch (innerError) {
          console.error('发送错误消息时出错:', innerError);
        }
      }

      // 网络错误处理 - 通知UI错误类型
      let errorMessage = '网络连接中断';
      if (e instanceof Error) {
        if (e.message.includes('网络') || e.message.includes('network')) {
          errorMessage = '网络连接问题，请检查您的网络连接';
        } else if (e.message.includes('超时') || e.message.includes('timeout')) {
          errorMessage = '连接超时，请稍后重试';
        } else if (e.message.includes('终止') || e.message.includes('aborted')) {
          errorMessage = '连接被中断，可能是服务器或防火墙问题';
        } else if (e.message.includes('拒绝') || e.message.includes('refused')) {
          errorMessage = '连接被拒绝，请检查服务器配置';
        }
      }

      // 通知UI出现了错误
      try {
        onData('', false, {
          errorMessage: errorMessage,
          isComplete: true
        });
      } catch (notifyError) {
        console.error('通知UI错误时出错:', notifyError);
      }

      onCompleted && onCompleted();
    });
  }

  // 开始读取流
  read();
};

// 发送聊天消息的函数
export const sendChatMessage = async (
  params: {
    query: string;
    conversation_id?: string;
    inputs?: Record<string, any>;
    user?: string;
  },
  callbacks: {
    onData: IOnData;
    onCompleted?: IOnCompleted;
    onError?: IOnError;
  }
): Promise<void> => {
  const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_DIFY_BASE_URL || '';

  if (!apiKey || !baseUrl) {
    callbacks.onError && callbacks.onError('API密钥或基础URL未配置');
    return;
  }

  try {
    // 增加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

    // 构建目标URL
    const targetUrl = `${baseUrl}/chat-messages`;

    // 在浏览器环境中使用代理API路由
    const useUrl = typeof window !== 'undefined'
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    console.log('使用URL:', useUrl, '是否使用代理:', typeof window !== 'undefined');

    const response = await fetch(useUrl, {
      method: 'POST',
      headers: {
        'Content-Type': ContentType.json,
        'Authorization': `Bearer ${apiKey}`,
        'Accept': ContentType.stream
      },
      body: JSON.stringify({
        inputs: params.inputs || {},
        query: params.query,
        response_mode: 'streaming',
        conversation_id: params.conversation_id,
        user: params.user || DEFAULT_USER,
      }),
      signal: controller.signal
    });

    // 清除超时计时器
    clearTimeout(timeoutId);

    // 处理错误状态码
    if (!response.ok) {
      // 获取错误详情
      const errorText = await response.text();
      let errorMsg = `服务器错误: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg += ` - ${errorJson.message || errorJson.error || errorText}`;
      } catch {
        errorMsg += ` - ${errorText}`;
      }
      throw new Error(errorMsg);
    }

    // 处理成功响应
    handleStream(response, callbacks.onData, callbacks.onCompleted);
  } catch (error) {
    console.error('发送消息时出错:', error);

    // 错误处理增强
    let errorMsg = '连接错误';
    if (error instanceof Error) {
      errorMsg = error.message;

      // 针对不同类型错误提供更具体的错误信息
      if (error.name === 'AbortError') {
        errorMsg = '请求超时，请检查网络连接或增加超时时间';
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = 'API连接失败，请检查网络和API配置';
      } else if (error.message.includes('意外终止了连接')) {
        errorMsg = '服务器连接意外中断，可能是防火墙或超时设置问题';
      }
    }

    callbacks.onError && callbacks.onError(errorMsg);
  }
};

// 获取历史对话
export const fetchConversationHistory = async (conversationId: string) => {
  const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY || '';
  const baseUrl = process.env.NEXT_PUBLIC_DIFY_BASE_URL || '';

  try {
    const response = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': ContentType.json,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取对话历史失败');
    }

    return await response.json();
  } catch (e) {
    console.error('获取对话历史出错:', e);
    throw e;
  }
};
