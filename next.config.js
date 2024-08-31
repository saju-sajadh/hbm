/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
      appDir: true,
      typedRoutes: true,
    },
    rewrites: async () => {
      return [
      {
          source: '/api/:path*',
          destination:
          process.env.NEXT_PUBLIC_NODE_ENV === 'development'
              ? 'http://127.0.0.1:8000/api/:path*'
              : '/api/',
      },
      ]
  },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.pexels.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "a0.muscache.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "www.gstatic.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "firebasestorage.googleapis.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "img.clerk.com",
          port: "",
          pathname: "/**",
        },
      ],
    },
  };
  
  module.exports = nextConfig;
  
  