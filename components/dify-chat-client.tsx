'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { DEFAULT_USER } from '@/config';
import { sendChatMessage, IOnDataMoreInfo } from '@/services/dify-service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DifyChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 使用Dify服务发送聊天消息
      await sendChatMessage(
        {
          query: userMessage,
          inputs: {},
          conversation_id: currentConversationId,
          user: DEFAULT_USER,
        },
        {
          onData: (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
            if (isFirstMessage) {
              setMessages(prev => [...prev, { role: 'assistant', content: message }]);
              
              // 保存对话ID用于后续消息
              if (moreInfo.conversationId) {
                setCurrentConversationId(moreInfo.conversationId);
              }
            } else {
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  const updatedMessages = [...prev];
                  updatedMessages[prev.length - 1] = {
                    ...lastMessage,
                    content: message,
                  };
                  return updatedMessages;
                }
                return [...prev, { role: 'assistant', content: message }];
              });
            }
          },
          onCompleted: () => {
            setIsLoading(false);
          },
          onError: (errMsg: string) => {
            console.error('发送消息失败:', errMsg);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: '抱歉，我遇到了一些问题。请稍后再试。' 
            }]);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('发送消息出错:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col bg-white/80 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            您好，我是您的AI助手，请问有什么可以帮您？
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-900">
              正在思考...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
