/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/study',
        destination: '/theme/study',
        permanent: true,
      },
      {
        source: '/assignments',
        destination: '/theme/study-to-do',
        permanent: true,
      },
      {
        source: '/timetable',
        destination: '/theme/schedules',
        permanent: true,
      },
      {
        source: '/links',
        destination: '/theme/personal',
        permanent: true,
      },
      {
        source: '/media',
        destination: '/theme/personal',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
