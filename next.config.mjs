/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure proper handling of src directory
  experimental: {
    appDir: true,
  },
  // Set the source directory
  distDir: '.next',
  // Configure for Vercel deployment
  output: 'standalone',
}

export default nextConfig
