/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    const apiTarget = process.env.INTERNAL_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiTarget}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/surat-pembaca',
        destination: '/artikel',
        permanent: false,
      },
      {
        source: '/surat-pembaca/:slug*',
        destination: '/artikel',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
