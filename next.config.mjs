/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // Since we're using equirectangular images
  },
  // Handle Marzipano's legacy code
  webpack: (config) => {
    config.module.rules.push({
      test: /marzipano\.js$/,
      use: ["script-loader"],
    });
    return config;
  },
  // Optimize for production
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;