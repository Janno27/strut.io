"use client"

import { useState } from "react"
import { Header } from "../components/layout/header"
import { ModelList } from "../components/list/model-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <Header onSearch={handleSearch} showSearch={true} />
            </div>
            
            <ModelList searchQuery={searchQuery} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
