import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  basePath: "/lightrag-directory",
  assetPrefix: "/lightrag-directory/",

  images: {
    unoptimized: true,
  },

  // Keep Turbopack scoped to this project instead of the parent workspace.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
