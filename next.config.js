/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['secure.gravatar.com'],
  },
  webpack: (config) => {
    // TypeORM with webpack 5 needs these polyfills
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
      "child_process": false,
      "mysql": false,
      "@sap/hana-client/extension/Stream": false,
      "react-native-sqlite-storage": false,
    };
    
    // Prevent TypeORM circular dependencies
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    });
    
    return config;
  },
  // // Add experimental settings for App Router
  // experimental: {
  //   appDir: true,
  //   esmExternals: 'loose', // This helps with ESM/CJS compatibility issues
  // },
}

module.exports = nextConfig