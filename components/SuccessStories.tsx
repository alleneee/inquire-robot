import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

interface Story {
    title: string;
    description: string;
    imageUrl: string;
    altText: string;
}

// 使用正确的图片文件名
const stories: Story[] = [
    {
        title: "智能客服系统",
        description: "实现7x24小时智能客服，提升客户满意度80%",
        imageUrl: "/images/智能客服系统.png",
        altText: "智能客服系统"
    },
    {
        title: "数据分析平台",
        description: "整合全渠道数据，实现有效可视化分析",
        imageUrl: "/images/数据分析平台.png",
        altText: "数据分析平台"
    },
    {
        title: "对话机器人",
        description: "24小时自动回答客户问询，提高购物效率60%",
        imageUrl: "/images/对话机器人.png",
        altText: "对话机器人"
    },
    {
        title: "智能推荐系统",
        description: "个性化推荐引导，提升销售转化率40%",
        imageUrl: "/images/智能推荐系统.png",
        altText: "智能推荐系统"
    }
];

export default function SuccessStories() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">成功案例</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {stories.map((story) => (
                        <Card key={story.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="relative w-full h-64 mb-4">
                                    <Image
                                        src={story.imageUrl}
                                        alt={story.altText}
                                        fill
                                        style={{ objectFit: "contain" }}
                                        className="rounded-md"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">{story.title}</h3>
                                <p className="text-gray-600">{story.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
} 