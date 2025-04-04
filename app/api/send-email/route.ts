import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// 创建一个支持Promise的函数来获取Ethereal测试账户
async function createTestAccount() {
  try {
    // 创建Ethereal测试账户
    return await nodemailer.createTestAccount();
  } catch (error) {
    console.error('创建Ethereal测试账户失败:', error);
    // 使用默认的Ethereal测试账户
    return {
      user: 'rick.hoppe22@ethereal.email',
      pass: 'cUCzPqDSsQz5YzXtEZ'
    };
  }
}

// 创建Gmail邮件发送器
function createGmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser || !gmailPassword) {
    throw new Error('未设置Gmail账户信息。请在.env.local文件中设置GMAIL_USER和GMAIL_APP_PASSWORD');
  }
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 使用TLS
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
}

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { company, name, phone, email, description } = body;
    
    // 验证必要字段
    if (!company || !name || !phone || !email || !description) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    // 邮件内容
    const mailOptions = {
      from: `"DataSmith.AI" <${process.env.GMAIL_USER}>`, // 使用标准格式的发件人
      to: process.env.GMAIL_USER, // 使用您的Gmail地址作为收件人
      subject: `新咨询请求：${company}`,
      html: `
        <h2>新的咨询请求</h2>
        <p><strong>公司名称：</strong> ${company}</p>
        <p><strong>联系人：</strong> ${name}</p>
        <p><strong>联系电话：</strong> ${phone}</p>
        <p><strong>电子邮箱：</strong> ${email}</p>
        <p><strong>需求描述：</strong></p>
        <p>${description}</p>
      `
    };

    // 检查是否使用真实邮件发送
    const useRealEmail = process.env.USE_REAL_EMAIL === 'true';
    let transporter;
    let info;
    let previewUrl = null;

    if (useRealEmail) {
      // 使用Gmail发送真实邮件
      console.log('使用Gmail发送真实邮件...');
      transporter = createGmailTransporter();
      info = await transporter.sendMail(mailOptions);
      console.log('邮件已发送，邮件ID:', info.messageId);
    } else {
      // 使用Ethereal测试账户
      console.log('使用Ethereal测试账户...');
      const testAccount = await createTestAccount();
      
      // 创建Ethereal transporter
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      info = await transporter.sendMail(mailOptions);
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('测试邮件URL: %s', previewUrl);
    }

    return NextResponse.json(
      { 
        message: '邮件发送成功', 
        data: info,
        previewUrl: previewUrl // 如果是测试邮件，返回预览URL
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('发送邮件错误:', error);
    return NextResponse.json(
      { error: '邮件发送失败' },
      { status: 500 }
    );
  }
}
