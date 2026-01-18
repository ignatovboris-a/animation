import React, { useState, useEffect, useRef } from 'react';
import { OwlCharacter } from './OwlCharacter';
import { OwlAction, Position, BugEntity } from '../../types';

interface OwlWidgetProps {
  bugs: BugEntity[];
  onSquashBug: (id: string) => void;
  onSpawnBug?: () => void;
  onMove?: (pos: Position) => void;
  defaultPosition?: Position;
  scale?: number;
  returnToStart?: boolean;
}

// Massive Russian Jokes List
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
  "Программист не засыпает, он уходит в гибернацию.",
  "Если отладка — это удаление ошибок, то программирование — это их создание.",
  "Знаете, почему программисты любят темную тему? Потому что свет притягивает баги.",
  "Алгоритм: слово, которым программисты называют то, что не хотят объяснять.",
  "Аппаратное обеспечение: та часть компьютера, которую можно пнуть.",
  "Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25.",
  "Самая большая ложь программиста: 'Я сейчас только одну строчку поправлю'.",
  "Junior: пишет код, который не работает. Senior: пишет код, который не работает, но знает почему.",
  "С++: вы стреляете себе в ногу. Сделано.",
  "Python: вы летаете. Но медленно.",
  "Java: вы пишете фабрику для производства фабрик по производству пуль, чтобы выстрелить в ногу.",
  "HTML — это язык программирования. (Шутка, не бейте).",
  "Идеальный код — это тот, который не пришлось писать.",
  "Программирование на 10% состоит из общения с интерпретатором и на 90% из общения с Google.",
  "Мой код работает? — Не трогай!",
  "Как назвать программиста, который бросил девушку? Homeless.",
  "Почему программисты любят кофе? Это легальный способ превратить тревожность в код.",
  "Git blame — лучший способ узнать, кто этот идиот. Ой, это я.",
  "Copy-Paste — паттерн проектирования.",
  "Зачем нам тесты? Пользователи протестируют.",
  "В сутках 24 часа. В пиве 24 бутылки. Совпадение?",
  "Сисадмин от Бога: 'А вы пробовали выключить и включить?'",
  "CSS — это как макияж: без него сайт выглядит как 'Утро понедельника'.",
  "Backend без Frontend'а — как маньяк в лесу: делает страшные вещи, но никто не видит.",
  "Frontend без Backend'а — как манекен: красивый, но пустой внутри.",
  "Какой твой любимый язык? — Сарказм.",
  "Бесконечный цикл — это когда жена говорит: 'Нам надо поговорить'.",
  "Рекурсия: см. Рекурсия.",
  "Я знаю кунг-фу, карате и еще 20 страшных слов... типа 'undefined is not a function'.",
  "Дедлайн — это черта, пересекая которую, ты начинаешь умолять.",
  "Почему программисты не любят природу? Там слишком много багов.",
  "У меня нет проблем с алкоголем. У меня проблемы с реальностью, когда алкоголя нет.",
  "Linux — это бесплатно, если ваше время ничего не стоит.",
  "Windows: Вы уверены? Вы точно уверены? А сейчас?",
  "Mac OS: Вы не можете это сделать. Это некрасиво.",
  "Программист на пляже: смотрит на девушек, оценивает Front-end, думает о Back-end'е.",
  "99 маленьких багов в коде, 99 маленьких багов. Один починил, скомпилил... 127 маленьких багов в коде.",
  "Жизнь программиста: Ctrl+C, Ctrl+V, Coffee, Repeat.",
  "Fullstack — это когда ты можешь накосячить и в базе данных, и в верстке.",
  "SQL-инъекция — это вакцинация базы данных.",
  "Хороший код сам себя документирует. Плохой код требует комментариев. Мой код требует экзорциста.",
  "API — это как официант: ты просишь еду, он приносит еду, ты не знаешь, что творится на кухне.",
  "Облако — это просто чей-то чужой компьютер.",
  "Машинное обучение — это когда компьютер учится ошибаться быстрее человека.",
  "Блокчейн — это решение в поисках проблемы.",
  "Docker — это когда работает на моем компьютере, и мы отправляем мой компьютер в продакшн.",
  "Agile — это когда мы делаем ошибки быстро и итеративно.",
  "Scrum — это повод поговорить 15 минут стоя.",
  "Kanban — это когда задач так много, что мы просто клеим стикеры.",
  "Почему программисты всегда спокойные? Потому что у них есть try-catch на все случаи жизни.",
  "NullPointerException — это способ Java сказать 'Привет'.",
  "Если бы архитекторы строили дома так, как программисты пишут программы, первый залетевший дятел разрушил бы цивилизацию.",
  "Программист заходит в лифт. Ему нужно на 12-й этаж. Он нажимает 1, потом 2 и ищет Enter.",
  "Сколько нужно сеньоров, чтобы поменять лампочку? 'Это на стороне клиента'.",
  "Сколько нужно джунов? 'Я погуглю'.",
  "React: мы переписали всё, чтобы вы могли писать меньше, но настраивать дольше.",
  "Angular: выучи 50 новых понятий, чтобы вывести 'Hello World'.",
  "Vue: я просто хотел сделать сайт...",
  "PHP не умер, он просто плохо пахнет.",
  "JavaScript: '1' + '1' = '11'. '1' - '1' = 0. Логика вышла из чата.",
  "TypeScript: JavaScript, который заставляет тебя извиняться за ошибки.",
  "Python: пробелы важны. Жизнь — боль.",
  "Ruby: магия. Никто не знает, как это работает, но красиво.",
  "Go: у нас нет дженериков. Ой, теперь есть. Зачем?",
  "Rust: компилятор — твой лучший друг, который постоянно тебя бьет.",
  "C: для тех, кто любит ручное управление памятью и страдания.",
  "Assembly: для тех, кто хочет поговорить с процессором по душам.",
  "Программист знакомится с девушкой: 'Ты верстальщик? Потому что ты классовая'.",
  "Удаленка — это когда ты спишь на работе и никто не знает.",
  "Zoom — это современный спиритический сеанс: 'Вася, ты с нами? Вася, дай знак!'",
  "Какая разница между Junior и Senior? Junior копирует с StackOverflow. Senior копирует с StackOverflow и меняет название переменных.",
  "Технический долг — это как кредит: сначала весело, потом платишь проценты.",
  "Рефакторинг — это когда ты перекладываешь грязь из одной кучи в другую, но красиво.",
  "Код-ревью — это когда тебя вежливо просят переписать всё.",
  "Деплой в пятницу — это экстремальный вид спорта.",
  "У меня работает локально! — Самая частая фраза в офисе.",
  "Internet Explorer — лучший браузер для скачивания Chrome.",
  "Кэш — это место, где живут старые версии твоего CSS.",
  "Cookie — это не печенька, это слежка.",
  "Пароль '123456' — классика, которая никогда не устареет (к сожалению).",
  "Хакер в фильмах: стучит по клавишам 300 знаков в минуту. Хакер в жизни: гуглит 'default password admin'.",
  "Двоичный код: 010101. Программист: 'Ага, понятно'. Нормальный человек: 'Матрица?'",
  "Stack Overflow — это внешний мозг программиста.",
  "GitHub — это социальная сеть для интровертов.",
  "Open Source — это когда ты работаешь бесплатно, чтобы другие зарабатывали.",
  "Проприетарное ПО — это когда ты платишь, чтобы страдать.",
  "Лицензионное соглашение — самая непрочитанная книга в мире.",
  "Почему программисты не ходят в лес? Боятся, что деревья будут бинарными.",
  "Поймал программист золотую рыбку. Она ему: отпусти, любое желание исполню. Он: хочу, чтобы этот код работал без багов. Рыбка: жарь.",
  "Разговор двух программистов: — Ну как, продвигается проект? — Да, уже на стадии 'А хрен с ним, и так сойдет'.",
  "Программист приходит к врачу: — Доктор, у меня печень болит. — Это у вас от алкоголя. — А можно патч поставить, чтобы не болела?",
  "Почему Санта-Клаус — программист? У него есть борода, он работает только раз в год и никому не понятен его список.",
  "Джуниор: 'Я закончил'. Сеньор: 'Ты закоммитил?'. Джуниор: 'Я закончил университет'.",
  "Как программист делает предложение девушке? sudo marry me.",
  "Почему у программистов кривые спины? Это не баг, это feature корпуса.",
  "Самая короткая шутка программиста: 'У меня все работает'.",
  "Умер программист, попадает в ад. Там черти, котлы, смола. Он спрашивает: 'А где компьютеры?'. Ему: 'А это и есть ад'.",
  "Программист звонит в библиотеку: — У вас есть книги по API? — Да, в подвале, на третьей полке. — А как туда пройти? — 404 Not Found.",
  "Почему программист не может найти ключи? Потому что он ищет их в кэше.",
  "Три стадии программиста: 1. Я ничего не понимаю. 2. Я все понимаю. 3. Я ничего не понимаю, но оно работает.",
  "Если бы водители учились так же, как программисты: 'Вот руль, вот педали, остальное гугли'.",
  "Программист покупает килограмм яблок. Продавец: 'С вас 100 рублей'. Программист: 'А можно 128 для ровного счета?'",
  "В чем отличие интроверта-программиста от экстраверта? Интроверт смотрит на свои ботинки при разговоре, экстраверт — на ботинки собеседника.",
  "Как называется группа программистов? Массив.",
  "Почему программисты не дерутся? Потому что у них конфликт версий.",
  "Программист заходит в церковь. Священник: 'Покайся, сын мой'. Программист: 'Forgive me, Father, for I have syn...tax error'.",
  "Что говорит программист, когда его просят починить утюг? 'Это проблема с железом, я по софту'.",
  "Как программисты пьют водку? Побайтно.",
  "Девушка программиста: 'Ты меня любишь?'. Программист: 'return true;'",
  "Чем отличается программист от обычного человека? Обычный человек думает, что килограмм — это 1000 грамм, а программист — что километр — это 1024 метра.",
  "Настоящий программист не ставит комментарии. Если код сложно писать, его должно быть сложно читать.",
  "Стук в дверь. — Кто там? — (пауза) — Java.",
  "Почему змеи не умеют программировать? Потому что у них нет рук, чтобы писать на Python.",
  "Жизнь — это игра с отличной графикой, но паршивым сюжетом и донатом.",
  "Бог создал мир за 6 дней. У него явно не было техзадания от заказчика.",
  "Если ты не можешь объяснить это бабушке, значит, ты сам не понимаешь. Или бабушка не знает C++.",
  "Программист — это машина по переработке кофе в код.",
  "Почему программисты любят котов? Потому что коты тоже спят на клавиатуре.",
  "Самый надежный компонент любой системы — тот, который еще не написали.",
  "Лучший антивирус — это здравый смысл. Жаль, что его нельзя скачать.",
  "Никогда не тестируйте глубину реки двумя ногами сразу. И код на проде тоже.",
  "Если бы код строили строители, первый же дятел разрушил бы цивилизацию.",
  "Парень-программист говорит девушке: 'У тебя отличный интерфейс'. Она: 'А как же внутренний мир?'. Он: 'Исходники закрыты'.",
  "Чтобы понять рекурсию, нужно сначала понять рекурсию.",
  "Хороший программист смотрит по сторонам, прежде чем переходить улицу с односторонним движением.",
  "Два байта встречаются. Один другому: 'Ты чего такой грустный?'. — 'Да паритет не сходится'.",
  "Оптимизация кода: удаление комментариев, чтобы файл весил меньше.",
  "Чем отличается хакер от юзера? Хакер знает, что он делает.",
  "Что общего у программистов и наркоманов? Оба тратят все деньги на 'железо' и 'вещества' (кремний).",
  "Программист перед сном ставит на тумбочку два стакана: один с водой, если захочет пить, другой пустой — если не захочет.",
  "Зачем нужен IE? Чтобы скачать Chrome.",
  "Какой пароль самый безопасный? Тот, который ты сам забыл.",
  "Почему программисты не любят загорать? Солнце — это источник бликов на мониторе.",
  "Когда я писал этот код, только я и Бог знали, как он работает. Теперь знает только Бог.",
  "Если программа работает, не трогай её. Если она не работает... тоже не трогай, вдруг станет хуже.",
  "Программист на приеме у психолога: 'Доктор, у меня постоянно ощущение, что за мной следят'. Доктор: 'Вы просто забыли отключить куки'.",
  "Что делает программист, когда ему холодно? Запускает Android Studio, чтобы согреться от ноутбука."
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

  // Level Up Auto-Close Timer (10 seconds)
  useEffect(() => {
    let timer: number;
    if (showLevelUp) {
      timer = window.setTimeout(() => {
        setShowLevelUp(false);
      }, 10000); // 10 seconds auto-dismiss
    }
    return () => clearTimeout(timer);
  }, [showLevelUp]);

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
      // Removing the redundant TELLING_JOKE check here as it is handled by early return
      if (action === OwlAction.ATTACKING || action === OwlAction.CELEBRATING || action === OwlAction.SLEEPING) {
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
  // We want the text to appear right above the head.
  const uiBottomOffset = `${140 * scale}px`;
  
  // Note: We no longer need bubbleScaleCorrection because we don't flip the parent div.

  return (
    <div 
      className="fixed z-50 pointer-events-none" 
      style={{
        left: position.x,
        top: position.y,
        // No translate or scale here. (0,0) is the anchor point (Owl's feet location)
      }}
    >
      
      {/* Owl Container - Handles Flip and Scale */}
      <div 
        className="absolute bottom-0 left-0 transition-transform cursor-pointer pointer-events-auto"
        style={{ 
            // Scale the Owl and Flip based on direction
            transform: `translate(-50%, 0) scale(${scale}) scaleX(${facingRight ? 1 : -1})`,
            transformOrigin: 'bottom center',
            width: '6rem', // Area to catch clicks
            height: '8rem',
        }}
        onClick={handleOwlClick}
        onContextMenu={handleContextMenu}
      > 
          <OwlCharacter 
            action={action} 
            lookAt={bugs.find(b => !b.isSquashed) ? bugs.find(b => !b.isSquashed)! : mousePos}
            scale={1} // Scale is handled by wrapper
          />
      </div>

      {/* Shadow */}
      <div className="absolute bottom-0 left-0 -translate-x-1/2 w-16 h-4 bg-black/20 rounded-[100%] blur-sm -z-10 pointer-events-none"></div>
      
      {/* Floating XP Text - Always upright */}
      {xpFloat.show && (
        <div 
            key={xpFloat.id}
            className="absolute left-0 -translate-x-1/2 text-amber-500 font-black text-xl pointer-events-none z-[60] whitespace-nowrap"
            style={{ 
                bottom: uiBottomOffset, 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: 'floatUp 1s ease-out forwards'
            }}
        >
            +20 XP
        </div>
      )}

      {/* Level Up Menu - Always upright */}
      {showLevelUp && (
        <div 
            className="absolute left-0 -translate-x-1/2 bg-white/95 backdrop-blur rounded-xl shadow-2xl border-2 border-amber-400 p-2 z-[70] flex flex-col gap-1 items-center min-w-[120px] cursor-auto pointer-events-auto"
            style={{ 
                bottom: uiBottomOffset, 
                transform: `translateY(-10px)`
            }}
            onClick={(e) => e.stopPropagation()} 
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

      {/* Celebration Speech Bubble - Positioned to the side */}
      {!showLevelUp && action === OwlAction.CELEBRATING && (
        <div 
            className="absolute bg-white px-3 py-1 rounded-xl shadow-lg border border-gray-200 animate-bounce whitespace-nowrap z-[60] pointer-events-auto"
            style={{ 
                bottom: uiBottomOffset,
                left: '2rem', // Fixed to right side of owl center
            }}
        >
            <p className="text-xs font-bold text-gray-800">Готово!</p>
        </div>
      )}

      {/* Joke Speech Bubble - Centered */}
      {currentJoke && (
        <div 
           className="absolute left-0 -translate-x-1/2 w-64 bg-white p-4 rounded-2xl shadow-xl border-2 border-stone-200 z-50 text-center cursor-auto pointer-events-auto"
           style={{ 
               bottom: `${160 * scale}px`, 
           }} 
        >
            <p className="text-sm font-bold text-stone-800 leading-snug">{currentJoke}</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-stone-200 rotate-45"></div>
        </div>
      )}
      
      {/* Inline styles for simple keyframes */}
      <style>{`
        @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
};