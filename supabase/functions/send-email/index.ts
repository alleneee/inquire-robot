import { Resend } from "npm:resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { company, name, phone, email, description } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { data, error } = await resend.emails.send({
      from: "DataSmith.AI <onboarding@resend.dev>",
      to: ["herchejane@gmail.com"],
      subject: `新咨询请求：${company}`,
      html: `
        <h2>新的咨询请求</h2>
        <p><strong>公司名称：</strong> ${company}</p>
        <p><strong>联系人：</strong> ${name}</p>
        <p><strong>联系电话：</strong> ${phone}</p>
        <p><strong>电子邮箱：</strong> ${email}</p>
        <p><strong>需求描述：</strong></p>
        <p>${description}</p>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "邮件发送成功" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "邮件发送失败" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});