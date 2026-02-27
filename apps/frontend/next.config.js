const { execSync } = require('child_process');

function getAppVersion() {
  try {
    return execSync('git describe --tags --abbrev=0 2>/dev/null').toString().trim();
  } catch {
    try {
      return execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim();
    } catch {
      return 'dev';
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removed 'output: standalone' - causes issues with dynamic routes on Vercel
  // Force rebuild to clear Vercel cache - 2026-02-07
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: getAppVersion(),
  },
};

module.exports = nextConfig;
