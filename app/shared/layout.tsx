import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Partage de Mannequins - Strut.io",
  description: "Consultez les profils de mannequins partagés par votre agent",
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