/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['secure.gravatar.com'],
  },
  webpack: (config) => {
    // TypeORM with webpack 5 needs this polyfill
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "buffer": require.resolve("buffer"),
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "child_process": false
    };
    
    return config;
  },
}

module.exports = nextConfig
