import React, { useEffect, useState, useRef } from 'react';

interface BugProps {
  x: number;
  y: number;
  isSquashed: boolean;
}

// Skeletal Leg Component
// Consists of a Root (positioning), Thigh (Femur), and Shin (Tibia)
const SkeletalLeg = ({ 
  side, 
  index, 
  isMoving 
}: { 
  side: 'left' | 'right'; 
  index: number; 
  isMoving: boolean;
}) => {
  // Config for each leg based on position (0: Front, 1: Middle, 2: Back)
  const isLeft = side === 'left';
  
  // Base rotation angles for the resting pose
  const baseRotations = isLeft ? [-45, -90, -135] : [45, 90, 135];
  const baseRot = baseRotations[index];

  // Tripod Gait Logic:
  // Group A: L0, R1, L2
  // Group B: R0, L1, R2
  // We use animation delays to sync them.
  const isGroupA = (isLeft && (index === 0 || index === 2)) || (!isLeft && index === 1);
  const animDelay = isGroupA ? '0s' : '-0.1s'; // Offset half the cycle (cycle is ~0.2s)

  return (
    <div 
      className="absolute top-1/2 left-1/2 w-0 h-0 z-0"
      style={{ transform: `rotate(${baseRot}deg)` }}
    >
      {/* Thigh (Femur) */}
      <div 
        className="absolute bottom-[-3px] left-[-2px] w-1.5 h-6 bg-stone-900 rounded-full origin-bottom"
        style={{
           transformOrigin: '50% 100%',
           animation: isMoving ? `bug-walk-thigh 0.2s infinite alternate ease-in-out` : 'none',
           animationDelay: animDelay,
        }}
      >
          {/* Shin (Tibia) */}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-5 bg-stone-800 rounded-full origin-bottom"
            style={{
                top: '0',
                transformOrigin: '50% 100%', // Joint at the "knee" (top of thigh, bottom of shin in this inverted render? No, let's fix coordinates)
                // Let's say Thigh grows UP from body. Shin grows UP from Thigh.
                transform: 'translateY(-80%) rotate(30deg)', // Initial bend
                animation: isMoving ? `bug-walk-shin 0.2s infinite ease-in-out` : 'none',
                animationDelay: animDelay,
            }}
          >
             {/* Tiny Foot/Claw */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
          </div>
      </div>
    </div>
  );
};

export const Bug: React.FC<BugProps> = ({ x, y, isSquashed }) => {
  const prevPos = useRef({ x, y });
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [blink, setBlink] = useState(false);

  // Movement Logic
  useEffect(() => {
    const dx = x - prevPos.current.x;
    const dy = y - prevPos.current.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 0.5) {
        setIsMoving(true);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; 
        setRotation(angle);
    } else {
        setIsMoving(false);
    }
    prevPos.current = { x, y };
  }, [x, y]);

  // Blink Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
        if (!isSquashed && Math.random() > 0.6) { // Not always blinking on interval
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }
    }, 2000 + Math.random() * 2000); // Random check every 2-4 seconds

    return () => clearInterval(blinkInterval);
  }, [isSquashed]);

  return (
    <div
      className="absolute w-12 h-14 pointer-events-auto z-10 cursor-crosshair"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) ${isSquashed ? 'scaleY(0.1) scaleX(1.5)' : 'scale(1)'}`,
        transition: isSquashed ? 'transform 0.1s' : 'transform 0.1s linear',
        opacity: isSquashed ? 0.6 : 1
      }}
    >
      <div className="relative w-full h-full">
        
        {/* --- Skeletal Legs Layer --- */}
        <div className="absolute top-[40%] left-1/2 w-0 h-0">
            <SkeletalLeg side="left" index={0} isMoving={isMoving && !isSquashed} />
            <SkeletalLeg side="left" index={1} isMoving={isMoving && !isSquashed} />
            <SkeletalLeg side="left" index={2} isMoving={isMoving && !isSquashed} />
            
            <SkeletalLeg side="right" index={0} isMoving={isMoving && !isSquashed} />
            <SkeletalLeg side="right" index={1} isMoving={isMoving && !isSquashed} />
            <SkeletalLeg side="right" index={2} isMoving={isMoving && !isSquashed} />
        </div>

        {/* --- Body (Abdomen) --- */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-stone-800 to-black rounded-[50%] shadow-lg border border-stone-700/50 z-10">
           {/* Wing Shell Split Line */}
           <div className="absolute top-0 bottom-1 left-1/2 -translate-x-1/2 w-[1px] bg-white/10"></div>
           {/* Gloss */}
           <div className="absolute top-2 left-2 w-3 h-4 bg-white/10 rounded-full blur-[1px]"></div>
        </div>

        {/* --- Thorax & Head --- */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-7 h-7 bg-stone-900 rounded-full z-20 shadow-md">
            {/* Eyes */}
             {!isSquashed && (
              <>
                <div className={`absolute top-1 left-0.5 w-3 h-3 bg-white rounded-full border border-stone-600 flex items-center justify-center transition-transform duration-100 ${blink ? 'scale-y-0' : 'scale-y-100'}`}>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                <div className={`absolute top-1 right-0.5 w-3 h-3 bg-white rounded-full border border-stone-600 flex items-center justify-center transition-transform duration-100 ${blink ? 'scale-y-0' : 'scale-y-100'}`}>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
              </>
            )}
            
            {/* Antennae */}
            <div className="absolute -top-3 left-1 w-0.5 h-5 bg-stone-800 origin-bottom -rotate-[20deg]"></div>
            <div className="absolute -top-3 right-1 w-0.5 h-5 bg-stone-800 origin-bottom rotate-[20deg]"></div>
        </div>

        {/* Glitch Label */}
        {!isSquashed && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-red-500 bg-black/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-30">
            BUG
          </div>
        )}

      </div>
    </div>
  );
};