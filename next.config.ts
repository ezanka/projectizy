import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "store_EVCcia5iGubdl64l.public.blob.vercel-storage.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
