import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(import.meta.dirname),
  },
  outputFileTracingRoot: path.join(import.meta.dirname),
};
export default nextConfig;