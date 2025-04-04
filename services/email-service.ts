// 定义邮件数据接口
interface EmailData {
  company: string;
  name: string;
  phone: string;
  email: string;
  description: string;
}

/**
 * 发送邮件服务
 * 使用Next.js API路由发送邮件
 */
export const sendEmail = async (data: EmailData) => {
  try {
    // 验证所有必要字段是否存在
    const { company, name, phone, email, description } = data;
    
    if (!company || !name || !phone || !email || !description) {
      console.error('缺少必要字段:', { company, name, phone, email, description });
      return { success: false, error: { error: '缺少必要字段', details: '请确保填写所有必要字段' } };
    }
    
    console.log('发送邮件数据:', data);
    
    // 使用Next.js API路由发送邮件
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('API响应错误:', result);
      throw new Error(result.error || '发送邮件失败');
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('发送邮件失败:', error);
    return { success: false, error };
  }
};
