// components/SelectionBox.tsx
'use client';

import { FC } from 'react';
import { MdChangeCircle } from 'react-icons/md';
import SelectionGrid from './SelectionGrid';
import Image from 'next/image';

type GridItem = {
  _id: string;
  name: string;
  image: string;
  description?: string;
};

type SelectableBlockProps = {
  label?: string;
  name?: string,
  image?: string;
  items: GridItem[];
  type: 'character' | 'weapon' | 'stage' | 'announcer';
  selectedId?: string;
  onChange: (item: GridItem) => void;

  // NEW: sizeClass controls width/height of this box’s image container
  sizeClass?: string;

  // Controls which grid is open (lifted state from parent)
  boxId: string;
  isOpen: boolean;
  onToggle: (boxId: string) => void;
  placement: 'left' | 'right';
};

const SelectionBox: FC<SelectableBlockProps> = ({
  label,
  name,
  image,
  items,
  type,
  onChange,
  selectedId,
  sizeClass = 'w-40 h-40', // default size if not provided
  boxId,
  isOpen,
  onToggle,
  placement,
}) => {
  return (
    <div className="relative w-fit">
      <div className="text-xl mb-2">{label}</div>

      <div className={`relative ${sizeClass} rounded-lg overflow-hidden bg-gray-700`}>
        {image ? (
          // Fill the container, preserving aspect via object-cover
          <img
            src={image}
            alt={label}
            className="object-cover"
          />
        ) : (
          // Empty placeholder
          <div className="w-full h-full bg-gray-800" />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
              <p className="text-white text-lg font-bold truncate">{name}</p>
            </div>

        <button
          onClick={() => onToggle(boxId)}
          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 z-10"
          >
          <MdChangeCircle size={24} color="white" className='cursor-pointer' />
        </button>
      </div>
          

      {isOpen && (
        <div
          className={
            placement === 'right'
              ? 'absolute left-full ml-2 top-0 z-50 bg-black p-2 rounded shadow-xl min-w-[400px] max-w-[90vw]'
              : 'absolute right-full mr-2 top-0 z-50 bg-black p-2 rounded shadow-xl min-w-[400px] max-w-[90vw]'
          }
        >
          <SelectionGrid
            items={items.map((i) => ({
              _id: i._id,
              name: i.name,
              image: i.image,
              description: i.description || i.name,
            }))}
            type={type}
            onSelect={(item: GridItem) => {
              onChange(item);
              onToggle(''); // close grid
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SelectionBox;
