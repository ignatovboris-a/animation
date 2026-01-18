import React, { useState, useEffect, useRef } from 'react';
import { OwlCharacter } from './OwlCharacter';
import { OwlAction, Position, BugEntity } from '../../types';

interface OwlWidgetProps {
  bugs: BugEntity[];
  onSquashBug: (id: string) => void;
  onSpawnBug?: () => void; // Added for Right-Click functionality
  onMove?: (pos: Position) => void;
  defaultPosition?: Position;
  scale?: number;
  returnToStart?: boolean;
}

// Russian Jokes List
const RUSSIAN_JOKES = [
  "Почему Java-разработчики носят очки? Потому что не видят C#.",
  "Жена: 'Сходи за хлебом, если будут яйца — возьми десяток'. Программист купил 10 буханок.",
  "Оптимист: стакан наполовину полон. Программист: стакан в 2 раза больше, чем нужно.",
  "Сколько программистов нужно, чтобы вкрутить лампочку? Ни одного, это проблема железа.",
  "Заходит SQL запрос в бар, подходит к двум столам и спрашивает: 'Можно присоединиться?'",
  "Самый страшный сон: код заработал с первого раза, и я не знаю почему.",
  "Комментарии в коде — как туалетная бумага: лучше, когда они есть.",
  "Тимлид — это человек, который решает проблемы, о которых ты не знал, способом, который ты не поймешь.",
  "У программиста два состояния: 'Я Бог' и 'Я ничтожество'.",
  "Заходит тестировщик в бар. Забегает в бар. Пролезает через окно. Танцует на барной стойке.",
  "Настоящий программист считает с нуля.",
  "Это не баг, это незадокументированная фича.",
  "В мире 10 типов людей: те, кто понимает двоичную систему, и те, кто нет.",
  "Код пишется для людей, а не для машин. (с) Тот, кто никогда не поддерживал легаси.",
  "!false — это смешно, потому что это правда.",
];

