import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.run",
      },
      {
        protocol: "https",
        hostname: "v3.fal.media",
      },
      { 
        protocol: "https",
        hostname: "v3b.fal.media",
      },
    ],
  },
};

export default nextConfig;