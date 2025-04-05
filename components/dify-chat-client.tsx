'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { DEFAULT_USER } from '@/config';
import { sendChatMessage, IOnDataMoreInfo } from '@/services/dify-service';

type MessageType = 'text' | 'thought' | 'file';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: MessageType;
  metadata?: {
    thought?: string;
    observation?: string;
    tool?: string;
    toolInput?: string;
    files?: string[];
  };
  id?: string;
}

export default function DifyChatClient(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 调试日志：渲染时输出消息状态
  useEffect(() => {
    if (messages.length > 0) {
      console.log('当前消息状态:',
        messages.map(m => ({
          id: m.id,
          role: m.role,
          contentLength: m.content.length,
          contentPreview: m.content.substring(0, 15) + '...'
        }))
      );
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    console.log('发送用户消息:', userMessage);

    // 生成唯一ID用于用户消息
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      type: 'text',
      id: userMsgId
    }]);
    console.log('添加用户消息，ID:', userMsgId);

    // 清除上一次的助手消息ID，确保每次对话都创建新消息
    setCurrentAssistantMessageId('');

    setIsLoading(true);

    // 环境变量检查
    const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_DIFY_BASE_URL;

    console.log('环境变量检查:', {
      'API_KEY存在': !!apiKey,
      'BASE_URL存在': !!baseUrl,
      'BASE_URL值': baseUrl
    });

    if (!apiKey || !baseUrl) {
      console.error('环境变量缺失:', { apiKey: !!apiKey, baseUrl: !!baseUrl });
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: '配置错误：环境变量缺失，请检查NEXT_PUBLIC_DIFY_API_KEY和NEXT_PUBLIC_DIFY_BASE_URL',
        type: 'text' as const,
        id: `error-${Date.now()}`
      }]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('开始发送消息到Dify API:', {
        用户消息: userMessage,
        会话ID: currentConversationId || '新会话'
      });

      // 发送消息到Dify API
      await sendChatMessage(
        {
          query: userMessage,
          conversation_id: currentConversationId,
          inputs: {}, // 可以添加其他参数
          user: 'user', // 可以自定义用户标识
        },
        {
          onData: (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
            // 断点调试
            console.log(`接收消息 [${isFirstMessage ? '首条' : '更新'}]:`, {
              messageLength: message.length,
              消息ID: moreInfo.messageId,
              事件类型: moreInfo.eventType,
              是否完成: moreInfo.isComplete,
              消息前10个字符: message.substring(0, 10)
            });

            // 保存对话ID
            if (moreInfo.conversationId) {
              console.log('设置会话ID:', moreInfo.conversationId);
              setCurrentConversationId(moreInfo.conversationId);
            }

            // 获取事件类型
            const eventType = moreInfo.eventType || 'message';

            // 根据事件类型处理
            switch (eventType) {
              case 'message':
              case 'agent_message':
                // 记录可能的消息ID并修复跟踪
                const apiMessageId = moreInfo.messageId || '';
                if (apiMessageId) {
                  console.log('使用API消息ID:', apiMessageId);
                  setCurrentAssistantMessageId(apiMessageId);
                } else if (isFirstMessage) {
                  // 如果是第一条消息但没有ID，创建一个新ID
                  const newId = `assistant-${Date.now()}`;
                  console.log('创建新的消息ID:', newId);
                  setCurrentAssistantMessageId(newId);
                }

                // 核心逻辑：使用服务端提供的已经累积好的完整消息
                const useMessageId = apiMessageId || currentAssistantMessageId || `assistant-${Date.now()}`;

                try {
                  if (isFirstMessage) {
                    // 如果是第一条消息，添加新消息
                    console.log('创建新助手消息，ID:', useMessageId);
                    setMessages(prev => {
                      // 使用正确的类型
                      const newMsg: Message = {
                        role: 'assistant' as const, // 使用as const确保类型正确
                        content: message,
                        type: 'text' as const,
                        id: useMessageId
                      };
                      console.log('新消息内容:', newMsg);
                      return [...prev, newMsg];
                    });
                  } else {
                    // 极简更新逻辑
                    console.log('更新最后一条助手消息，使用的消息ID:', useMessageId);

                    setMessages(prev => {
                      // 首先尝试通过ID查找消息
                      let targetIndex = prev.findIndex(msg => msg.id === useMessageId);

                      // 如果找不到指定ID的消息，则查找最后一条助手消息
                      if (targetIndex === -1) {
                        for (let i = prev.length - 1; i >= 0; i--) {
                          if (prev[i].role === 'assistant' && prev[i].type === 'text') {
                            targetIndex = i;
                            break;
                          }
                        }
                      }

                      if (targetIndex !== -1) {
                        // 找到目标消息，更新它
                        const updatedMessages = [...prev];
                        console.log('更新前消息内容:', updatedMessages[targetIndex].content);
                        // 更新消息内容
                        updatedMessages[targetIndex] = {
                          ...updatedMessages[targetIndex],
                          content: message
                        };
                        console.log('更新后的消息内容:', message.substring(0, 20) + '...');
                        return updatedMessages;
                      } else {
                        // 没找到目标消息，添加新的
                        console.log('未找到目标消息，添加新消息');
                        const newMsg: Message = {
                          role: 'assistant' as const,
                          content: message,
                          type: 'text' as const,
                          id: useMessageId
                        };
                        return [...prev, newMsg];
                      }
                    });
                  }
                } catch (error) {
                  console.error('消息处理错误:', error);
                }
                break;

              case 'agent_thought':
                // 处理Agent思考步骤
                setMessages(prev => {
                  // 检查是否已经存在相同ID的思考消息
                  const existingThoughtIndex = prev.findIndex(
                    msg => msg.type === 'thought' && msg.metadata?.thought === moreInfo.thought
                  );

                  if (existingThoughtIndex !== -1) {
                    return prev; // 如果已存在相同的思考，不重复添加
                  }

                  return [...prev, {
                    role: 'assistant',
                    content: message,
                    type: 'thought',
                    id: `thought-${Date.now()}`,
                    metadata: {
                      thought: moreInfo.thought || '',
                      observation: moreInfo.observation || '',
                      tool: moreInfo.tool || '',
                      toolInput: moreInfo.toolInput || '',
                      files: moreInfo.files || []
                    }
                  }];
                });
                break;

              case 'message_file':
                // 处理文件事件
                setMessages(prev => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: '文件已生成',
                    type: 'file',
                    id: `file-${Date.now()}`,
                    metadata: {
                      files: moreInfo.files || []
                    }
                  }
                ]);
                break;

              case 'message_end':
                // 消息结束事件，确保UI已更新完成
                console.log('消息结束事件，最终消息长度:', message.length);
                // 确保最后一条消息内容是完整的
                setMessages(prev => {
                  // 首先尝试根据ID查找消息
                  let messageIndex = -1;

                  // 如果有当前助手消息ID，先根据ID查找
                  if (currentAssistantMessageId) {
                    messageIndex = prev.findIndex(msg => msg.id === currentAssistantMessageId);
                  }

                  // 如果找不到，则查找最后一条助手消息
                  if (messageIndex === -1) {
                    for (let i = prev.length - 1; i >= 0; i--) {
                      if (prev[i].role === 'assistant' && prev[i].type === 'text') {
                        messageIndex = i;
                        break;
                      }
                    }
                  }

                  if (messageIndex !== -1) {
                    const updatedMessages = [...prev];
                    console.log('消息结束前内容:', updatedMessages[messageIndex].content);
                    updatedMessages[messageIndex] = {
                      ...updatedMessages[messageIndex],
                      content: message,
                      type: 'text'
                    };
                    console.log('消息结束：更新最终内容，长度:', message.length);
                    return updatedMessages;
                  }
                  return prev;
                });

                // 消息结束后，确保重置加载状态
                setIsLoading(false);
                break;

              default:
                // 默认处理为普通文本消息，使用与message/agent_message相同的逻辑
                console.log('未知事件类型，使用默认处理:', eventType);

                // 使用与message/agent_message相同的ID逻辑
                const defaultMessageId = moreInfo.messageId || currentAssistantMessageId || `assistant-${Date.now()}`;

                if (isFirstMessage) {
                  console.log('默认处理：创建新消息，ID:', defaultMessageId);
                  setMessages(prev => {
                    const newMsg: Message = {
                      role: 'assistant' as const,
                      content: message,
                      type: 'text' as const,
                      id: defaultMessageId
                    };
                    return [...prev, newMsg];
                  });

                  // 存储消息ID用于后续更新
                  setCurrentAssistantMessageId(defaultMessageId);
                } else {
                  console.log('默认处理：更新现有消息');
                  setMessages(prev => {
                    // 查找最后一条助手消息
                    let lastAssistantIndex = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                      if (prev[i].role === 'assistant') {
                        lastAssistantIndex = i;
                        break;
                      }
                    }

                    if (lastAssistantIndex !== -1) {
                      // 找到了助手消息，更新它
                      const updatedMessages = [...prev];
                      updatedMessages[lastAssistantIndex] = {
                        ...updatedMessages[lastAssistantIndex],
                        content: message
                      };
                      return updatedMessages;
                    } else {
                      // 没找到助手消息，添加新的（罕见情况）
                      console.log('默认处理：未找到助手消息，添加新消息');
                      return [...prev, {
                        role: 'assistant',
                        content: message,
                        type: 'text',
                        id: defaultMessageId
                      }];
                    }
                  });
                }
                break;
            }
          },
          onCompleted: () => {
            console.log('流式响应完成，设置isLoading为false');
            setIsLoading(false);
          },
          onError: (errMsg: string) => {
            console.error('API错误:', errMsg);
            setIsLoading(false);

            // 增强错误信息显示
            let errorContent = '抱歉，我遇到了一些问题。';

            // 根据错误类型提供更具体的信息
            if (errMsg.includes('超时')) {
              errorContent = '连接超时，请检查网络状况并稍后重试。';
            } else if (errMsg.includes('连接被中断') || errMsg.includes('意外终止')) {
              errorContent = '服务器连接被中断，可能是防火墙设置或网络不稳定导致。';
            } else if (errMsg.includes('API连接失败')) {
              errorContent = 'API连接失败，请确认服务器地址和配置是否正确。';
            } else if (errMsg.includes('401')) {
              errorContent = 'API密钥认证失败，请检查密钥配置。';
            } else if (errMsg.includes('403')) {
              errorContent = '访问被拒绝，请检查API权限设置。';
            } else if (errMsg.includes('429')) {
              errorContent = 'API请求过于频繁，请稍后再试。';
            } else if (errMsg.includes('500')) {
              errorContent = 'API服务器内部错误，请联系服务提供商。';
            }

            // 添加具体错误信息，便于调试
            if (process.env.NODE_ENV === 'development') {
              errorContent += `\n\n错误详情: ${errMsg}`;
            } else {
              errorContent += ' 请稍后再试。';
            }

            // 添加错误消息到聊天记录
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: errorContent,
              type: 'text',
              id: `error-${Date.now()}`
            }]);
          }
        }
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `发送消息失败: ${error instanceof Error ? error.message : '未知错误'}, 请检查网络连接和API配置`,
        type: 'text',
        id: `error-${Date.now()}`
      }]);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-lg">
        <div className="font-medium text-lg">AI咨询助手</div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">你是谁</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm max-w-[80%] rounded-tl-none border border-gray-200">
              <p className="text-gray-800">
                我是你的咨询ai助手，有什么可以帮您
              </p>
            </div>
          </div>
        ) : (
          messages
            .filter(msg => msg.role === 'user' || (msg.role === 'assistant' && msg.type !== 'thought'))
            .map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex items-start mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm max-w-[80%] ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none ml-auto'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                >
                  {msg.type === 'file' ? (
                    <div>
                      <div className="font-medium mb-1">文件已生成</div>
                      {msg.metadata?.files && msg.metadata.files.length > 0 && (
                        <div className="mt-2">
                          {msg.metadata.files.map((fileId, idx) => (
                            <div key={idx} className="bg-blue-50 p-2 rounded mb-1 text-blue-800">
                              <a
                                href={`${process.env.NEXT_PUBLIC_DIFY_BASE_URL}/files/${fileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                查看文件 {idx + 1}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {msg.content && msg.content.length > 0 ?
                        (msg.content) :
                        (isLoading && msg.role === 'assistant' ? '加载中...' : '无内容')}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
        {isLoading && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            disabled={isLoading}
            className="rounded-full border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
