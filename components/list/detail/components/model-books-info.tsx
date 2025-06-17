"use client"

import { ExternalLink } from "lucide-react"
import { ModelBook } from "../../add-model/hooks/use-model-books"

interface ModelBooksInfoProps {
  books: ModelBook[]
}

export function ModelBooksInfo({ books = [] }: ModelBooksInfoProps) {
  // Ne rien afficher s'il n'y a pas de books
  if (!books.length) {
    return null
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-2">Books & Portfolios</p>
      <div className="space-y-1">
        {books.map((book) => (
          <a 
            key={book.id}
            href={book.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <span className="truncate">{book.name}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  )
} 