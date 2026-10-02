import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/chat": ["./docs/ai/*.md"],
  },
};

export default nextConfig;
