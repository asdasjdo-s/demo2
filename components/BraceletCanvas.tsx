import React, { useRef, useMemo, useState } from 'react';
import { BraceletBead } from '../types';
import { BeadVisual } from './BeadVisual';

interface BraceletCanvasProps {
  beads: BraceletBead[];
  containerRef: React.RefObject<HTMLDivElement>;
  rotation: number;
  onRotationChange: (newRotation: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (beadId: string) => void;
  isAddingBead: boolean; // Triggers the "make space" layout
}

export const BraceletCanvas: React.FC<BraceletCanvasProps> = ({ 
  beads, 
  containerRef,
  rotation,
  onRotationChange,
  onReorder,
  onRemove,
  isAddingBead
}) => {
  const CIRCLE_RADIUS = 130;
  const REMOVE_THRESHOLD = 220; // Distance from center to trigger delete
  
  // Interaction State
  const [draggedBeadId, setDraggedBeadId] = useState<string | null>(null);
  const [dragAngle, setDragAngle] = useState<number>(0); // Angle of the bead currently being dragged (Screen Space)
  const [dragDistance, setDragDistance] = useState<number>(CIRCLE_RADIUS); // Distance from center while dragging
  
  const isRotatingBracelet = useRef(false);
  const lastRotationAngle = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Cache center point to prevent layout thrashing and jitter during drag
  const centerRef = useRef<{x: number, y: number} | null>(null);

  // Helper: Get angle from center to pointer (0 to 2PI)
  const getPointerPolar = (clientX: number, clientY: number) => {
    let centerX = 0;
    let centerY = 0;

    // Use cached center if available (during drag/rotate)
    if (centerRef.current) {
      centerX = centerRef.current.x;
      centerY = centerRef.current.y;
    } else if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    } else {
      return { angle: 0, distance: 0 };
    }
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // atan2 returns -PI to PI.
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return { angle, distance };
  };

