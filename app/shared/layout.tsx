import { Header } from "../../components/layout/header"
import { Toaster } from "sonner"

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header />
          </div>
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  )
} 