import path from "path";
import type { NextConfig } from "next";

const reactQueryRoot = path.dirname(
  require.resolve("@tanstack/react-query/package.json")
);
const queryCoreRoot = path.dirname(
  require.resolve("@tanstack/query-core/package.json")
);

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@tanstack/react-query", "@tanstack/query-core"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tanstack/react-query$": path.join(reactQueryRoot, "src/index.ts"),
      "@tanstack/query-core$": path.join(queryCoreRoot, "src/index.ts"),
    };

    return config;
  },
};

export default nextConfig;
