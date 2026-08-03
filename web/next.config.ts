import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

// Pin Turbopack to this package so the parent repo package.json is not
// treated as the workspace root (which breaks resolving `next`).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
