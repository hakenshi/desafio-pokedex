import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https",
        port: ''
      }
    ]
  }
};

export default nextConfig;
