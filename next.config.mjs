/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features if needed
    experimental: {
        // Add any experimental features here
    },
    // Configure webpack for WASM support
    webpack: (config, { isServer }) => {
        // Add WASM support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        // Handle .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Fallback for Node.js modules in client-side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        return config;
    },
    // Add headers for WASM cross-origin isolation if needed
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;