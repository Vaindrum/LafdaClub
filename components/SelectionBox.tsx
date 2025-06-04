// components/SelectionBox.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { MdChangeCircle } from 'react-icons/md';
import SelectionGrid from './SelectionGrid';

type GridItem = {
  _id: string;
  name: string;
  image: string;
  description?: string;
};

type SelectableBlockProps = {
  label?: string;
  name?: string;
  image?: string;
  items: GridItem[];
  type: 'character' | 'weapon' | 'stage' | 'announcer';
  selectedId?: string;
  onChange: (item: GridItem) => void;

  // sizeClass controls the width/height of the image container
  sizeClass?: string;

  // Controls which grid is open
  boxId: string;
  isOpen: boolean;
  onToggle: (boxId: string) => void;

  // placement: "left" | "right" for desktop popover, or "center" for full-screen mobile.
  placement: 'left' | 'right' | 'center';
};

const SelectionBox: FC<SelectableBlockProps> = ({
  label,
  name,
  image,
  items,
  type,
  onChange,
  selectedId,
  sizeClass = 'w-40 h-40',
  boxId,
  isOpen,
  onToggle,
  placement,
}) => {
  // Prevent scrolling when full-screen grid is open
  useEffect(() => {
    if (isOpen && placement === 'center') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, placement]);

  return (
    <div className="relative w-fit">
      {/* Label (e.g. "Player 1", etc.) */}
      {label && <div className="text-md sm:text-sm md:text-md lg:text-xl mb-2">{label}</div>}

      {/* The box that shows current selection */}
      <div className={`relative ${sizeClass} rounded-lg overflow-hidden bg-gray-700`}>
        {image ? (
          <img src={image} alt={name} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
          <p className="text-white text-sm sm:text-sm md:text-md lg:text-lg font-bold truncate">{name}</p>
        </div>

        <button
          onClick={() => onToggle(boxId)}
          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 z-10"
        >
          <MdChangeCircle size={20} color="white" className="cursor-pointer" />
        </button>
      </div>

      {/* If isOpen and placement is 'center', render full-screen overlay */}
      {isOpen && placement === 'center' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full h-fit max-w-3xl overflow-auto mt-10">
            <div className="p-4 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Select {label || type.charAt(0).toUpperCase() + type.slice(1)}
              </h2>
              <button
                onClick={() => onToggle('')}
                className="text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
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
                  onToggle('');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop popover for placement='left' or 'right' */}
      {isOpen && (placement === 'left' || placement === 'right') && (
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
              onToggle(''); // close popover
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SelectionBox;
