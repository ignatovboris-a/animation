import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OwlWidget } from './OwlWidget';
import { Bug } from './Bug';
import { BugEntity, Position } from '../../types';

interface OwlOverlayProps {
  initialScale?: number;
  initialStartXPercent?: number;
  initialStartYPercent?: number;
  initialAutoSpawn?: boolean;
  initialMinSpawnSeconds?: number;
  initialMaxSpawnSeconds?: number;
  controlsEnabled?: boolean;
}

export const OwlOverlay: React.FC<OwlOverlayProps> = ({
  initialScale = 0.8,
  initialStartXPercent = 90,
  initialStartYPercent = 90,
  initialAutoSpawn = false,
  initialMinSpawnSeconds = 60,
  initialMaxSpawnSeconds = 300,
  controlsEnabled = true
}) => {
  const [bugs, setBugs] = useState<BugEntity[]>([]);
  
  // -- Portal Configuration Mock State --
  const [owlScale, setOwlScale] = useState(initialScale);
  const [returnToStart, setReturnToStart] = useState(true);
  
  // Initial Position State
  const [startPosPercent, setStartPosPercent] = useState({
    x: initialStartXPercent,
    y: initialStartYPercent
  }); // Default bottom-right corner
  const [computedStartPos, setComputedStartPos] = useState<Position>({ x: 0, y: 0 });

  // Auto Spawn Configuration
  const [autoSpawn, setAutoSpawn] = useState(initialAutoSpawn);
  const [minSpawnTime, setMinSpawnTime] = useState(initialMinSpawnSeconds * 1000); 
  const [maxSpawnTime, setMaxSpawnTime] = useState(initialMaxSpawnSeconds * 1000); 
  
  // Refs
  const owlPosRef = useRef<Position>({ x: 0, y: 0 });
  const bugsRef = useRef<BugEntity[]>([]);

  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  // Re-calculate absolute start position
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
    owlPosRef.current = pos;
  }, []);

  // --- Auto Spawn Logic ---
  useEffect(() => {
    if (!autoSpawn) return;
    let timeoutId: number;
    const scheduleSpawn = () => {
        const effectiveMax = Math.max(minSpawnTime, maxSpawnTime);
        const delay = Math.random() * (effectiveMax - minSpawnTime) + minSpawnTime;
        timeoutId = window.setTimeout(() => {
            spawnBug();
            scheduleSpawn();
        }, delay);
    };
    scheduleSpawn();
    return () => clearTimeout(timeoutId);
  }, [autoSpawn, minSpawnTime, maxSpawnTime]);

  const spawnBug = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1);
    const y = Math.random() * (window.innerHeight * 0.8) + (window.innerHeight * 0.1);
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5;

    setBugs(prev => [...prev, { 
      id, x, y, 
      vx: Math.cos(angle) * speed, 
      vy: Math.sin(angle) * speed, 
      isSquashed: false 
    }]);
  };

  // --- Bug AI Game Loop ---
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const currentBugs = bugsRef.current;
      const owlPos = owlPosRef.current;
      let hasChanges = false;
      const PANIC_DISTANCE = 220;
      const PANIC_SPEED = 3.5;
      const WANDER_SPEED = 0.8;

      const updatedBugs = currentBugs.map(bug => {
        if (bug.isSquashed) return bug;

        const dx = bug.x - owlPos.x;
        const dy = bug.y - owlPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let newVx = bug.vx;
        let newVy = bug.vy;

        if (dist < PANIC_DISTANCE) {
          hasChanges = true;
          newVx = (dx / dist) * PANIC_SPEED;
          newVy = (dy / dist) * PANIC_SPEED;
        } else {
          if (Math.random() < 0.02) {
             hasChanges = true;
             const angle = Math.random() * Math.PI * 2;
             newVx = Math.cos(angle) * WANDER_SPEED;
             newVy = Math.sin(angle) * WANDER_SPEED;
          }
        }

        let newX = bug.x + newVx;
        let newY = bug.y + newVy;
        const padding = 50;

        if (newX < padding) { newX = padding; newVx = Math.abs(newVx); hasChanges = true; }
        if (newX > window.innerWidth - padding) { newX = window.innerWidth - padding; newVx = -Math.abs(newVx); hasChanges = true; }
        if (newY < padding) { newY = padding; newVy = Math.abs(newVy); hasChanges = true; }
        if (newY > window.innerHeight - padding) { newY = window.innerHeight - padding; newVy = -Math.abs(newVy); hasChanges = true; }

        if (newVx !== bug.vx || newVy !== bug.vy || newX !== bug.x || newY !== bug.y) {
           return { ...bug, x: newX, y: newY, vx: newVx, vy: newVy };
        }
        return bug;
      });

      if (hasChanges) setBugs(updatedBugs);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleSquash = (id: string) => {
    setBugs(prev => prev.map(bug => 
      bug.id === id ? { ...bug, isSquashed: true } : bug
    ));
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== id));
    }, 2000);
  };

  const clearBugs = () => setBugs([]);

  // Control Panel Toggle Logic
  const [showControls, setShowControls] = useState(controlsEnabled);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {bugs.map(bug => (
            <Bug key={bug.id} {...bug} />
        ))}

        <OwlWidget 
            bugs={bugs} 
            onSquashBug={handleSquash} 
            onSpawnBug={spawnBug}
            onMove={handleOwlMove}
            scale={owlScale}
            defaultPosition={computedStartPos}
            returnToStart={returnToStart}
        />
        
        {/* Toggle Button for controls when hidden */}
        {controlsEnabled && !showControls && (
            <button 
                className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 backdrop-blur border border-slate-300 rounded-full shadow-lg flex items-center justify-center text-xl pointer-events-auto hover:bg-white hover:scale-110 transition-all z-[10001]"
                onClick={() => setShowControls(true)}
                title="Open Settings"
            >
                ⚙️
            </button>
        )}
      </div>

      {/* Configuration Panel (Only shows if requested) */}
      {controlsEnabled && showControls && (
        <div className="fixed bottom-4 left-4 right-4 z-[10000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-6xl mx-auto flex flex-wrap gap-6 justify-between items-start text-slate-800 animate-in slide-in-from-bottom-5">
             
             {/* Actions */}
             <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">ACTIONS</span>
                <div className="flex gap-2">
                    <button onClick={spawnBug} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm hover:bg-red-600 transition-colors">Spawn Bug</button>
                    <button onClick={clearBugs} className="bg-slate-200 px-3 py-1 rounded text-sm font-bold hover:bg-slate-300 transition-colors">Clear All</button>
                </div>
             </div>

             {/* Scale */}
             <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">SCALE: {owlScale.toFixed(1)}</span>
                <input type="range" min="0.4" max="1.5" step="0.1" value={owlScale} onChange={e => setOwlScale(parseFloat(e.target.value))} className="accent-amber-500"/>
             </div>

             {/* Start Position */}
             <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs font-bold text-slate-400">START POS ({startPosPercent.x}%, {startPosPercent.y}%)</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] w-3 font-mono text-slate-500">X</span>
                    <input type="range" min="0" max="100" value={startPosPercent.x} onChange={e => setStartPosPercent(p => ({...p, x: parseInt(e.target.value)}))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"/>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] w-3 font-mono text-slate-500">Y</span>
                    <input type="range" min="0" max="100" value={startPosPercent.y} onChange={e => setStartPosPercent(p => ({...p, y: parseInt(e.target.value)}))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"/>
                </div>
             </div>

             {/* Spawn Config */}
             <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">SPAWN RATE (SEC)</span>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={minSpawnTime / 1000} 
                        onChange={e => setMinSpawnTime(parseFloat(e.target.value) * 1000)}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                        step="0.5"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input 
                        type="number" 
                        value={maxSpawnTime / 1000} 
                        onChange={e => setMaxSpawnTime(parseFloat(e.target.value) * 1000)}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                        step="0.5"
                    />
                </div>
             </div>

             {/* Auto Spawn Toggle */}
             <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">AUTO SPAWN</span>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <input type="checkbox" checked={autoSpawn} onChange={e => setAutoSpawn(e.target.checked)} className="w-5 h-5 accent-amber-500 cursor-pointer" />
                    <span className={`text-sm font-bold ${autoSpawn ? 'text-green-600' : 'text-slate-400'}`}>{autoSpawn ? 'ACTIVE' : 'OFF'}</span>
                </div>
             </div>

             <button onClick={() => setShowControls(false)} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
        </div>
      )}
    </>
  );
};
