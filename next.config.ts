import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            new URL("https://avatars.githubusercontent.com"),
            new URL("https://store_EVCcia5iGubdl64l.public.blob.vercel-storage.com/**"),
        ],
    },
};

export default nextConfig;
