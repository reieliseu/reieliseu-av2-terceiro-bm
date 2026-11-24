import { basePath } from './config/site.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
}

export default nextConfig
