import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NFC Scanner - ETH Date",
  description: "Scan and interact with NFC tags using Web NFC API",
  keywords: "NFC, scanner, Web NFC API, NDEF, tags",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <MiniKitProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </MiniKitProvider>
    </html>
  );
}
