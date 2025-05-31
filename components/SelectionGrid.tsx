// components/SelectionGrid.tsx
'use client';

import React, { useState } from 'react';

type GridItem = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

type SelectionGridProps = {
  items: GridItem[];
  type: 'character' | 'weapon' | 'stage' | 'announcer';
  onSelect: (item: GridItem) => void;
};

export default function SelectionGrid({ items, type, onSelect }: SelectionGridProps) {
  const [hoveredItem, setHoveredItem] = useState<GridItem | null>(null);
  const isAnnouncer = type === 'announcer';
  const gridCols = isAnnouncer ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="w-full">
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((item) => (
          <div
            key={item._id}
            className="relative cursor-pointer hover:shadow-lg transition"
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 w-full bg-black/30 px-2 py-1 rounded-b-lg">
              <p className="text-white text-sm truncate">{item.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip/Dialog */}
      {hoveredItem && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mt-2 w-full p-4 rounded-md bg-gray-900 shadow-xl z-50">
          <h3 className="text-sm font-semibold text-white">{hoveredItem.name}</h3>
          <p className="text-xs text-gray-300">{hoveredItem.description}</p>
        </div>
      )}
    </div>
  );
}