export const OwlWidget: React.FC<OwlWidgetProps> = ({ 
  bugs, 
  onSquashBug,
  onSpawnBug, 
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

  // Reaction Delay State
  const targetBugIdRef = useRef<string | null>(null);
  const nextHuntTimeRef = useRef<number>(0);

  // RPG System State
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [stats, setStats] = useState({ str: 0, agi: 0, int: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ show: boolean, id: number }>({ show: false, id: 0 });

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
        setPosition(defaultPosition);
        initialized.current = true;
    }
  }, [defaultPosition]);

  // Speed constants
  const SPEED = 2; 
  const ATTACK_RANGE = 60;

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
    // Left click - Joke
    if (action === OwlAction.ATTACKING || action === OwlAction.HUNTING) return;

    if (jokeTimeoutRef.current) {
        clearTimeout(jokeTimeoutRef.current);
    }

    const randomJoke = RUSSIAN_JOKES[Math.floor(Math.random() * RUSSIAN_JOKES.length)];
    setCurrentJoke(randomJoke);
    setAction(OwlAction.TELLING_JOKE);

    jokeTimeoutRef.current = window.setTimeout(() => {
        setCurrentJoke(null);
        setAction(OwlAction.IDLE);
    }, 5000);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSpawnBug) onSpawnBug();
  };

  const handleLevelUp = (stat: 'str' | 'agi' | 'int') => {
    setStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    setXp(prev => prev - 100);
    setShowLevelUp(false);
    // Simple celebration
    setAction(OwlAction.CELEBRATING);
    setTimeout(() => setAction(OwlAction.IDLE), 1000);
  };

  // Check for level up availability
  useEffect(() => {
    if (xp >= 100) {
        setShowLevelUp(true);
    }
  }, [xp]);

  // Main Game Loop
  const animate = () => {
    const activeBug = bugs.find(b => !b.isSquashed);

    if (action === OwlAction.TELLING_JOKE) {
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    // Reaction Delay Logic
    let shouldHunt = false;
    
    if (activeBug) {
        if (targetBugIdRef.current !== activeBug.id) {
            targetBugIdRef.current = activeBug.id;
            const delay = 3000 + Math.random() * 7000;
            nextHuntTimeRef.current = Date.now() + delay;
        }
        if (Date.now() >= nextHuntTimeRef.current) {
            shouldHunt = true;
        }
    } else {
        targetBugIdRef.current = null;
        nextHuntTimeRef.current = 0;
    }

    if (shouldHunt && activeBug) {
      const dx = activeBug.x - position.x;
      const dy = activeBug.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (dx > 0 && !facingRight) setFacingRight(true);
      if (dx < 0 && facingRight) setFacingRight(false);

      if (distance < ATTACK_RANGE) {
        if (action !== OwlAction.ATTACKING && action !== OwlAction.CELEBRATING) {
          setAction(OwlAction.ATTACKING);
          
          setTimeout(() => {
            onSquashBug(activeBug.id);
            // Add XP
            setXp(prev => prev + 20);
            setXpFloat({ show: true, id: Date.now() });
            setTimeout(() => setXpFloat(prev => ({ ...prev, show: false })), 1000);

            setTimeout(() => {
               setAction(OwlAction.CELEBRATING);
               setTimeout(() => {
                 setAction(OwlAction.IDLE);
               }, 1500);
            }, 300);
          }, 400); 
        }
      } else if (action !== OwlAction.ATTACKING && action !== OwlAction.CELEBRATING) {
        setAction(OwlAction.HUNTING);
        const vx = (dx / distance) * SPEED;
        const vy = (dy / distance) * SPEED;
        const newPos = { x: position.x + vx, y: position.y + vy };
        setPosition(newPos);
        if (onMove) onMove(newPos);
      }

    } else {
      if (action === OwlAction.ATTACKING || action === OwlAction.CELEBRATING || action === OwlAction.SLEEPING || action === OwlAction.TELLING_JOKE) {
        // busy
      } else {
        if (returnToStart) {
            const dx = defaultPosition.x - position.x;
            const dy = defaultPosition.y - position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > 5) {
                if (action !== OwlAction.WALKING) setAction(OwlAction.WALKING);
                if (dx > 0 && !facingRight) setFacingRight(true);
                if (dx < 0 && facingRight) setFacingRight(false);
                const vx = (dx / dist) * SPEED;
                const vy = (dy / dist) * SPEED;
                setPosition({ x: position.x + vx, y: position.y + vy });
                if (onMove) onMove({ x: position.x + vx, y: position.y + vy });
            } else {
                if (action !== OwlAction.IDLE) setAction(OwlAction.IDLE);
            }
        } else {
            if (action !== OwlAction.IDLE) setAction(OwlAction.IDLE);
        }
      }
      if (onMove) onMove(position);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [bugs, position, action, facingRight, defaultPosition, returnToStart]);

  // Dynamic Height calculation for UI elements based on scale
  // Base height of owl visual is approx 130px (8rem + beak/ears)
  // We want the text to appear right above the head.
  const uiBottomOffset = `${140 * scale}px`;
  const bubbleScaleCorrection = facingRight ? 'scaleX(1)' : 'scaleX(-1)';

  return (
    <div 
      className="fixed z-50 transition-transform"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -100%) scale(${facingRight ? 1 : -1}, 1)` 
      }}
      onContextMenu={handleContextMenu}
    >
      <div style={{ transform: `scale(${scale})` }}> 
          <OwlCharacter 
            action={action} 
            lookAt={bugs.find(b => !b.isSquashed) ? bugs.find(b => !b.isSquashed)! : mousePos}
            scale={scale}
            onClick={handleOwlClick}
          />
      </div>

      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-16 h-4 bg-black/20 rounded-[100%] blur-sm -z-10"></div>
      
      {/* Floating XP Text */}
      {xpFloat.show && (
        <div 
            key={xpFloat.id}
            className="absolute left-1/2 -translate-x-1/2 text-amber-500 font-black text-xl pointer-events-none z-[60]"
            style={{ 
                bottom: uiBottomOffset, 
                transform: bubbleScaleCorrection, // Always readable
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: 'floatUp 1s ease-out forwards'
            }}
        >
            +20 XP
        </div>
      )}

      {/* Level Up Menu */}
      {showLevelUp && (
        <div 
            className="absolute left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-xl shadow-2xl border-2 border-amber-400 p-2 z-[70] flex flex-col gap-1 items-center min-w-[120px]"
            style={{ 
                bottom: uiBottomOffset, 
                transform: `translate(0, -10px) ${bubbleScaleCorrection}` // Move up slightly and correct text
            }}
        >
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wide border-b border-amber-100 w-full text-center pb-1 mb-1">
                Новый уровень!
            </div>
            <button onClick={() => handleLevelUp('str')} className="w-full text-left text-xs font-bold text-slate-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors flex justify-between">
                <span>Сила</span> <span className="text-green-600">+1</span>
            </button>
            <button onClick={() => handleLevelUp('agi')} className="w-full text-left text-xs font-bold text-slate-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors flex justify-between">
                <span>Ловкость</span> <span className="text-green-600">+1</span>
            </button>
            <button onClick={() => handleLevelUp('int')} className="w-full text-left text-xs font-bold text-slate-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors flex justify-between">
                <span>Интеллект</span> <span className="text-green-600">+1</span>
            </button>
        </div>
      )}

      {/* Celebration Speech Bubble (Legacy) */}
      {!showLevelUp && action === OwlAction.CELEBRATING && (
        <div 
            className="absolute bg-white px-3 py-1 rounded-xl shadow-lg border border-gray-200 animate-bounce whitespace-nowrap"
            style={{ 
                bottom: uiBottomOffset,
                right: '-1rem', // Slight offset to right
                transform: bubbleScaleCorrection 
            }}
        >
            <p className="text-xs font-bold text-gray-800">Готово!</p>
        </div>
      )}

      {/* Joke Speech Bubble */}
      {currentJoke && (
        <div 
           className="absolute left-1/2 -translate-x-1/2 w-64 bg-white p-4 rounded-2xl shadow-xl border-2 border-stone-200 z-50 text-center"
           style={{ 
               bottom: `${160 * scale}px`, // Higher than XP/Menus
               transform: `translate(0, 0) ${bubbleScaleCorrection}` 
           }} 
        >
            <p className="text-sm font-bold text-stone-800 leading-snug">{currentJoke}</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-stone-200 rotate-45"></div>
        </div>
      )}
      
      {/* Inline styles for simple keyframes */}
      <style>{`
        @keyframes floatUp {
            0% { opacity: 1; transform: ${bubbleScaleCorrection} translateY(0); }
            100% { opacity: 0; transform: ${bubbleScaleCorrection} translateY(-30px); }
        }
      `}</style>
    </div>
  );
};