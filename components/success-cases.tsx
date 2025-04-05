'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CaseItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
}

const caseItems: CaseItem[] = [
    {
        id: 'customer-service',
        title: '智能客服系统',
        subtitle: '某头部电商平台',
        description: '实现7*24小时智能响应，提升客服效率300%',
        imageUrl: 'https://source.unsplash.com/random/800x600/?customer-service',
    },
    {
        id: 'data-analytics',
        title: '数据分析平台',
        subtitle: '某跨境电商企业',
        description: '整合多平台数据，实现实时决策支持',
        imageUrl: 'https://source.unsplash.com/random/800x600/?data-analytics',
    },
    {
        id: 'chat-robot',
        title: '对话机器人',
        subtitle: '某金融科技公司',
        description: '24小时自动回答客户问询，提高转化率150%',
        imageUrl: 'https://source.unsplash.com/random/800x600/?chat-bot',
    },
    {
        id: 'marketing',
        title: '智能营销系统',
        subtitle: '某零售连锁品牌',
        description: '个性化推荐引擎，提升销售额达40%',
        imageUrl: 'https://source.unsplash.com/random/800x600/?marketing',
    }
];

export default function SuccessCases() {
    return (
        <div className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">成功案例</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {caseItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="relative h-64 w-full">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    unoptimized={true} // 使用Unsplash随机图片，不需要Next.js优化
                                />
                            </div>
                            <CardHeader>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.subtitle}</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
} 