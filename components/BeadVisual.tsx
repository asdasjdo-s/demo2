import React from 'react';
import { BeadProduct } from '../types';

interface BeadVisualProps {
  color: string; // Keep for fallback/legacy
  size: number;
  textureUrl?: string;
  spritePosition?: { x: number; y: number };
  className?: string;
  hasReflection?: boolean;
}

export const BeadVisual: React.FC<BeadVisualProps> = ({ 
  color, 
  size, 
  textureUrl,
  spritePosition,
  className = '', 
  hasReflection = true 
}) => {
  // Scaling mm to pixels for display
  const pixelSize = size * 3.5;

  const style: React.CSSProperties = {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.2)',
  };

  if (textureUrl) {
    style.backgroundImage = `url(${textureUrl})`;
    style.backgroundRepeat = 'no-repeat';
    
    if (spritePosition) {
      // Sprite Sheet Logic
      // Assuming the sprite icons are roughly the size of the bead or you want to crop
      style.backgroundPosition = `-${spritePosition.x}px -${spritePosition.y}px`;
      // You might need backgroundSize here depending on your sprite sheet resolution
      // style.backgroundSize = '500px 500px'; 
    } else {
      // Single Image Logic
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    style.backgroundColor = color; // Behind the image just in case
  } else {
    // Legacy Gradient Logic
    style.background = color;
  }

  return (
    <div
      className={`rounded-full relative shadow-md ${className}`}
      style={style}
    >
      {/* Simulation of the hole/string running through */}
      <div 
        className="absolute top-1/2 left-0 w-full h-[2px] bg-white/40 -translate-y-1/2 pointer-events-none mix-blend-overlay"
        style={{ filter: 'blur(1px)' }}
      />
      
      {/* Light Reflection/Shine - Make it subtler for images */}
      {hasReflection && (
        <div className="absolute top-[20%] right-[20%] w-[25%] h-[25%] rounded-full bg-white opacity-30 blur-[2px] pointer-events-none mix-blend-screen" />
      )}
    </div>
  );
};
