import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Save, ShoppingCart, Check } from 'lucide-react';
import { BraceletCanvas } from './components/BraceletCanvas';
import { BeadSelector } from './components/BeadSelector';
import { BraceletBead, BeadProduct, FlyingBeadState } from './types';
import { BeadVisual } from './components/BeadVisual';

const App: React.FC = () => {
  // Load from local storage on init
  const [bracelet, setBracelet] = useState<BraceletBead[]>(() => {
    try {
      const saved = localStorage.getItem('minestone_design');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [rotation, setRotation] = useState(0);
  const [toast, setToast] = useState<{show: boolean, message: string}>({ show: false, message: '' });
  
  const [flyingBead, setFlyingBead] = useState<FlyingBeadState>({
    isActive: false,
    startRect: null,
    bead: null,
  });
  
  const [animStyles, setAnimStyles] = useState<React.CSSProperties>({});
  const braceletContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleSave = () => {
    if (bracelet.length === 0) {
      showToast("Design is empty!");
      return;
    }
    localStorage.setItem('minestone_design', JSON.stringify(bracelet));
    showToast("Design Saved!");
  };

  const handleClear = () => {
    if (bracelet.length === 0) {
      showToast("Design is already empty");
      return;
    }
    
    // Immediate clear without confirmation to ensure responsiveness
    setBracelet([]);
    setRotation(0); 
    localStorage.removeItem('minestone_design');
    showToast("Design Cleared");
  };

  const handleRemoveBead = (beadId: string) => {
    setBracelet(prev => prev.filter(b => b.uniqueId !== beadId));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setBracelet(prev => {
      const newArr = [...prev];
      const [movedItem] = newArr.splice(fromIndex, 1);
      newArr.splice(toIndex, 0, movedItem);
      return newArr;
    });
  };

  const handleBeadSelect = (bead: BeadProduct, startRect: DOMRect) => {
    if (flyingBead.isActive) return;

    setFlyingBead({
      isActive: true,
      startRect,
      bead,
    });

    // Start slightly smaller to simulate "appearing"
    setAnimStyles({
      position: 'fixed',
      left: `${startRect.left + startRect.width / 2}px`,
      top: `${startRect.top + startRect.height / 2}px`,
      transform: 'translate(-50%, -50%) scale(0.5)',
      opacity: 0.8,
      zIndex: 50,
      pointerEvents: 'none',
      transition: 'none', 
    });

    requestAnimationFrame(() => {
      if (braceletContainerRef.current) {
        const containerRect = braceletContainerRef.current.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        
        const CIRCLE_RADIUS = 130;
        
        const nextCount = bracelet.length + 1;
        const targetIndex = nextCount - 1; 
        
        const baseAngleRad = (targetIndex / nextCount) * 2 * Math.PI - (Math.PI / 2);
        
        const rotationRad = (rotation * Math.PI) / 180;
        const finalAngleRad = baseAngleRad + rotationRad;

        const targetX = centerX + Math.cos(finalAngleRad) * CIRCLE_RADIUS;
        const targetY = centerY + Math.sin(finalAngleRad) * CIRCLE_RADIUS;
        const beadRotationDeg = (finalAngleRad * 180 / Math.PI) + 90;

        requestAnimationFrame(() => {
          setAnimStyles({
            position: 'fixed',
            left: `${targetX}px`,
            top: `${targetY}px`,
            transform: `translate(-50%, -50%) scale(1) rotate(${beadRotationDeg}deg)`,
            opacity: 1,
            zIndex: 50,
            pointerEvents: 'none',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          });
        });
      }
    });
  };

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'top') return;

    if (flyingBead.isActive && flyingBead.bead) {
      const newBead: BraceletBead = {
        ...flyingBead.bead,
        uniqueId: Date.now().toString(),
      };
      setBracelet((prev) => [...prev, newBead]);
      
      setFlyingBead({ isActive: false, startRect: null, bead: null });
      setAnimStyles({});
    }
  };

  return (
    // NAMESPACE ID: minestone-designer-root
    <div id="minestone-designer-root" className="w-full h-full bg-white flex flex-col font-sans text-gray-800 overflow-hidden relative isolation-auto">
      
      {/* Toast Notification */}
      <div 
        className={`absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center gap-2 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <Check size={16} className="text-green-400" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={handleClear}
            className="w-10 h-10 bg-white border border-black rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={handleSave}
            className="h-10 px-4 bg-red-700 text-white rounded-lg flex items-center gap-2 shadow-sm font-light tracking-wide hover:bg-red-800 active:scale-95 transition-transform cursor-pointer"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
        <button className="h-10 px-4 bg-white border border-black rounded-lg flex items-center gap-2 shadow-sm font-light pointer-events-auto hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer">
          <ShoppingCart size={16} />
          <span>Complete</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full min-h-[50vh] relative z-0">
        <BraceletCanvas 
          beads={bracelet} 
          rotation={rotation}
          onRotationChange={setRotation}
          containerRef={braceletContainerRef}
          onReorder={handleReorder}
          onRemove={handleRemoveBead}
          isAddingBead={flyingBead.isActive} 
        />
      </div>

      {/* Selector */}
      <div className="h-[45vh] w-full z-10 relative">
        <BeadSelector onBeadSelect={handleBeadSelect} />
      </div>

      {/* Flying Bead Layer */}
      {flyingBead.isActive && flyingBead.bead && (
        <div 
          style={animStyles}
          onTransitionEnd={handleTransitionEnd}
        >
          <BeadVisual 
            color={flyingBead.bead.imageColor} 
            size={flyingBead.bead.sizeMm}
            textureUrl={flyingBead.bead.textureUrl}
            spritePosition={flyingBead.bead.spritePosition}
            className="shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
};

export default App;
