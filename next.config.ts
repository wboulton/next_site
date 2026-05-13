import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal standalone server bundle in .next/standalone that the
  // Dockerfile's runner stage copies. See https://nextjs.org/docs/app/api-reference/next-config-js/output
  output: 'standalone',
};

export default nextConfig;
