import { BeadProduct, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'white', label: 'White Crystal' },
  { id: 'purple', label: 'Amethyst' },
  { id: 'yellow', label: 'Citrine' },
  { id: 'pink', label: 'Rose Quartz' },
  { id: 'tea', label: 'Smoky Quartz' },
];

// Placeholder for your actual sprite sheet URL
const SPRITE_SHEET_URL = 'https://placehold.co/400x400/png?text=Gem+Sprite'; 

// mimicking the visual style of the reference images (Amethyst and White Crystal)
export const BEAD_PRODUCTS: BeadProduct[] = [
  // Amethyst (Purple)
  {
    id: 'p1',
    name: 'Uruguay Amethyst',
    price: 12,
    sizeMm: 8,
    // EXAMPLE: How to use a Sprite Sheet (Uncomment and adjust coordinates)
    // textureUrl: SPRITE_SHEET_URL,
    // spritePosition: { x: 0, y: 0 },
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.9), #581c87)',
    type: 'crystal',
    category: 'purple',
  },
  {
    id: 'p2',
    name: 'Uruguay Amethyst',
    price: 24,
    sizeMm: 10,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.9), #581c87)',
    type: 'crystal',
    category: 'purple',
  },
  {
    id: 'p3',
    name: 'Uruguay Amethyst',
    price: 37,
    sizeMm: 12,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.9), #581c87)',
    type: 'crystal',
    category: 'purple',
  },
  {
    id: 'p4',
    name: 'Brazil Amethyst',
    price: 18,
    sizeMm: 8,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(192, 132, 252, 0.8), #6b21a8)',
    type: 'crystal',
    category: 'purple',
  },
  
  // White Crystal
  {
    id: 'w1',
    name: 'Clear Quartz',
    price: 3,
    sizeMm: 6,
    // EXAMPLE: Single Image (No sprite coordinates needed)
    // textureUrl: 'https://example.com/single-bead.png', 
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), #d1d5db)',
    type: 'crystal',
    category: 'white',
  },
  {
    id: 'w2',
    name: 'Clear Quartz',
    price: 5,
    sizeMm: 8,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), #d1d5db)',
    type: 'crystal',
    category: 'white',
  },
  {
    id: 'w3',
    name: 'Clear Quartz',
    price: 10,
    sizeMm: 10,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), #d1d5db)',
    type: 'crystal',
    category: 'white',
  },
  {
    id: 'w4',
    name: 'Milky Quartz',
    price: 4,
    sizeMm: 8,
    imageColor: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1), #f3f4f6)',
    type: 'crystal',
    category: 'white',
  },
];
