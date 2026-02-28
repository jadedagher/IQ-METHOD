import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The compiled/ directory is read at runtime by server components
  // and API routes. This is fine for Node.js runtime.
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
