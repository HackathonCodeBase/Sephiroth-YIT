import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.42.0.1', '172.21.1.188', '10.239.23.158', '10.207.170.23', '0.0.0.0', 'localhost:3000'] as string[]
};

export default nextConfig;
