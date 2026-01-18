import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OwlWidget } from './components/Owl/OwlWidget';
import { Bug } from './components/Owl/Bug';
import { BugEntity, Position } from './types';

function App() {
  const [bugs, setBugs] = useState<BugEntity[]>([]);
  const [owlScale, setOwlScale] = useState(0.8);
  const [owlPosition, setOwlPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Refs for Game Loop Logic to avoid dependency stale closures in animation frame
  const owlPosRef = useRef<Position>({ x: 0, y: 0 });
  const bugsRef = useRef<BugEntity[]>([]);

  // Update refs when state changes
  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  const handleOwlMove = useCallback((pos: Position) => {
    setOwlPosition(pos);
    owlPosRef.current = pos;
  }, []);

  // --- Bug AI Game Loop ---
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const currentBugs = bugsRef.current;
      const owlPos = owlPosRef.current;
      
      let hasChanges = false;
      const PANIC_DISTANCE = 200;
      const BUG_SPEED = 2.5;

      const updatedBugs = currentBugs.map(bug => {
        if (bug.isSquashed) return bug;

        const dx = bug.x - owlPos.x;
        const dy = bug.y - owlPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PANIC_DISTANCE) {
          // RUN AWAY!
          hasChanges = true;
          
          // Normalize vector away from owl
          const vx = (dx / dist) * BUG_SPEED;
          const vy = (dy / dist) * BUG_SPEED;

          let newX = bug.x + vx;
          let newY = bug.y + vy;

          // Screen Boundaries (Bounce slightly or just clamp)
          if (newX < 50) newX = 50;
          if (newX > window.innerWidth - 50) newX = window.innerWidth - 50;
          if (newY < 50) newY = 50;
          if (newY > window.innerHeight - 50) newY = window.innerHeight - 50;

          return { ...bug, x: newX, y: newY };
        }
        return bug;
      });

      if (hasChanges) {
        setBugs(updatedBugs);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Run once on mount

  const spawnBug = useCallback(() => {
    const id = Math.random().toString(36).substr(2, 9);
    // Spawn random position within 80% of screen to avoid edges
    const x = Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1);
    const y = Math.random() * (window.innerHeight * 0.8) + (window.innerHeight * 0.1);
    
    setBugs(prev => [...prev, { id, x, y, isSquashed: false }]);
  }, []);

  const handleSquash = (id: string) => {
    setBugs(prev => prev.map(bug => 
      bug.id === id ? { ...bug, isSquashed: true } : bug
    ));

    // Remove dead bug after delay
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== id));
    }, 2000);
  };

  const clearBugs = () => setBugs([]);

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden cursor-crosshair">
      
      {/* --- Background / Content Simulation --- */}
      <div className="container mx-auto px-4 py-12 max-w-4xl opacity-50 pointer-events-none select-none">
        <h1 className="text-4xl font-bold text-slate-800 mb-6">Website Content Simulation</h1>
        <p className="mb-4 text-lg text-slate-600">
            This page represents a standard website where the Owl Widget lives. 
            The Owl moves freely over this content (z-index: 50).
        </p>
        <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-75"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-150"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-200"></div>
        </div>
        <div className="mt-8 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      </div>

      {/* --- Test Controls (The "Playground") --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex gap-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-2xl border border-slate-200 items-center">
        
        {/* Actions */}
        <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Actions</span>
            <div className="flex gap-2">
                <button 
                onClick={spawnBug}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                <span>🐛</span> Spawn
                </button>
                <button 
                onClick={clearBugs}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all"
                >
                Clear
                </button>
            </div>
        </div>

        <div className="w-px h-12 bg-slate-300 mx-2"></div>

        {/* Settings */}
        <div className="flex flex-col items-center w-40">
           <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Owl Size: {owlScale.toFixed(1)}x</span>
           <input 
             type="range" 
             min="0.4" 
             max="1.5" 
             step="0.1"
             value={owlScale}
             onChange={(e) => setOwlScale(parseFloat(e.target.value))}
             className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
           />
        </div>

        <div className="w-px h-12 bg-slate-300 mx-2"></div>
        
        {/* Info */}
        <div className="flex flex-col justify-center text-sm text-slate-600 w-32">
            <p><strong>Active Bugs:</strong> {bugs.filter(b => !b.isSquashed).length}</p>
            <p><strong>Scale:</strong> {owlScale}</p>
        </div>
      </div>

      {/* --- The Layers --- */}
      
      {/* 1. The Bugs Layer */}
      {bugs.map(bug => (
        <Bug key={bug.id} {...bug} />
      ))}

      {/* 2. The Owl Widget Layer */}
      <OwlWidget 
        bugs={bugs} 
        onSquashBug={handleSquash} 
        onMove={handleOwlMove}
        scale={owlScale}
        defaultPosition={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
      />
      
      <div className="fixed top-4 right-4 text-slate-400 text-sm">
        Click "Spawn Bug" to see animation
      </div>

    </div>
  );
}

export default App;