/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://admin-api-five-pi.vercel.app/api/:path*',
            },
            {
                source: '/uploads/:path*',
                destination: 'https://admin-api-five-pi.vercel.app/uploads/:path*',
            },
        ]
    },
}

module.exports = nextConfig
