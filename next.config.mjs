// next.config.mjs
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // PWA solo en prod
  register: true,
  skipWaiting: true,
  // runtimeCaching: require('./runtimeCaching.cjs'), // opcional, después
});

const nextConfig = {
  reactStrictMode: true,
  // NO uses experimental.appDir: ya no hace falta
};

export default withPWA(nextConfig);
