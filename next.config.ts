import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chatjlptbackend-production.up.railway.app';
    if (!API_URL.startsWith('http')) {
      API_URL = `https://${API_URL}`;
    }
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
