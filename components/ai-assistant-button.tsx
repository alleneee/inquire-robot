'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

export default function AIAssistantButton() {
  const [showChat, setShowChat] = useState(false);
  
  // 处理按钮点击
  const handleClick = () => {
    setShowChat(!showChat);
  };
  
  // 处理iframe加载
  useEffect(() => {
    // 清理函数，组件卸载时移除聊天界面
    return () => {
      const chatContainer = document.getElementById('ai-chat-container');
      if (chatContainer) {
        document.body.removeChild(chatContainer);
      }
    };
  }, []);
  
  // 当showChat状态变化时，显示或隐藏聊天界面
  useEffect(() => {
    let chatContainer = document.getElementById('ai-chat-container');
    
    if (showChat) {
      // 如果聊天界面不存在，创建它
      if (!chatContainer) {
        chatContainer = document.createElement('div');
        chatContainer.id = 'ai-chat-container';
        chatContainer.style.cssText = `
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s ease;
        `;
        
        // 创建头部栏
        const header = document.createElement('div');
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #1C64F2;
          color: white;
        `;
        
        // 添加标题
        const title = document.createElement('div');
        title.innerHTML = '<strong>AI咨询助手</strong>';
        header.appendChild(title);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        `;
        closeButton.onclick = () => setShowChat(false);
        header.appendChild(closeButton);
        
        chatContainer.appendChild(header);
        
        // 创建iframe
        const iframe = document.createElement('iframe');
        iframe.src = 'http://115.190.43.2/chat/KOKgh8ipArE9qYEY?hide_sidebar=true';
        iframe.style.cssText = `
          width: 100%;
          height: calc(100% - 48px);
          border: none;
        `;
        chatContainer.appendChild(iframe);
        
        document.body.appendChild(chatContainer);
      } else {
        // 如果已经存在，只需显示它
        chatContainer.style.display = 'block';
      }
    } else {
      // 隐藏聊天界面
      if (chatContainer) {
        chatContainer.style.display = 'none';
      }
    }
  }, [showChat]);
  
  return (
    <Button 
      onClick={handleClick} 
      size="lg" 
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ml-2"
    >
      <Bot className="mr-2 h-5 w-5" /> AI咨询助手
    </Button>
  );
}
