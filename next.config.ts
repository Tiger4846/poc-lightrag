import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  basePath: "/directory",
  assetPrefix: "/directory/",

  images: {
    unoptimized: true,
  },

  // Use Turbopack (Next.js 16 default)
  // Empty config to silence the migration warning
  turbopack: {},
};

export default nextConfig;
