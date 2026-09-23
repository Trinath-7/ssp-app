import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/loans',
        destination: '/',
        permanent: false,
      },
      {
        source: '/properties',
        destination: '/vehicles',
        permanent: false,
      },
      {
        source: '/payments',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
