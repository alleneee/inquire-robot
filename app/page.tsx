'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, Brain, ChartBar, Clock, Code2, Database, FileCheck, MessageSquare, Notebook, Shield, Target, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AIAssistantButton from "@/components/ai-assistant-button";
import SuccessStories from "@/components/SuccessStories";

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 导入sendEmail服务
      const { sendEmail } = await import('@/services/email-service');
      const result = await sendEmail(formData);

      if (!result.success) {
        throw new Error('发送失败');
      }

      toast({
        title: "提交成功",
        description: "我们会尽快与您联系",
      });

      setFormData({
        company: '',
        name: '',
        phone: '',
        email: '',
        description: ''
      });
    } catch (error) {
      toast({
        title: "提交失败",
        description: "请稍后重试或直接联系我们",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: <Bot className="w-12 h-12 text-primary mb-4" />,
      title: "AI智能问答 & 数据对话",
      description: "支持钉钉/飞书集成，实现智能对话与数据分析"
    },
    {
      icon: <Database className="w-12 h-12 text-primary mb-4" />,
      title: "业务数据实时接入",
      description: "无缝对接ERP、CRM、订单、库存等系统数据"
    },
    {
      icon: <Target className="w-12 h-12 text-primary mb-4" />,
      title: "竞争对手数据监控",
      description: "实时监控市场动态，智能预警分析"
    },
    {
      icon: <Notebook className="w-12 h-12 text-primary mb-4" />,
      title: "RPA流程自动化",
      description: "智能审批通知，提升运营效率"
    }
  ];

  const serviceSteps = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "需求沟通",
      description: "深入了解您的业务需求"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "原型确认",
      description: "确保方案完全符合预期"
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "开发对接",
      description: "专业团队快速开发"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "私有化交付",
      description: "确保数据安全与隐私"
    }
  ];

  const advantages = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "开发周期短",
      description: "高效开发，快速交付"
    },
    {
      icon: <ChartBar className="w-8 h-8" />,
      title: "价格透明",
      description: "按需求定价，合理透明"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "私有化部署",
      description: "数据安全有保障"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "专业定制",
      description: "专注电商领域解决方案"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-12">
            <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl">
              <Zap className="w-8 h-8" />
              <span className="text-xl font-bold ml-2">DataSmith.AI</span>
            </div>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI驱动的电商智能化解决方案</h1>
            <p className="text-xl text-muted-foreground mb-8">
              为您提供AI+RPA+BI私有化定制开发，助力企业数字化转型
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}>
                预约咨询
              </Button>
              <Button variant="secondary" size="lg" className="bg-black text-white hover:bg-black/80" onClick={() => window.open('https://data-vista-command.lovable.app/', '_blank', 'noopener,noreferrer')}>
                查看Demo
              </Button>
              <AIAssistantButton />
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">核心服务</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                <div className="flex justify-center">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">合作流程</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {serviceSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-md">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">我们的优势</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  {advantage.icon}
                  <h3 className="text-xl font-semibold ml-3">{advantage.title}</h3>
                </div>
                <p className="text-muted-foreground">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <SuccessStories />
      </section>

      {/* Consultation Form Section */}
      <section id="consultation-form" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">预约咨询</h2>
          <div className="text-center mb-12">
            <p className="text-lg">
              <span className="font-medium">联系电话: </span>
              <a href="tel:18621042158" className="text-blue-600 hover:underline">18621042158</a>
              <span className="mx-3">|</span>
              <span className="font-medium">联系邮箱: </span>
              <a href="mailto:herchejane@gmail.com" className="text-blue-600 hover:underline">herchejane@gmail.com</a>
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">公司名称</label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="请输入公司名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">联系人</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入联系人姓名"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">联系电话</label>
                    <Input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">电子邮箱</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="请输入电子邮箱"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">需求描述</label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请简要描述您的需求"
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "提交中..." : "提交需求"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer with SEO Keywords (hidden) */}
      <footer className="bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
        <div className="sticky top-0 bg-white z-50 border-b">
          <div className="container mx-auto flex justify-between items-center py-4 px-4">
            <div className="flex items-center gap-2">
              <Zap className="text-primary h-6 w-6" />
              <span className="font-bold text-xl">智能AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#services" className="text-sm font-medium hover:text-primary">服务项目</Link>
              <Link href="#process" className="text-sm font-medium hover:text-primary">服务流程</Link>
              <Link href="#cases" className="text-sm font-medium hover:text-primary">成功案例</Link>
              <Link href="#consultation-form" className="text-sm font-medium hover:text-primary">联系我们</Link>
              <a href="https://data-vista-command.lovable.app/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800">了解更多</a>
            </div>
            <Button
              onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              获取方案
            </Button>
          </div>
          {/* 移除全局AI聊天组件，改为使用按钮触发 */}
        </div>
        {/* Hidden SEO Keywords */}
        <div className="hidden">
          电商AI开发,AI私有化定制,RPA流程自动化,BI数据看板开发,钉钉飞书Bot开发,
          电商业务数据接入,AI外包开发,AI运营平台私有化,电商流程自动化,AI Agent定制开发,
          企业AI数据服务,AI数字化运营平台,私有化部署AI解决方案,AI业务流程优化,企业AI助手定制
        </div>
      </footer>
    </div>
  );
}