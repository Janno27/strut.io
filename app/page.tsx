import { Header } from "./components/layout/header"
import { ModelList } from "./components/list/model-list"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header />
          </div>
          
          <ModelList />
        </div>
      </main>
    </div>
  )
}
