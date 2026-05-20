// Configuración de Next.js.
// output: 'standalone' genera un bundle autocontenido para despliegue en Docker.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // necesario para el Dockerfile multistage
}

module.exports = nextConfig
