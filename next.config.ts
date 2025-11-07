import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Tắt kiểm tra ESLint trong quá trình build (warnings vẫn hiện trong dev)
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Bỏ qua một số type errors không quan trọng trong build
    // Chỉ nên dùng khi cần deploy gấp
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
