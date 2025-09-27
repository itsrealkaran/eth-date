/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        DEV: process.env.DEV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    },
    // Enable experimental features if needed
    experimental: {
        // Add any experimental features here
    },
};

export default nextConfig;