import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Casting.io - Partage de Mannequins",
  description: "Consultez les profils de mannequins partagés par votre agent",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  },
  manifest: "/site.webmanifest",
};

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12" id="shared-header-container">
                {/* Header sera injecté via portal depuis la page */}
              </div>
              {children}
              <Toaster />
            </div>
          </main>
        </div>
      </body>
    </html>
  )
} 