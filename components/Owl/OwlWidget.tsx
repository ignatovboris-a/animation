import React, { useState, useEffect, useRef } from 'react';
import { OwlCharacter } from './OwlCharacter';
import { OwlAction, Position, BugEntity } from '../../types';

interface OwlWidgetProps {
  bugs: BugEntity[];
  onSquashBug: (id: string) => void;
  onMove?: (pos: Position) => void; // Report position to parent (for bug AI)
  defaultPosition?: Position;
  scale?: number;
  returnToStart?: boolean; // New Prop: Should owl go home after work?
}

const CODING_JOKES = [
  "Why do Java developers wear glasses? Because they don't C#.",
  "Knock, knock. Who’s there? Recursion. Knock, knock.",
  "0 is false and 1 is true, right? 1.",
  "Why did the developer go broke? Because he used up all his cache.",
  "I am a programmer, I have no life.",
  "Semicolons are the hide and seek champions of the coding world.",
  "Real programmers count from 0.",
  "It’s not a bug, it’s an undocumented feature.",
  "!false - It's funny because it's true.",
  "There are 10 types of people: those who understand binary, and those who don't.",
  "Computers are fast; programmers keep it slow.",
  "One does not simply write bug-free code.",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "My code doesn’t work, I have no idea why. My code works, I have no idea why.",
  "What is a programmer's favorite hangout place? Foo Bar.",
  "A SQL query walks into a bar, asks two tables: 'Can I join you?'",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "Programming is 10% writing code and 90% understanding why it’s not working.",
  "I told my computer I needed a break, and now it won't stop sending me Kit-Kats."
];

export const OwlWidget: React.FC<OwlWidgetProps> = ({ 
  bugs, 
  onSquashBug, 
  onMove, 
  defaultPosition = { x: 100, y: 100 }, 
  scale = 0.8,
  returnToStart = false 
}) => {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [action, setAction] = useState<OwlAction>(OwlAction.IDLE);
  const [facingRight, setFacingRight] = useState(true);
  const [mousePos, setMousePos] = useState<Position | null>(null);
  
  // Joke State
  const [currentJoke, setCurrentJoke] = useState<string | null>(null);
  const jokeTimeoutRef = useRef<number | null>(null);

  // Initial Position Logic: If defaultPosition changes drastically, teleport or acknowledge?
  // We generally trust the internal state, but on mount we respect default.
  // We use a ref to track if we've initialized to avoid jumping if prop updates.
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
        setPosition(defaultPosition);
        initialized.current = true;
    }
  }, [defaultPosition]);

  // Speed constants
  const SPEED = 4; // Pixels per frame
  const ATTACK_RANGE = 60; // Distance to trigger attack

  const requestRef = useRef<number>(0);

  // Track mouse for eye movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOwlClick = () => {
    // Only joke if not doing something critical
    if (action === OwlAction.ATTACKING || action === OwlAction.HUNTING) return;

    if (jokeTimeoutRef.current) {
        clearTimeout(jokeTimeoutRef.current);
    }

    const randomJoke = CODING_JOKES[Math.floor(Math.random() * CODING_JOKES.length)];
    setCurrentJoke(randomJoke);
    setAction(OwlAction.TELLING_JOKE);

    jokeTimeoutRef.current = window.setTimeout(() => {
        setCurrentJoke(null);
        setAction(OwlAction.IDLE);
    }, 5000); // 5 seconds to read
  };

  // Main Game Loop / Animation Loop
  const animate = () => {
    // 1. Find nearest active bug
    const activeBug = bugs.find(b => !b.isSquashed);

    // If telling a joke, stay still but allow cancelling if a bug gets SUPER close? 
    // No, let's prioritize the joke for a moment unless the bug is literally on top.
    if (action === OwlAction.TELLING_JOKE) {
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    if (activeBug) {
      // Logic for hunting
      const dx = activeBug.x - position.x;
      const dy = activeBug.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Determine Facing Direction
      if (dx > 0 && !facingRight) setFacingRight(true);
      if (dx < 0 && facingRight) setFacingRight(false);

      if (distance < ATTACK_RANGE) {
        // Attack Logic
        if (action !== OwlAction.ATTACKING && action !== OwlAction.CELEBRATING) {
          setAction(OwlAction.ATTACKING);
          
          // Trigger squash after swing delay
          setTimeout(() => {
            onSquashBug(activeBug.id);
            // Celebration after squash
            setTimeout(() => {
               setAction(OwlAction.CELEBRATING);
               // Back to idle handled by logic below once bug is gone/squashed
               setTimeout(() => {
                 // Force idle briefly to reset state before loop picks up next action
                 setAction(OwlAction.IDLE);
               }, 1500);
            }, 300);
          }, 400); // Sync with hammer animation
        }
      } else if (action !== OwlAction.ATTACKING && action !== OwlAction.CELEBRATING) {
        // Move towards bug
        setAction(OwlAction.HUNTING);
        
        // Normalize vector
        const vx = (dx / distance) * SPEED;
        const vy = (dy / distance) * SPEED;

        const newPos = {
          x: position.x + vx,
          y: position.y + vy
        };
        setPosition(newPos);
        if (onMove) onMove(newPos);
      }

    } else {
      // --- NO ACTIVE BUGS ---

      // Check priorities: Attacking/Celebrating/Sleeping take precedence
      if (action === OwlAction.ATTACKING || action === OwlAction.CELEBRATING || action === OwlAction.SLEEPING || action === OwlAction.TELLING_JOKE) {
        // Do nothing, let animation play out
      } else {
        // We are free to Idle or Return to Start
        
        if (returnToStart) {
            // Calculate distance to Home
            const dx = defaultPosition.x - position.x;
            const dy = defaultPosition.y - position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // If we are far from home, walk there
            if (dist > 5) {
                if (action !== OwlAction.WALKING) setAction(OwlAction.WALKING);

                if (dx > 0 && !facingRight) setFacingRight(true);
                if (dx < 0 && facingRight) setFacingRight(false);

                const vx = (dx / dist) * SPEED;
                const vy = (dy / dist) * SPEED;

                const newPos = {
                    x: position.x + vx,
                    y: position.y + vy
                };
                setPosition(newPos);
                if (onMove) onMove(newPos);
            } else {
                // We are home
                if (action !== OwlAction.IDLE) setAction(OwlAction.IDLE);
            }
        } else {
            // Just idle where we are
            if (action !== OwlAction.IDLE) setAction(OwlAction.IDLE);
        }
      }
      
      // Keep reporting position
      if (onMove) onMove(position);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bugs, position, action, facingRight, defaultPosition, returnToStart]);

  return (
    <div 
      className="fixed z-50 transition-transform"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -100%) scale(${facingRight ? 1 : -1}, 1)` // Flip horizontally for direction
      }}
    >
      <div style={{ transform: `scale(${facingRight ? 1 : -1}, 1)` }}> 
          {/* We pass a "LookAt" target. If hunting, look at bug. If idle, look at mouse. */}
          <OwlCharacter 
            action={action} 
            lookAt={bugs.find(b => !b.isSquashed) ? bugs.find(b => !b.isSquashed)! : mousePos}
            scale={scale}
            onClick={handleOwlClick}
          />
      </div>

      {/* Shadow on the "Floor" */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-16 h-4 bg-black/20 rounded-[100%] blur-sm -z-10"></div>
      
      {/* Celebration Speech Bubble */}
      {action === OwlAction.CELEBRATING && (
        <div 
            className="absolute -top-16 -right-12 bg-white px-3 py-1 rounded-xl shadow-lg border border-gray-200 animate-bounce"
            style={{ transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)' }} // Keep text readable
        >
            <p className="text-xs font-bold text-gray-800">Fixed it!</p>
        </div>
      )}

      {/* Joke Speech Bubble */}
      {currentJoke && (
        <div 
           className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 bg-white p-4 rounded-2xl shadow-xl border-2 border-stone-200 z-50 text-center"
           style={{ transform: `translate(-50%, 0) ${facingRight ? 'scaleX(1)' : 'scaleX(-1)'}` }} // Counter-flip text
        >
            <p className="text-sm font-bold text-stone-800 leading-snug">{currentJoke}</p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-stone-200 rotate-45"></div>
        </div>
      )}
    </div>
  );
};