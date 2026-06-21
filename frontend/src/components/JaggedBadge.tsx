import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface JaggedBadgeProps {
  color: string;
  icon: LucideIcon;
  textColor?: string;
}

export const JaggedBadge: React.FC<JaggedBadgeProps> = ({ color, icon: Icon, textColor = 'text-gray-800' }) => (
  <div className="relative w-16 h-16 flex items-center justify-center shrink-0 filter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ color }}>
      <polygon
        points="50,5 61,24 81,20 83,41 100,53 84,67 86,88 65,83 50,98 35,83 14,88 16,67 0,53 17,41 19,20 39,24"
        fill="currentColor"
        stroke="#000000"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
    </svg>
    <div className={`relative z-10 ${textColor}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
  </div>
);
