import React, { useEffect, useState } from 'react';
import { OwlAction, Position } from '../../types';

interface OwlCharacterProps {
  action: OwlAction;
  lookAt: Position | null;
  scale?: number;
  onClick?: () => void;
}

/**
 * A "CSS-3D" Owl. 
 * Narrower body, improved beak/wings, and articulated feet with claws.
 * Added: Expressive eyebrows, adjustable beak position, ears, and scaled down.
 */
export const OwlCharacter: React.FC<OwlCharacterProps> = ({ action, lookAt, scale = 0.8, onClick }) => {
  const [blink, setBlink] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  // Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Eye Tracking Logic
  useEffect(() => {
    if (!lookAt) {
      setPupilPos({ x: 0, y: 0 });
      return;
    }
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const maxOffset = 5; 
    const dx = Math.min(Math.max((lookAt.x - centerX) / (window.innerWidth / 2), -1), 1);
    const dy = Math.min(Math.max((lookAt.y - centerY) / (window.innerHeight / 2), -1), 1);

    setPupilPos({
      x: dx * maxOffset,
      y: dy * maxOffset
    });
  }, [lookAt]);

  const isAttacking = action === OwlAction.ATTACKING;
  const isHunting = action === OwlAction.HUNTING;
  const isWalking = action === OwlAction.WALKING || isHunting;
  const isSleeping = action === OwlAction.SLEEPING;
  const isCelebrating = action === OwlAction.CELEBRATING;
  const isTellingJoke = action === OwlAction.TELLING_JOKE;

  // Animation Classes
  const bodyAnimClass = isWalking ? 'animate-body-walk' : '';
  
  const eyeRotation = isCelebrating ? 'rotate-180 transition-transform duration-700' : 'transition-transform duration-200';

  // --- Expression Logic ---
  let eyebrowLeftClass = "rotate-0 -translate-y-0.5";
  let eyebrowRightClass = "rotate-0 -translate-y-0.5";
  
  // Eyelids now have top and bottom controls
  let eyelidTopHeight = "h-0"; 
  let eyelidBottomHeight = "h-0";

  if (isAttacking || isHunting) {
    // Strict / Focused / Angry
    eyebrowLeftClass = "rotate-[25deg] translate-y-2";
    eyebrowRightClass = "-rotate-[25deg] translate-y-2";
    eyelidTopHeight = "h-3"; // Squint Top
  } else if (isCelebrating) {
    // Happy / Surprised
    eyebrowLeftClass = "-rotate-[15deg] -translate-y-2";
    eyebrowRightClass = "rotate-[15deg] -translate-y-2";
  } else if (isTellingJoke) {
    // Cute Squint (Happy)
    // Eyebrows slightly up or neutral
    eyebrowLeftClass = "rotate-0 -translate-y-1";
    eyebrowRightClass = "rotate-0 -translate-y-1";
    // Both lids close in to make "n" shape or crescent
    eyelidTopHeight = "h-[45%]";
    eyelidBottomHeight = "h-[45%]";
  } else if (isSleeping) {
    eyelidTopHeight = "h-full";
    eyebrowLeftClass = "rotate-0 translate-y-0";
    eyebrowRightClass = "rotate-0 translate-y-0";
  } else {
    // Idle / Relaxed
    eyebrowLeftClass = "rotate-0 -translate-y-1";
    eyebrowRightClass = "rotate-0 -translate-y-1";
  }

  // Blink overrides everything
  if (blink) {
    eyelidTopHeight = "h-full";
  }


  // Helper for rendering a clawed toe
  const Toe = ({ rotate, length = "h-4" }: { rotate: string, length?: string }) => (
    <div className={`absolute top-0 w-1.5 ${length} bg-amber-500 rounded-full origin-top flex flex-col items-center justify-end ${rotate}`}>
       {/* Claw */}
       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-stone-900 translate-y-1"></div>
    </div>
  );

  return (
    // Outer Wrapper handles the Scale dynamically via style
    <div 
      className="relative w-[5.5rem] h-32 origin-bottom transition-transform duration-500 cursor-pointer group"
      style={{ transform: `scale(${scale})` }}
      onClick={onClick}
    >
      
      {/* Inner Container handles Animation Transforms (Walking sway) */}
      <div className={`absolute inset-0 select-none ${bodyAnimClass}`} style={{ transition: 'all 0.5s ease' }}>
        
        {/* --- WINGS (Shoulder Position - Folded) --- */}
        {/* Left Wing */}
        <div 
          className={`absolute -left-2.5 top-9 w-7 h-16 bg-stone-700 rounded-b-3xl rounded-t-xl origin-top-right shadow-lg z-20 transition-transform duration-300 border-l border-stone-600
          ${isAttacking ? '-rotate-[100deg] translate-x-4 -translate-y-4' : 'rotate-0'}
          ${isWalking ? 'animate-[pulse_0.6s_ease-in-out_infinite]' : ''}
          ${isTellingJoke ? 'rotate-[10deg]' : ''} 
          `}
        >
          {/* Wing Feathers Detail */}
          <div className="absolute bottom-2 right-0 w-5 h-8 bg-stone-600 rounded-b-2xl opacity-50"></div>
          <div className="absolute bottom-6 right-1 w-4 h-6 bg-stone-500 rounded-b-xl opacity-30"></div>
        </div>

        {/* Right Wing */}
        <div 
          className={`absolute -right-2.5 top-9 w-7 h-16 bg-stone-700 rounded-b-3xl rounded-t-xl origin-top-left shadow-lg z-20 transition-transform duration-300 border-r border-stone-600
          ${isAttacking ? 'rotate-[80deg]' : '-rotate-0'}
          ${isWalking ? 'animate-[pulse_0.6s_ease-in-out_infinite_0.3s]' : ''}
          ${isTellingJoke ? '-rotate-[10deg]' : ''}
          `}
        >
          <div className="absolute bottom-2 left-0 w-5 h-8 bg-stone-600 rounded-b-2xl opacity-50"></div>
          <div className="absolute bottom-6 left-1 w-4 h-6 bg-stone-500 rounded-b-xl opacity-30"></div>
        </div>

        {/* --- LEGS & CLAWS (Seamless Connection) --- */}
        {/* Legs Container */}
        <div className="absolute bottom-3.5 w-full flex justify-center space-x-6 z-10">
            
            {/* Left Leg */}
            <div className={`relative group flex flex-col items-center ${isWalking ? 'animate-walk-left' : ''}`}>
              <div className="absolute -top-3 w-5 h-5 bg-stone-800 rounded-full -z-10"></div>
              <div className="w-1.5 h-4 bg-amber-600 rounded-full shadow-sm z-10"></div>
              <div className="absolute bottom-[-2px] w-2.5 h-2.5 bg-amber-600 rounded-full z-10"></div>
              <div className="absolute bottom-0 translate-y-0.5 z-0">
                  <Toe rotate="-rotate-[35deg]" length="h-4" />
                  <Toe rotate="rotate-0" length="h-5" />
                  <Toe rotate="rotate-[35deg]" length="h-4" />
              </div>
            </div>

            {/* Right Leg */}
            <div className={`relative group flex flex-col items-center ${isWalking ? 'animate-walk-right' : ''}`}>
              <div className="absolute -top-3 w-5 h-5 bg-stone-800 rounded-full -z-10"></div>
              <div className="w-1.5 h-4 bg-amber-600 rounded-full shadow-sm z-10"></div>
              <div className="absolute bottom-[-2px] w-2.5 h-2.5 bg-amber-600 rounded-full z-10"></div>
              <div className="absolute bottom-0 translate-y-0.5 z-0">
                  <Toe rotate="-rotate-[35deg]" length="h-4" />
                  <Toe rotate="rotate-0" length="h-5" />
                  <Toe rotate="rotate-[35deg]" length="h-4" />
              </div>
            </div>

        </div>

        {/* --- TAIL --- */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-stone-800 rounded-b-xl -z-10 origin-top animate-[wiggle_2s_infinite] border-2 border-stone-900/20"></div>

        {/* --- BODY --- */}
        <div className="absolute inset-x-1 top-8 bottom-4 bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 rounded-[35px] shadow-inner z-10 overflow-hidden border border-stone-800/30">
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[85%] h-[70%] bg-stone-200 opacity-90 rounded-[25px] feather-pattern blur-[0.5px] origin-bottom ${!isWalking ? 'animate-breathe' : ''}`}></div>
        </div>

        {/* --- HEAD --- */}
        <div className="absolute -top-2 -left-1 -right-1 h-20 bg-gradient-to-b from-stone-600 to-stone-700 rounded-[30px] shadow-lg z-20 overflow-visible border-b-4 border-stone-900/30">
          
          {/* Ear Tufts - Narrow Rectangles */}
          <div className="absolute -top-4 left-1 w-3 h-8 bg-stone-700 -rotate-[15deg] rounded-t-sm border-l border-stone-600 z-0"></div>
          <div className="absolute -top-4 right-1 w-3 h-8 bg-stone-700 rotate-[15deg] rounded-t-sm border-r border-stone-600 z-0"></div>

          {/* Face Mask - Eyes closer together (space-x-[-1px]) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[92%] h-[75%] bg-stone-300 rounded-[22px] shadow-inner flex items-center justify-center space-x-[-1px] overflow-hidden">
            
            {/* Left Eye */}
            <div className="relative w-[2.1rem] h-[2.1rem] bg-stone-800 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-stone-400/50 z-10">
              {/* Eyelid Top */}
              <div className={`absolute top-0 left-0 w-full bg-stone-600 z-30 transition-all duration-200 ${eyelidTopHeight} border-b border-stone-700`}></div>
              {/* Eyelid Bottom (For Squinting) */}
              <div className={`absolute bottom-0 left-0 w-full bg-stone-600 z-30 transition-all duration-200 ${eyelidBottomHeight} border-t border-stone-700`}></div>
              
              {/* Eyebrow */}
              <div className={`absolute -top-1 left-0 w-[120%] h-4 bg-stone-800 z-40 rounded-b-md transition-transform duration-300 origin-center ${eyebrowLeftClass}`}></div>

              {/* Iris */}
              <div className={`relative w-[1.8rem] h-[1.8rem] bg-yellow-400 rounded-full shadow-inner overflow-hidden ${eyeRotation}`}>
                  <div 
                    className="absolute w-4 h-4 bg-black rounded-full top-1/2 left-1/2 transition-all duration-75 ease-out"
                    style={{ transform: `translate(-50%, -50%) translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                  >
                    <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                  </div>
              </div>
            </div>

            {/* Beak - Lower Position (mt-7) */}
            <div className="relative w-4 h-5 z-50 mt-7 mx-[-4px] drop-shadow-md">
              {/* Upper Beak */}
              <div className="w-full h-full bg-amber-500 rounded-t-lg rounded-b-sm shadow-sm border border-amber-600/50" 
                    style={{ borderRadius: '40% 40% 80% 80%' }}></div>
              {/* Lower hook/tip illusion */}
              <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-600 rounded-full clip-path-polygon"></div>
            </div>

            {/* Right Eye */}
            <div className="relative w-[2.1rem] h-[2.1rem] bg-stone-800 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-stone-400/50 z-10">
              {/* Eyelid Top */}
              <div className={`absolute top-0 left-0 w-full bg-stone-600 z-30 transition-all duration-200 ${eyelidTopHeight} border-b border-stone-700`}></div>
              {/* Eyelid Bottom */}
              <div className={`absolute bottom-0 left-0 w-full bg-stone-600 z-30 transition-all duration-200 ${eyelidBottomHeight} border-t border-stone-700`}></div>
              
              {/* Eyebrow */}
              <div className={`absolute -top-1 right-0 w-[120%] h-4 bg-stone-800 z-40 rounded-b-md transition-transform duration-300 origin-center ${eyebrowRightClass}`}></div>
              
              {/* Iris */}
              <div className={`relative w-[1.8rem] h-[1.8rem] bg-yellow-400 rounded-full shadow-inner overflow-hidden ${eyeRotation}`}>
                  <div 
                    className="absolute w-4 h-4 bg-black rounded-full top-1/2 left-1/2 transition-all duration-75 ease-out"
                    style={{ transform: `translate(-50%, -50%) translate(${pupilPos.x}px, ${pupilPos.y}px)` }}
                  >
                    <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                  </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- ITEMS / TOOLS --- */}
        {/* Hammer */}
        <div 
          className={`absolute -left-6 -top-6 w-14 h-14 pointer-events-none transition-all duration-200 z-30
            ${isAttacking ? 'opacity-100 scale-100 rotate-[-45deg]' : 'opacity-0 scale-50 rotate-0'}
          `}
        >
          <div className="absolute left-1/2 top-1/2 w-1.5 h-10 bg-amber-900 -translate-x-1/2 rounded-full"></div>
          <div className="absolute left-1/2 top-1 w-8 h-5 bg-gray-400 rounded-sm border-2 border-gray-300 -translate-x-1/2 shadow-lg flex">
              <div className="w-1/2 h-full border-r border-gray-500/30"></div>
          </div>
        </div>

        {/* Sweat Drop */}
        {action === OwlAction.HUNTING && (
          <div className="absolute -right-1 top-0 text-blue-400 text-lg animate-bounce">💧</div>
        )}

      </div>
    </div>
  );
};