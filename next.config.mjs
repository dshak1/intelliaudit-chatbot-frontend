import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Avoid picking ~/package-lock.json as monorepo root when a stray lockfile exists above this app
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig