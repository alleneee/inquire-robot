'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, MessageSquare, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Consultation() {
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

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "专业团队",
      description: "资深开发团队，丰富项目经验"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "快速响应",
      description: "24小时内专人跟进需求"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "定制方案",
      description: "根据企业需求量身定制"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "持续支持",
      description: "项目交付后持续技术支持"
    }
  ];

  const contactMethods = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "电话咨询",
      content: "18621042158",
      description: "工作日 9:00-22:00"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "邮件咨询",
      content: "herchejane@gmail.com",
      description: "24小时内回复"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl">
              <Zap className="w-8 h-8" />
              <span className="text-xl font-bold ml-2">DataSmith.AI</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            预约咨询
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            我们期待与您深入交流，为您的企业提供最适合的解决方案
          </p>

          {/* Contact Form */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm mb-12">
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

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-lg font-semibold ml-3">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-primary text-lg font-semibold mb-2">{method.content}</p>
                <p className="text-muted-foreground">{method.description}</p>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="mt-12 p-6 bg-white/80 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">驻场服务</h3>
            <p className="text-muted-foreground">
              我们提供深度化定制服务和开发服务，可根据您的需求安排专业团队进行驻场支持，确保项目顺利实施。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}