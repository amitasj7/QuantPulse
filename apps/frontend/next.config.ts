import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: ["@quantpulse/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
