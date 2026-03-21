import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.join(import.meta.dirname),

  turbopack: {
    root: path.join(import.meta.dirname),
  },
};

export default nextConfig;