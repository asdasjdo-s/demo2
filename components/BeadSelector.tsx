import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES, BEAD_PRODUCTS } from '../constants';
import { BeadProduct } from '../types';
import { BeadVisual } from './BeadVisual';

interface BeadSelectorProps {
  onBeadSelect: (bead: BeadProduct, rect: DOMRect) => void;
}

export const BeadSelector: React.FC<BeadSelectorProps> = ({ onBeadSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('white');

  const filteredBeads = BEAD_PRODUCTS.filter(
    (b) => b.category === selectedCategory
  );

  const handleBeadClick = (e: React.MouseEvent<HTMLButtonElement>, bead: BeadProduct) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onBeadSelect(bead, rect);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Search / Filter Bar */}
      <div className="h-14 px-4 flex items-center bg-gray-100 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
          <div className="w-4 h-4 bg-black rounded-sm transform rotate-45" />
        </div>
        <div className="flex-1 h-9 bg-white rounded-full flex items-center px-3 shadow-inner">
          <Search size={16} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search beads..." 
            className="bg-transparent text-sm text-gray-600 w-full outline-none placeholder-gray-400 font-light"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-24 bg-gray-50 flex flex-col overflow-y-auto hide-scrollbar border-r border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                py-6 px-2 flex flex-col items-center justify-center text-xs font-light tracking-wide transition-colors relative
                ${selectedCategory === cat.id ? 'text-gray-900 font-medium bg-white' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {selectedCategory === cat.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-800 rounded-r-md" />
              )}
              <span className="writing-vertical-rl" style={{ writingMode: 'vertical-rl' }}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Bead Grid */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 pb-20">
            {filteredBeads.map((bead) => (
              <button
                key={bead.id}
                onClick={(e) => handleBeadClick(e, bead)}
                className="flex flex-col items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white active:scale-95 duration-200 h-40"
              >
                <div className="flex-1 flex items-center justify-center">
                   <BeadVisual 
                     color={bead.imageColor} 
                     size={bead.sizeMm} 
                     textureUrl={bead.textureUrl}
                     spritePosition={bead.spritePosition}
                   />
                </div>
                <div className="text-center mt-2 w-full">
                  <h3 className="text-xs text-gray-700 font-medium truncate w-full" style={{ fontFamily: 'serif' }}>
                    {bead.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    {bead.sizeMm}mm - ¥{bead.price}
                  </p>
                </div>
              </button>
            ))}
            {/* Spacer for bottom padding */}
            <div className="col-span-3 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
