/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  // 添加内容安全策略，允许从Dify服务加载iframe内容
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; frame-src 'self' http://115.190.43.2 https://115.190.43.2; connect-src 'self' http://115.190.43.2 https://115.190.43.2 https://*.dify.ai; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },

  // 配置代理，解决CORS问题
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://115.190.43.2/:path*' // 根据您的实际情况修改目标地址
      }
    ];
  }
};

module.exports = nextConfig;
