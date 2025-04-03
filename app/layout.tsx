import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI+RPA+BI 企业级解决方案 | 专注电商智能化服务',
  description: '为电商企业提供AI智能问答、RPA流程自动化、BI数据可视化等私有化定制开发服务。专业团队，快速交付，安全可靠。',
  keywords: '电商AI开发,AI私有化定制,RPA流程自动化,BI数据看板开发,钉钉飞书Bot开发,电商业务数据接入'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}