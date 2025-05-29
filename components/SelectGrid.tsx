'use client'

import React, { useState } from 'react'
import Image from 'next/image'

type GridItem = {
  id: string
  name: string
  description: string
  image: string
}

type SelectGridProps = {
  items: GridItem[]
  type: 'character' | 'weapon' | 'stage' | 'announcer'
  onSelect: (item: GridItem) => void
}

export default function SelectGrid({ items, type, onSelect }: SelectGridProps) {
  const [hoveredItem, setHoveredItem] = useState<GridItem | null>(null)
  const isAnnouncer = type === 'announcer'
  const gridCols = isAnnouncer ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="relative">
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((item) => (
          <div
            key={item.id}
            className="relative cursor-pointer border border-gray-300 rounded-lg p-2 hover:shadow-lg transition"
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={100}
              height={100}
              className="w-full h-24 object-contain"
            />
          </div>
        ))}
      </div>

      {/* Tooltip/Dialog */}
      {hoveredItem && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-64 p-4 rounded-md bg-white shadow-xl border z-50">
          <h3 className="text-sm font-semibold">{hoveredItem.name}</h3>
          <p className="text-xs text-gray-600">{hoveredItem.description}</p>
        </div>
      )}
    </div>
  )
}
