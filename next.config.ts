import type { NextConfig } from "next";

// Suppress the url.parse() deprecation warning from dependencies
if (process.env.NODE_ENV === 'development') {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = (warning: string | Error, ...args: unknown[]) => {
    if (
      typeof warning === 'string' &&
      warning.includes('url.parse()') &&
      warning.includes('DEP0169')
    ) {
      return;
    }
    // @ts-expect-error - emitWarning has complex overloads
    return originalEmitWarning.call(process, warning, ...args);
  };
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Suppress known deprecation warning from PayPal SDK's follow-redirects
  webpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /follow-redirects/,
          message: /DEP0169/,
        },
      ]
    }
    return config
  },
};

export default nextConfig;
