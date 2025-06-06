// components/StarRating.tsx
"use client";

import { useState } from "react";
import { FiStar } from "react-icons/fi";

interface StarRatingProps {
  value: number;               // current rating (1–5)
  onChange: (newRating: number) => void;
  size?: number;               // icon size (optional)
  readOnly?: boolean;          // if true, stars are not clickable
}

export default function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: StarRatingProps) {
  // Local hover state so we can preview stars on hover
  const [hovered, setHovered] = useState<number>(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        // decide color: if hovered exists, base on hovered; otherwise base on value
        const filled = hovered
          ? starIndex <= hovered
          : starIndex <= value;

        return (
          <FiStar
            key={starIndex}
            size={size}
            className={`transition-colors cursor-${readOnly ? "default" : "pointer"}`}
            color={filled ? "#FACC15" : "#4B5563"}
            fill={filled ? "#FACC15" : "#4B5563"} // yellow-400 vs gray-600
            onMouseEnter={() => {
              if (!readOnly) setHovered(starIndex);
            }}
            onMouseLeave={() => {
              if (!readOnly) setHovered(0);
            }}
            onClick={() => {
              if (!readOnly) onChange(starIndex);
            }}
          />
        );
      })}
    </div>
  );
}