  const updateCenterRef = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  };

  // --- Layout Calculation ---
  const { placedBeads, dropTargetIndex, willRemove } = useMemo(() => {
    const effectiveCount = isAddingBead ? beads.length + 1 : beads.length;
    
    if (effectiveCount === 0) return { placedBeads: [], dropTargetIndex: -1, willRemove: false };

    let targetIndex = -1;
    let removeDrag = false;
    const rotationRad = (rotation * Math.PI) / 180;

    if (draggedBeadId) {
      // Check if dragging far enough to remove
      if (dragDistance > REMOVE_THRESHOLD) {
        removeDrag = true;
      } else {
        // Normal Reorder Logic
        // Calculate angle in LOCAL space (relative to the rotated container) to find the correct index slot
        let localAngle = dragAngle - rotationRad;
        
        // Adjust standard math to match layout logic (Top is -PI/2)
        // layout: angle = index/N * 2PI - PI/2
        // index/N * 2PI = angle + PI/2
        let angleForIndex = localAngle + Math.PI / 2;
        
        // Normalize
        angleForIndex = angleForIndex % (2 * Math.PI);
        if (angleForIndex < 0) angleForIndex += 2 * Math.PI;

        const rawIndex = Math.round((angleForIndex / (2 * Math.PI)) * effectiveCount);
        targetIndex = rawIndex % effectiveCount; 
      }
    }

    const result = beads.map((bead, originalIndex) => {
      // If this is the bead being dragged
      if (bead.uniqueId === draggedBeadId) {
        // Calculate position in LOCAL space for the child element
        const localDragAngle = dragAngle - rotationRad;

        const x = Math.cos(localDragAngle) * dragDistance; 
        const y = Math.sin(localDragAngle) * dragDistance;
        
        // Convert back to deg for rotation transform
        const localRot = (localDragAngle * 180) / Math.PI;
        
        return { 
          ...bead, 
          x, y, 
          rotation: localRot, 
          isDragging: true, 
          visualIndex: -1,
          isRemoving: removeDrag 
        };
      }

      let visualIndex = originalIndex;

      // Logic for Shifting beads when dragging (only if not removing)
      if (draggedBeadId && !removeDrag && targetIndex !== -1) {
        const draggedIndex = beads.findIndex(b => b.uniqueId === draggedBeadId);
        
        if (draggedIndex < targetIndex) {
          if (originalIndex > draggedIndex && originalIndex <= targetIndex) {
            visualIndex = originalIndex - 1;
          }
        } else if (draggedIndex > targetIndex) {
           if (originalIndex >= targetIndex && originalIndex < draggedIndex) {
             visualIndex = originalIndex + 1;
           }
        }
      }

      // Calculate Angle based on visualIndex
      const angleRad = (visualIndex / effectiveCount) * 2 * Math.PI - (Math.PI / 2);
      
      const x = Math.cos(angleRad) * CIRCLE_RADIUS;
      const y = Math.sin(angleRad) * CIRCLE_RADIUS;
      const rot = (angleRad * 180) / Math.PI;

      return { ...bead, x, y, rotation: rot, isDragging: false, visualIndex, isRemoving: false };
    });

    return { placedBeads: result, dropTargetIndex: targetIndex, willRemove: removeDrag };
  }, [beads, isAddingBead, draggedBeadId, dragAngle, dragDistance, rotation]);


  // --- Event Handlers ---

  const handleBeadPointerDown = (e: React.PointerEvent, beadId: string) => {
    e.stopPropagation(); 
    e.currentTarget.setPointerCapture(e.pointerId);
    updateCenterRef();
    setDraggedBeadId(beadId);
    
    // We need to calculate initial state immediately to avoid jumping
    const { angle, distance } = getPointerPolar(e.clientX, e.clientY);
    setDragAngle(angle);
    setDragDistance(distance);
  };

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    isRotatingBracelet.current = true;
    updateCenterRef();
    const { angle } = getPointerPolar(e.clientX, e.clientY);
    lastRotationAngle.current = angle;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedBeadId && !isRotatingBracelet.current) return;

    const { angle, distance } = getPointerPolar(e.clientX, e.clientY);

    if (draggedBeadId) {
      setDragAngle(angle);
      setDragDistance(distance); 
      return;
    }

    if (isRotatingBracelet.current) {
      const delta = angle - lastRotationAngle.current;
      const deltaDeg = (delta * 180) / Math.PI;
      onRotationChange(rotation + deltaDeg);
      lastRotationAngle.current = angle;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedBeadId) {
      if (willRemove) {
        onRemove(draggedBeadId);
      } else if (dropTargetIndex !== -1) {
        const fromIndex = beads.findIndex(b => b.uniqueId === draggedBeadId);
        onReorder(fromIndex, dropTargetIndex);
      }
      setDraggedBeadId(null);
      setDragDistance(CIRCLE_RADIUS); // Reset
    }

    isRotatingBracelet.current = false;
    centerRef.current = null; // Clear cache
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-transparent overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Visual Cue for Deletion */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center ${willRemove ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="w-[500px] h-[500px] rounded-full border-4 border-red-100 bg-red-50/30 animate-pulse flex items-center justify-center">
             <span className="text-red-300 font-bold tracking-widest text-lg mt-[360px]">RELEASE TO DELETE</span>
        </div>
      </div>

      <div className="absolute flex flex-col items-center justify-center z-0 opacity-30 select-none pointer-events-none">
        <h1 className="text-2xl font-bold text-gray-800 tracking-wider">MineStone</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Bracelet Designer</p>
      </div>

      <div 
        ref={canvasRef}
        className="relative flex items-center justify-center"
        style={{
          width: `${CIRCLE_RADIUS * 2 + 60}px`,
          height: `${CIRCLE_RADIUS * 2 + 60}px`,
          transform: `rotate(${rotation}deg)`,
          transition: isRotatingBracelet.current || draggedBeadId ? 'none' : 'transform 0.1s ease-out',
          cursor: isRotatingBracelet.current ? 'grabbing' : 'grab'
        }}
        onPointerDown={handleContainerPointerDown}
      >
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-gray-200 z-0 pointer-events-none"
          style={{ width: `${CIRCLE_RADIUS * 2}px`, height: `${CIRCLE_RADIUS * 2}px` }}
        />

        <div className="absolute left-1/2 top-1/2 w-0 h-0 z-10">
          {placedBeads.map((bead) => (
            <div
              key={bead.uniqueId}
              onPointerDown={(e) => handleBeadPointerDown(e, bead.uniqueId)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 touch-none cursor-move"
              style={{
                left: `${bead.x}px`,
                top: `${bead.y}px`,
                // Remove transition when dragging to ensure instant follow
                transition: bead.isDragging ? 'none' : 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s',
                transform: `translate(-50%, -50%) rotate(${bead.rotation + 90}deg) ${bead.isDragging ? 'scale(1.2)' : 'scale(1)'}`,
                zIndex: bead.isDragging ? 100 : 1,
                opacity: bead.isRemoving ? 0.6 : 1
              }}
            >
              <BeadVisual 
                color={bead.imageColor} 
                size={bead.sizeMm} 
                textureUrl={bead.textureUrl}
                spritePosition={bead.spritePosition}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
