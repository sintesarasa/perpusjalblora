/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
    const sanitize = (val) => {
      if (!val || typeof val !== 'string') return '';
      const t = val.trim();
      return t === 'undefined' || t === 'null' ? '' : t;
    };
    const rawTarget =
      sanitize(process.env.INTERNAL_API_URL) ||
      sanitize(process.env.API_URL) ||
      sanitize(process.env.NEXT_PUBLIC_API_URL) ||
      'http://localhost:4000';
    const apiTarget = rawTarget.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
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
        source: '/admin/sirkulasi',
        destination: '/dashboard/sirkulasi',
        permanent: true,
      },
      {
        source: '/admin/kurasi',
        destination: '/dashboard/kurasi',
        permanent: true,
      },
      {
        source: '/admin/buku',
        destination: '/dashboard/buku',
        permanent: true,
      },
      {
        source: '/notifikasi',
        destination: '/dashboard/notifikasi',
        permanent: true,
      },
      {
        source: '/u/:username',
        destination: '/warga/:username',
        permanent: true,
      },
      {
        source: '/tulis',
        destination: '/dashboard/tulisan/tulis',
        permanent: true,
      },
      {
        source: '/tulis/:id',
        destination: '/dashboard/tulisan/tulis/:id',
        permanent: true,
      },
      {
        source: '/dashboard/tulis',
        destination: '/dashboard/tulisan/tulis',
        permanent: true,
      },
      {
        source: '/dashboard/tulis/:id',
        destination: '/dashboard/tulisan/tulis/:id',
        permanent: true,
      },
      {
        source: '/warta',
        destination: '/artikel',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
