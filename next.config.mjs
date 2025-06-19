/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/screenshots/:path*',
        destination: '/screenshots/:path*'
      }
    ]
  }
}

export default nextConfig;
