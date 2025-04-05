'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatClient } from 'dify-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    // 不再添加硬编码的欢迎消息，而是等待Dify的开场白
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化Dify客户端
  const difyClient = new ChatClient(
    process.env.NEXT_PUBLIC_DIFY_API_KEY || '',
    process.env.NEXT_PUBLIC_DIFY_BASE_URL || ''
  );

  // 获取Dify的开场白
  useEffect(() => {
    const fetchDifyGreeting = async () => {
      try {
        // 发送空消息来获取开场白
        const greetingResponse = await difyClient.createChatMessage(
          {}, // inputs: 可选的输入参数
          "", // 空查询以获取开场白
          "web-user", // user
          false, // stream
          null // conversation_id
        );

        if (greetingResponse.answer) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: greetingResponse.answer
          }]);
        }
      } catch (error) {
        console.error('获取开场白失败:', error);
        // 如果获取失败，使用默认开场白
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "欢迎使用AI助手，有什么可以帮助您的？"
        }]);
      }
    };

    // 只在组件加载时执行一次
    fetchDifyGreeting();
  }, []);

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
      // 使用Dify客户端发送消息
      const chatResponse = await difyClient.createChatMessage(
        {}, // inputs: 可选的输入参数
        userMessage, // query
        "web-user", // user
        false, // stream
        null // conversation_id
      );

      if (chatResponse.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: chatResponse.answer }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col bg-white/80 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
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