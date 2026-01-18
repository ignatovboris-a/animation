import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OwlWidget } from './components/Owl/OwlWidget';
import { Bug } from './components/Owl/Bug';
import { BugEntity, Position } from './types';

function App() {
  const [bugs, setBugs] = useState<BugEntity[]>([]);
  
  // -- Portal Configuration Mock State --
  const [owlScale, setOwlScale] = useState(0.8);
  const [returnToStart, setReturnToStart] = useState(true);
  
  // Initial Position State (Percentage of screen to handle resizes gracefully)
  const [startPosPercent, setStartPosPercent] = useState({ x: 50, y: 50 }); // 50% 50% center
  const [computedStartPos, setComputedStartPos] = useState<Position>({ x: 0, y: 0 });

  // Auto Spawn Configuration
  const [autoSpawn, setAutoSpawn] = useState(false);
  const [minSpawnTime, setMinSpawnTime] = useState(1000); // 1 sec
  const [maxSpawnTime, setMaxSpawnTime] = useState(3000); // 3 sec
  
  const [owlPosition, setOwlPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Refs for Game Loop Logic to avoid dependency stale closures in animation frame
  const owlPosRef = useRef<Position>({ x: 0, y: 0 });
  const bugsRef = useRef<BugEntity[]>([]);

  // Update refs when state changes
  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  // Re-calculate absolute start position when window resizes or percentage changes
  useEffect(() => {
    const calcPos = () => {
        setComputedStartPos({
            x: (window.innerWidth * startPosPercent.x) / 100,
            y: (window.innerHeight * startPosPercent.y) / 100
        });
    };
    calcPos();
    window.addEventListener('resize', calcPos);
    return () => window.removeEventListener('resize', calcPos);
  }, [startPosPercent]);

  const handleOwlMove = useCallback((pos: Position) => {
    setOwlPosition(pos);
    owlPosRef.current = pos;
  }, []);

  // --- Auto Spawn Logic ---
  useEffect(() => {
    if (!autoSpawn) return;

    let timeoutId: number;

    const scheduleSpawn = () => {
        // Calculate random delay between min and max
        const delay = Math.random() * (Math.max(0, maxSpawnTime - minSpawnTime)) + minSpawnTime;
        
        timeoutId = window.setTimeout(() => {
            spawnBug();
            scheduleSpawn(); // Recurse
        }, delay);
    };

    scheduleSpawn();

    return () => clearTimeout(timeoutId);
  }, [autoSpawn, minSpawnTime, maxSpawnTime]); // Re-run if config changes

  const spawnBug = () => {
    const id = Math.random().toString(36).substr(2, 9);
    // Spawn random position within 80% of screen to avoid edges
    const x = Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1);
    const y = Math.random() * (window.innerHeight * 0.8) + (window.innerHeight * 0.1);
    
    setBugs(prev => [...prev, { id, x, y, isSquashed: false }]);
  };

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
      
      {/* --- Visual Marker for Start Position --- */}
      {returnToStart && (
        <div 
            className="absolute w-8 h-8 border-2 border-dashed border-slate-400 rounded-full flex items-center justify-center opacity-50 pointer-events-none"
            style={{ left: computedStartPos.x, top: computedStartPos.y, transform: 'translate(-50%, -100%)' }}
        >
            <span className="text-[10px] text-slate-500 font-bold">HOME</span>
        </div>
      )}

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
      </div>

      {/* --- Test Controls (Portal Config Mock) --- */}
      <div className="fixed bottom-4 left-4 right-4 z-[60] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-5xl mx-auto flex flex-wrap gap-6 justify-between items-start text-slate-800">
        
        {/* Actions */}
        <div className="flex flex-col gap-2 min-w-[120px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</span>
            <button 
                onClick={() => spawnBug()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 text-sm"
            >
                <span>🐛</span> Spawn Once
            </button>
            <button 
                onClick={clearBugs}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg font-bold text-sm"
            >
                Clear All
            </button>
            <div className="text-xs text-slate-500 mt-1">Active: {bugs.filter(b => !b.isSquashed).length}</div>
        </div>

        <div className="w-px bg-slate-200 self-stretch"></div>

        {/* Appearance Config */}
        <div className="flex flex-col gap-3 min-w-[150px]">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appearance</span>
           <label className="text-xs font-bold flex flex-col gap-1">
             Scale: {owlScale.toFixed(1)}x
             <input type="range" min="0.4" max="1.5" step="0.1" value={owlScale} onChange={(e) => setOwlScale(parseFloat(e.target.value))} className="accent-amber-600 h-1.5 bg-slate-200 rounded-lg appearance-none w-full"/>
           </label>
        </div>

        <div className="w-px bg-slate-200 self-stretch"></div>

        {/* Behavior Config */}
        <div className="flex flex-col gap-3 min-w-[200px]">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Behavior</span>
           
           <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none">
             <input type="checkbox" checked={returnToStart} onChange={e => setReturnToStart(e.target.checked)} className="accent-amber-600 w-4 h-4 rounded" />
             Return to Start Position
           </label>

           <div className="flex gap-2">
             <label className="text-xs font-bold flex flex-col gap-1 w-1/2">
               Start X: {startPosPercent.x}%
               <input type="range" min="0" max="100" value={startPosPercent.x} onChange={(e) => setStartPosPercent(p => ({...p, x: parseInt(e.target.value)}))} className="accent-stone-600 h-1.5 bg-slate-200 rounded-lg appearance-none w-full"/>
             </label>
             <label className="text-xs font-bold flex flex-col gap-1 w-1/2">
               Start Y: {startPosPercent.y}%
               <input type="range" min="0" max="100" value={startPosPercent.y} onChange={(e) => setStartPosPercent(p => ({...p, y: parseInt(e.target.value)}))} className="accent-stone-600 h-1.5 bg-slate-200 rounded-lg appearance-none w-full"/>
             </label>
           </div>
        </div>

        <div className="w-px bg-slate-200 self-stretch"></div>

        {/* Spawner Config */}
        <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto Spawner</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoSpawn} onChange={e => setAutoSpawn(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>
            
            <label className="text-xs font-bold flex flex-col gap-1 opacity-90">
                Min Interval: {(minSpawnTime/1000).toFixed(1)}s
                <input 
                    type="range" min="100" max="5000" step="100" 
                    value={minSpawnTime} 
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMinSpawnTime(val);
                        if(val > maxSpawnTime) setMaxSpawnTime(val);
                    }} 
                    className="accent-green-600 h-1.5 bg-slate-200 rounded-lg appearance-none w-full"
                    disabled={!autoSpawn}
                />
            </label>

            <label className="text-xs font-bold flex flex-col gap-1 opacity-90">
                Max Interval: {(maxSpawnTime/1000).toFixed(1)}s
                <input 
                    type="range" min="100" max="10000" step="100" 
                    value={maxSpawnTime} 
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMaxSpawnTime(val);
                        if(val < minSpawnTime) setMinSpawnTime(val);
                    }} 
                    className="accent-green-600 h-1.5 bg-slate-200 rounded-lg appearance-none w-full"
                    disabled={!autoSpawn}
                />
            </label>
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
        defaultPosition={computedStartPos}
        returnToStart={returnToStart}
      />

    </div>
  );
}

export default App;