import { NextRequest, NextResponse } from 'next/server';

/**
 * 代理API路由 - 用于解决跨域问题
 * 将请求转发到指定的URL并返回响应
 */
export async function GET(request: NextRequest) {
  try {
    // 从查询参数中获取目标URL
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: '缺少url参数' }, { status: 400 });
    }
    
    console.log(`[代理API] 转发GET请求到: ${url}`);
    
    // 转发请求
    const response = await fetch(url);
    
    // 从原始响应创建新的响应
    const data = await response.text();
    
    // 创建响应并保留原始响应的内容类型
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[代理API] 错误:', error);
    return NextResponse.json({ error: '代理请求失败' }, { status: 500 });
  }
}

/**
 * 处理POST请求
 */
export async function POST(request: NextRequest) {
  try {
    // 从查询参数中获取目标URL
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: '缺少url参数' }, { status: 400 });
    }
    
    console.log(`[代理API] 转发POST请求到: ${url}`);
    
    // 从请求中获取body
    let body: ArrayBuffer | string | null = null;
    const contentType = request.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await request.json());
    } else {
      body = await request.arrayBuffer();
    }
    
    // 获取原始请求的headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // 排除一些特定的header，避免CORS问题
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    });
    
    // 转发请求
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    
    // 判断响应类型
    const contentTypeResponse = response.headers.get('Content-Type') || '';
    
    // 创建响应
    if (contentTypeResponse.includes('text/event-stream')) {
      // 对于流式响应，我们需要特殊处理
      const reader = response.body?.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          if (!reader) return controller.close();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            controller.enqueue(value);
          }
          
          controller.close();
        },
      });
      
      return new NextResponse(stream, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 对于非流式响应
      const data = await response.text();
      
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentTypeResponse,
        },
      });
    }
  } catch (error) {
    console.error('[代理API] 错误:', error);
    return NextResponse.json({ error: '代理请求失败' }, { status: 500 });
  }
}
