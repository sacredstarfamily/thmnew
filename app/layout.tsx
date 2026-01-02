import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {GoogleAnalytics} from '@next/third-parties/google';

import "./globals.css";
import PayPalProvider from "./context/paypal-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "themiracle.love",
  description: "Health and wellness through daily affirmations and the power of love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <GoogleAnalytics gaId="GT-NBXFK8QV" />
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  );
}
