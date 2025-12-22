import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-supabase.arody.cloud',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
