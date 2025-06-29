import type { NextConfig } from 'next';
import { webpack } from 'next/dist/compiled/webpack/webpack';

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    inlineCss: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
      // Ignore the elizaos directory using checkResource
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore anything within the elizaos directory
          return /elizaos\//.test(context);
        },
      })
    );
    // Return modified config
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
          async_hooks: false,
          worker_threads: false,
        },
      },
    };
  },
  async redirects() {
    return [
      {
        source: '/start',
        destination: 'https://ai.eliza.how/eliza/',
        permanent: false,
      },
      {
        source: '/school',
        destination: 'https://www.youtube.com/playlist?list=PL0D_B_lUFHBKZSKgLlt24RvjJ8pavZNVh',
        permanent: false,
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/2bkryvK9Yu',
        permanent: false,
      },
      {
        source: '/profiles',
        destination: 'https://elizaos.github.io/profiles',
        permanent: false,
      },
      {
        source: '/bounties',
        destination: 'https://elizaos.github.io/website/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path(.*)',
        destination: 'https://us-assets.i.posthog.com/static/:path',
      },
      {
        source: '/ingest/:path(.*)',
        destination: 'https://us.i.posthog.com/:path',
      },
      {
        source: '/profiles/:path(.*)',
        destination: 'https://elizaos.github.io/profiles/:path',
      },
      {
        source: '/bounties/:path(.*)',
        destination: 'https://elizaos.github.io/website/:path',
      },
      {
        source: '/eliza/:path(.*)',
        destination: 'https://elizaos.github.io/eliza/:path',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
