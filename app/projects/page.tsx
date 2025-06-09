import { Header } from "@/components/layout/header"
import { ProjectTabs } from "@/components/projects/project-tabs"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header />
          </div>
          
          <ProjectTabs />
        </div>
      </main>
    </div>
  )
} 