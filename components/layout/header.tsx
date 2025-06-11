"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import { UserMenu } from "@/components/auth/user-menu"

interface HeaderProps {
  onSearch?: (query: string) => void
  showSearch?: boolean
}

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }
  
  return (
    <div className="w-full flex items-center justify-between px-4 pb-2">
      <div>
        <UserMenu />
      </div>
      
      <div className="text-center">
                  <h1 className="text-4xl font-bold">Casting.io</h1>
        <p className="text-base text-muted-foreground mt-1">
        Simplifiez la gestion, sublimez vos talents.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {showSearch && (
          <SearchBar 
            isOpen={isSearchOpen}
            onToggle={handleToggleSearch}
            onSearch={handleSearch}
          />
        )}
        <ThemeToggle />
      </div>
    </div>
  )
} 