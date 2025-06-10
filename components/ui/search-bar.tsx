"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  isOpen: boolean
  onToggle: () => void
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ 
  isOpen, 
  onToggle, 
  onSearch, 
  placeholder = "Rechercher..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Mettre le focus sur l'input quand la barre s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Gérer les changements de recherche
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    onSearch(newQuery)
  }

  // Effacer la recherche
  const handleClear = () => {
    setQuery("")
    onSearch("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Gérer la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle()
        setQuery("")
        onSearch("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onToggle, onSearch])

  return (
    <div className="relative flex items-center">
      {/* Bouton de recherche */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className={`rounded-full hover:bg-muted/50 transition-all duration-200 ${
          isOpen ? 'bg-muted/30' : ''
        }`}
        title="Rechercher"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Barre de recherche animée */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: 10 }}
            animate={{ width: "200px", opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 10 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.8
            }}
            className="absolute right-11 top-0 z-10"
          >
            <motion.div 
              className="relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.15 }}
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleQueryChange}
                className="w-full h-9 pl-3 pr-8 text-sm rounded-full border border-border/40 bg-background/98 backdrop-blur-md shadow-sm focus:shadow-lg focus:border-primary/40 focus-visible:outline-none transition-all duration-200 placeholder:text-muted-foreground/50"
              />
              <AnimatePresence>
                {query && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full p-0 hover:bg-muted/60 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 