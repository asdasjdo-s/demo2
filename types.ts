export type BeadType = 'crystal' | 'wood' | 'gold' | 'pearl';

export interface BeadProduct {
  id: string;
  name: string;
  price: number;
  sizeMm: number;
  
  // Fallback color if image fails or is not provided
  imageColor: string; 
  
  // New: Sprite/Image Support
  textureUrl?: string; // URL to the single image or sprite sheet
  spritePosition?: { x: number; y: number }; // Only needed if using a sprite sheet
  spriteSheetSize?: { width: number; height: number }; // Optional: To scale the background if using a huge sprite sheet
  
  type: BeadType;
  category: string;
}

export interface BraceletBead extends BeadProduct {
  uniqueId: string; // Unique ID for the specific instance on the bracelet
}

export interface Category {
  id: string;
  label: string;
}

export interface FlyingBeadState {
  isActive: boolean;
  startRect: DOMRect | null;
  bead: BeadProduct | null;
}
