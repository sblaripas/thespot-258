"use client"

import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  icon: string
}

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "secondary"}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeCategory === category.id ? "category-btn active" : "category-btn"
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </Button>
      ))}
    </div>
  )
}
