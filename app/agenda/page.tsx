import { Header } from "@/components/layout/header"
import { AgendaTabs } from "@/components/agenda/agenda-tabs"

export default function AgendaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header showSearch={false} />
          </div>
          
          <AgendaTabs />
        </div>
      </main>
    </div>
  )
} 