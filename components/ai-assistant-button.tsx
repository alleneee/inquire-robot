'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import DifyChatClient from './dify-chat-client';

export default function AIAssistantButton() {
  const [showChat, setShowChat] = useState(false);
  
  // 处理按钮点击
  const handleClick = () => {
    setShowChat(!showChat);
  };
  
  // 关闭聊天窗口
  const handleClose = () => {
    setShowChat(false);
  };
  
  return (
    <>
      <Button 
        onClick={handleClick} 
        size="lg" 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ml-2"
      >
        <Bot className="mr-2 h-5 w-5" /> AI咨询助手
      </Button>
      
      {showChat && (
        <div className="fixed right-5 bottom-5 w-[380px] z-50 shadow-xl">
          <Card className="overflow-hidden">
            {/* 聊天窗口头部 */}
            <div className="flex justify-between items-center p-3 bg-blue-600 text-white">
              <div className="font-bold flex items-center">
                <Bot className="mr-2 h-5 w-5" /> AI咨询助手
              </div>
              <button 
                onClick={handleClose}
                className="hover:bg-blue-700 rounded-full p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* 聊天客户端组件 */}
            <div className="h-[500px]">
              <DifyChatClient />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
