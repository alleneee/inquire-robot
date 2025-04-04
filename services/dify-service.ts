import { API_PREFIX } from '@/config';

export type IOnDataMoreInfo = {
  conversationId: string | undefined;
  messageId: string;
  errorMessage?: string;
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
  
  function read() {
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted && onCompleted();
        return;
      }
      
      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split('\n');
      
      try {
        lines.forEach((message) => {
          if (!message || message === '')
            return;
            
          if (message.startsWith('data: ')) {
            const data = message.substring(6);
            if (data === '[DONE]') {
              onCompleted && onCompleted();
              return;
            }
            
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.event === 'message') {
                const text = parsedData.answer || '';
                onData(
                  text,
                  isFirstMessage,
                  {
                    conversationId: parsedData.conversation_id,
                    messageId: parsedData.id || '',
                  },
                );
                isFirstMessage = false;
              }
            } catch (e) {
              console.error('解析消息失败:', e);
            }
          }
        });
        
        // 保留最后一行，它可能是不完整的
        const lastLineIndex = lines.length - 1;
        if (lines[lastLineIndex])
          buffer = lines[lastLineIndex];
        else
          buffer = '';
      } catch (e) {
        console.error('处理消息时出错:', e);
        buffer = '';
      }
      
      read();
    }).catch((e) => {
      console.error('读取流时出错:', e);
      onCompleted && onCompleted();
    });
  }
  
  read();
};

// 发送聊天消息的函数
export const sendChatMessage = async (
  params: {
    query: string;
    inputs?: Record<string, any>;
    conversation_id?: string;
    user?: string;
  }, 
  callbacks: {
    onData: IOnData;
    onCompleted?: IOnCompleted;
    onError?: IOnError;
  }
) => {
  const { onData, onCompleted, onError } = callbacks;
  const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY || '';
  const baseUrl = process.env.NEXT_PUBLIC_DIFY_BASE_URL || '';
  
  try {
    const response = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': ContentType.json,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...params,
        response_mode: 'streaming',
      }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      onError && onError(errText);
      return;
    }
    
    handleStream(response, onData, onCompleted);
  } catch (e: any) {
    onError && onError(e.message || '发送消息失败');
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
