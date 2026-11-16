import type { NextConfig } from "next";

// Cache Components is intentionally off: caching uses unstable_cache +
// revalidateTag (see docs/reference/ARCHITECTURE.md §5.6).
const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
