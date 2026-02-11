import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  // Resolve .js imports to .ts/.tsx (Turbopack doesn't support this; use --no-turbopack for dev)
  webpack: config => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
