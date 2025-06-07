import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cấu hình proxy cho API trong môi trường development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? '/api/:path*'
          : 'http://localhost:5000/api/:path*'
      }
    ]
  },

  // Cấu hình cho phép tối ưu hóa hình ảnh từ các domain
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },

  // Cấu hình bảo mật
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Cấu hình cho phép sử dụng các module bên ngoài
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default nextConfig 