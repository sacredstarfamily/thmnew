/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase max listeners to prevent EventEmitter memory leak warnings in dev
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    // If using Turbopack, this might help, but for listeners:
  },
};

// If in development, increase process max listeners
if (process.env.NODE_ENV === 'development') {
  process.setMaxListeners(20);
}

module.exports = nextConfig;
