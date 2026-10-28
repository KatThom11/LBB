import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', ...(process.env.LBB_DEV_ORIGIN ? [process.env.LBB_DEV_ORIGIN] : [])],
  devIndicators: false,
  experimental: { cpus: 2 },
};
export default config;
