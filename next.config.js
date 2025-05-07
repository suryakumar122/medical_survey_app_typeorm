/** @type {import('next').NextConfig} */
const path = require('path');
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
}

// // Initialize database connection
// if (process.env.NODE_ENV !== 'production') {
//   console.log('Importing database initialization in development mode');
//  try {
//   require(path.resolve('./lib/dbInit.ts'));
// } catch (error) {
//   console.error('Failed to load database initialization:', error);
// }
// }

module.exports = nextConfig