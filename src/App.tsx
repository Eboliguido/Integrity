/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { 
  Activity, 
  Brain, 
  ShieldCheck, 
  Stethoscope, 
  LineChart, 
  Users, 
  ArrowRight, 
  ChevronRight,
  Database,
  Search,
  CheckCircle2,
  Menu,
  X,
  Target,
  Volume2,
  VolumeX
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const startYRef = useRef(0);
  const startScrollYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (isDraggingRef.current) {
        const dy = e.clientY - startYRef.current;
        window.scrollTo({
          top: startScrollYRef.current - dy,
          behavior: "auto"
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a')
      ) return;

      isDraggingRef.current = true;
      setIsDragging(true);
      startYRef.current = e.clientY;
      startScrollYRef.current = window.scrollY;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <NeuralCursorEffect />
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-integrity-bright rounded-full pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isDragging ? 0.6 : (isHovering ? 2 : 1),
          rotate: isHovering ? 180 : (isDragging ? 45 : 0),
          borderWidth: isHovering || isDragging ? "2px" : "1px",
          borderColor: isDragging ? "#fff" : "var(--color-integrity-bright)",
        }}
      >
        <div className={`w-1 h-1 rounded-full opacity-50 ${isDragging ? 'bg-white' : 'bg-integrity-bright'}`} />
      </motion.div>

      {/* Crosshair Dots */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="relative">
          <motion.div 
            animate={{ 
              opacity: isHovering || isDragging ? 1 : 0.5,
              scale: isDragging ? 1.5 : 1,
              backgroundColor: isDragging ? "#fff" : "var(--color-integrity-bright)"
            }}
            className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_var(--color-integrity-bright)]" 
          />
          {(isHovering || isDragging) && (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ 
                 scale: isDragging ? [1, 1.2, 1] : [1, 1.5], 
                 opacity: isDragging ? [0.4, 0.8, 0.4] : [0.5, 0] 
               }}
               transition={{ repeat: Infinity, duration: isDragging ? 0.5 : 1 }}
               className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border rounded-full ${isDragging ? 'border-white' : 'border-integrity-bright'}`}
             />
          )}
        </div>
      </motion.div>

      {/* Trailing energy nodes */}
      {[...Array(3)].map((_, i) => (
        <TrailingNode key={i} mouseX={mouseX} mouseY={mouseY} delay={i * 2} />
      ))}
    </>
  );
};

interface TrailingNodeProps {
  key?: any;
  mouseX: any;
  mouseY: any;
  delay: number;
}

const TrailingNode = ({ mouseX, mouseY, delay }: TrailingNodeProps) => {
  const x = useSpring(mouseX, { damping: 40 + delay, stiffness: 100 + delay });
  const y = useSpring(mouseY, { damping: 40 + delay, stiffness: 100 + delay });

  return (
    <motion.div
      className="fixed top-0 left-0 w-1 h-1 bg-integrity-bright rounded-full pointer-events-none z-[9998] opacity-20"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        scale: 0.5
      }}
    />
  );
};

const NeuralCursorEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const particles = useRef<Array<{ x: number, y: number, vx: number, vy: number, size: number }>>([]);
  const particleCount = 50;
  const connectionDistance = 150;
  const mouseDistance = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 1.5 + 0.5,
      }));
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dxMouse = mouse.current.x - p.x;
        const dyMouse = mouse.current.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseDistance) {
          p.x += dxMouse * 0.02;
          p.y += dyMouse * 0.02;
        }

        ctx.fillStyle = "rgba(48, 142, 208, 0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.current.length; j++) {
          const p2 = particles.current[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.2;
            ctx.strokeStyle = `rgba(48, 142, 208, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (distMouse < mouseDistance) {
          const opacity = (1 - distMouse / mouseDistance) * 0.4;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();
    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9990]" />;
};

const Logo = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue Arch */}
      <path 
        d="M50 150 C 50 20, 350 20, 350 150 L 330 150 C 330 50, 70 50, 70 150 Z" 
        fill="#308ed0" 
      />
      
      {/* Network lines inside arch */}
      <path d="M70 140 L 120 80 L 200 60 L 280 80 L 330 140" stroke="white" strokeWidth="1" opacity="0.6" />
      <path d="M120 140 L 200 60 L 280 140" stroke="white" strokeWidth="1" opacity="0.6" />
      <path d="M70 140 L 200 60 L 330 140" stroke="white" strokeWidth="1" opacity="0.4" />
      
      {/* Nodes */}
      <circle cx="70" cy="140" r="3" fill="white" />
      <circle cx="120" cy="80" r="3" fill="white" />
      <circle cx="200" cy="60" r="3" fill="white" />
      <circle cx="280" cy="80" r="3" fill="white" />
      <circle cx="330" cy="140" r="3" fill="white" />
    </svg>
    <div className="flex flex-col items-center -mt-8">
      <span className="text-3xl font-display font-black tracking-[0.1em] text-white">INTEGRITY</span>
      <span className="text-sm font-light tracking-[0.2em] text-integrity-dim -mt-1">Health Solutions</span>
    </div>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-integrity-border bg-integrity-deep/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center">
            <Logo className="h-20 scale-75 origin-left" />
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#about" className="text-xs font-bold uppercase tracking-widest text-integrity-dim hover:text-integrity-bright transition-colors">Nosotros</a>
            <a href="#solutions" className="text-xs font-bold uppercase tracking-widest text-integrity-dim hover:text-integrity-bright transition-colors">Soluciones</a>
            <a href="#strokeguard" className="text-xs font-bold uppercase tracking-widest text-integrity-dim hover:text-integrity-bright transition-colors">StrokeGuard</a>
            <button className="bg-integrity-bright text-white px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-integrity-deep transition-all border border-integrity-bright">
              Demo
            </button>
          </div>

          <button className="md:hidden p-2 text-integrity-bright" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-integrity-surface border-b border-integrity-border px-6 pt-2 pb-8 flex flex-col gap-6"
        >
          <a href="#about" className="text-xs font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>Nosotros</a>
          <a href="#solutions" className="text-xs font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>Soluciones</a>
          <a href="#strokeguard" className="text-xs font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>StrokeGuard</a>
          <button className="bg-integrity-bright text-integrity-deep py-3 rounded-sm font-bold uppercase tracking-widest text-xs">Solicitar Demo</button>
        </motion.div>
      )}
    </nav>
  );
};

const ParallaxNeuralArch = () => {
  const { scrollYProgress } = useScroll();
  
  // Scatting elements: They start far apart and converge to 0 (perfect alignment)
  // At scroll 0: Scattered
  // At scroll 1: Assembled
  const yArch = useTransform(scrollYProgress, [0, 1], [-200, 0]);
  const xArch = useTransform(scrollYProgress, [0, 1], [100, 0]);
  
  const yLines = useTransform(scrollYProgress, [0, 1], [200, 0]);
  const xLines = useTransform(scrollYProgress, [0, 1], [-150, 0]);
  
  const yNodes = useTransform(scrollYProgress, [0, 1], [400, 0]);
  const xNodes = useTransform(scrollYProgress, [0, 1], [50, 0]);
  
  const rotate = useTransform(scrollYProgress, [0, 1], [-20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);

  return (
    <motion.div 
      className="fixed top-0 right-0 w-full lg:w-[1200px] h-screen pointer-events-none z-0 overflow-hidden"
      style={{ scale }}
    >
      <svg viewBox="0 0 400 300" className="w-full h-full opacity-60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g style={{ rotate, originX: "200px", originY: "150px" }}>
          {/* Layer 1: The Blue Arch - Starts high and right */}
          <motion.path 
            style={{ y: yArch, x: xArch }}
            d="M50 150 C 50 -20, 350 -20, 350 150 L 330 150 C 330 50, 70 50, 70 150 Z" 
            fill="#308ed0" 
            fillOpacity="0.3"
            stroke="#308ed0"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          
          {/* Layer 2: The Neural Network Lines - Starts low and left */}
          <motion.g style={{ y: yLines, x: xLines }} stroke="white" strokeWidth="1" strokeOpacity="0.5">
            <path d="M70 140 L 120 60 L 200 30 L 280 60 L 330 140" />
            <path d="M120 140 L 200 30 L 280 140" />
            <path d="M70 140 L 200 30 L 330 140" />
            <path d="M120 60 L 280 60" />
          </motion.g>
          
          {/* Layer 3: The Nodes (Neurons) - Starts even lower */}
          <motion.g style={{ y: yNodes, x: xNodes }} fill="white" fillOpacity="0.8">
            <circle cx="70" cy="140" r="4" />
            <circle cx="120" cy="60" r="4" />
            <circle cx="200" cy="30" r="6" />
            <circle cx="280" cy="60" r="4" />
            <circle cx="330" cy="140" r="4" />
            
            {[
              {cx: 70, cy: 140},
              {cx: 120, cy: 60},
              {cx: 200, cy: 30},
              {cx: 280, cy: 60},
              {cx: 330, cy: 140}
            ].map((node, i) => (
              <motion.circle 
                key={i}
                cx={node.cx} cy={node.cy} r="14" 
                stroke="white" 
                strokeOpacity="0.3"
                strokeWidth="1"
                animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.4 }}
              />
            ))}
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
};

const Hero = ({ onStart }: { onStart?: () => void }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [45, 135]);

  return (
    <section className="relative pt-32 pb-20 lg:min-h-screen flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-6 block">HealthTech de Nueva Generación</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1] mb-8 tracking-tighter">
            Integrity<br />
            <span className="text-integrity-bright">Health Solutions</span>
          </h1>
          <p className="text-lg text-integrity-dim mb-10 leading-relaxed max-w-lg">
            Diseñamos herramientas digitales basadas en evidencia científica para mejorar la toma de decisiones clínicas y la optimización de procesos en salud.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={onStart}
              className="bg-integrity-bright text-white h-14 px-10 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-integrity-deep transition-all flex items-center justify-center gap-2 border border-integrity-bright"
            >
              Comenzar <ChevronRight className="w-4 h-4" />
            </button>
            <button className="bg-transparent border border-integrity-border text-integrity-text h-14 px-10 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-integrity-border transition-all">
              Ver Ecosistema
            </button>
          </div>
        </motion.div>

        <motion.div
          className="relative flex items-center justify-center h-[500px]"
        >
          {/* Parallax layer 1 */}
          <motion.div style={{ y: y1, rotate }} className="absolute w-[450px] h-[450px] border border-integrity-border opacity-20 pointer-events-none" />
          
          {/* Main Geometric visual */}
          <div className="w-[400px] h-[400px] border border-integrity-border geometric-rotate relative flex items-center justify-center bg-integrity-deep">
            <div className="w-[280px] h-[280px] border border-integrity-bright rounded-full geometric-unrotate flex items-center justify-center bg-integrity-surface/50 overflow-hidden">
               <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-[radial-gradient(circle,var(--color-integrity-bright)_0%,transparent_70%)] opacity-10" 
              />
              <div className="text-center relative z-10">
                <div className="text-6xl font-light text-integrity-bright font-display">99.8%</div>
                <div className="text-[10px] text-integrity-dim tracking-[0.3em] font-bold uppercase mt-2">IA Accuracy</div>
              </div>
            </div>
            
            <motion.div style={{ y: y2 }} className="absolute -z-10 opacity-30">
               <Activity className="w-64 h-64 text-integrity-bright" />
            </motion.div>

            {/* Data Points */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-24 h-24 bg-integrity-surface border border-integrity-border flex flex-col items-center justify-center geometric-unrotate"
            >
              <span className="text-integrity-bright font-bold text-xl">42ms</span>
              <span className="text-[9px] text-integrity-dim uppercase tracking-tighter">Latencia</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 right-0 w-24 h-24 bg-integrity-surface border border-integrity-border flex flex-col items-center justify-center geometric-unrotate"
            >
              <span className="text-integrity-bright font-bold text-xl">9.4k</span>
              <span className="text-[9px] text-integrity-dim uppercase tracking-tighter">Nodos</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-integrity-surface p-10 rounded-sm border border-integrity-border hover:border-integrity-bright transition-all group relative overflow-hidden"
  >
    <div className="w-12 h-12 border border-integrity-bright rounded-sm flex items-center justify-center mb-8 group-hover:bg-integrity-bright group-hover:text-integrity-deep transition-all">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-tight">{title}</h3>
    <p className="text-integrity-dim leading-relaxed text-sm">
      {description}
    </p>
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
      <Icon className="w-20 h-20 -mr-6 -mt-6" />
    </div>
  </motion.div>
);

const Solutions = () => {
  return (
    <section id="solutions" className="py-32 bg-integrity-deep relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-20">
          <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-4 block">Estrategia Digital</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Integración Adaptable <br /> a Cada Organización
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <FeatureCard 
            icon={Database}
            title="Integración Completa"
            description="Módulo de manejo de stroke integrado a la estructura digital hospitalaria, historias clínicas y bases de datos existentes."
            delay={0.1}
          />
          <FeatureCard 
            icon={Target}
            title="Point Solution"
            description="Herramienta independiente mediante hardware y software dedicado, ideal para entidades que inician su digitalización."
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

const StrokeGuardSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const width = useTransform(scrollYProgress, [0, 0.5], ["90%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="strokeguard" ref={containerRef} className="py-32 bg-integrity-surface relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--color-integrity-bright)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <motion.div 
        style={{ width, opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-8 block">Insignia: StrokeGuard</span>
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-10 leading-[0.9] tracking-tighter text-white">
              Precisión en la<br />
              <span className="text-integrity-bright uppercase font-bold tracking-tighter">Atención del ACV</span>
            </h2>
            <p className="text-integrity-dim text-lg mb-12 leading-relaxed">
              Herramienta integral para el manejo del ACV. Optimiza tiempos críticos (door-to-needle) y garantiza adherencia a estándares internacionales (WSO).
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "Checklist ACV", val: "< 10 Minutos" },
                { label: "Escalas Clínicas", val: "NIHSS / WSO" },
                { label: "Stock Farmaco", val: "Lotes/Vto" },
                { label: "Anamnesis", val: "Automatizada" }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-integrity-border pl-4">
                  <p className="text-[10px] text-integrity-dim uppercase tracking-widest font-bold mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-white">{item.val}</p>
                </div>
              ))}
            </div>
            
            <button className="mt-16 bg-integrity-bright text-integrity-deep h-14 px-10 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white transition-all">
              Especificaciones Técnicas
            </button>
          </div>
          
          <div className="relative">
            <div className="border border-integrity-border p-2 rounded-sm bg-integrity-deep">
              <div className="bg-integrity-surface rounded-sm relative overflow-hidden aspect-video">
                <img 
                  src="https://picsum.photos/seed/tech-dash/1280/720"
                  alt="Interface Clinical"
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-integrity-deep via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-integrity-bright font-bold uppercase tracking-[0.2em] mb-1">Status Active</div>
                    <div className="text-2xl font-bold font-display text-white">SCAN04_ACTIVE</div>
                  </div>
                  <div className="w-12 h-12 bg-integrity-bright/20 border border-integrity-bright rounded-sm flex items-center justify-center animate-pulse">
                    <Activity className="text-integrity-bright w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decors */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-integrity-bright/20 border-dashed rounded-full pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Stats = () => {
  return (
    <section id="stats" className="py-24 border-y border-integrity-border bg-integrity-deep relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-4 gap-12">
        {[
          { label: "Door-to-Needle", val: "< 10m", icon: Activity },
          { label: "Protocolos WSO", val: "100%", icon: ShieldCheck },
          { label: "Precisión Diag.", val: "94.2%", icon: LineChart },
          { label: "Gasto Evitado", val: "11%", icon: Database }
        ].map((item, i) => (
          <div key={i} className="relative group">
            <p className="text-sm font-bold text-integrity-dim uppercase tracking-widest mb-3">{item.label}</p>
            <p className="text-4xl font-display font-bold text-integrity-bright mb-1">{item.val}</p>
            <div className="h-0.5 w-8 bg-integrity-border group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
};

const TeamSection = () => {
  return (
    <section id="about" className="py-32 bg-integrity-deep">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div>
            <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-4 block">Consejo Científico</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
              Liderazgo Técnico
            </h2>
          </div>
          <p className="text-integrity-dim max-w-md text-sm leading-relaxed">
            Fusionamos la medicina de alta complejidad con el desarrollo de software de misión crítica para crear el futuro de la salud digital.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {[
            {
              name: "Guido Nicolás Eboli",
              role: "Médico Especialista & Gestión",
              desc: "Experto en terapia intensiva y emergencias. Coordinador de atención integral del ACV en Hospital Bicentenario.",
              img: "https://picsum.photos/seed/eboli/500/500"
            },
            {
              name: "Paolo Lauretta",
              role: "Médico & IA Lead",
              desc: "Especialista en IA aplicada. Coordinador de Comunicación Unificada en Emergencias Sanitarias (SAME-CABA).",
              img: "https://picsum.photos/seed/lauretta/500/500"
            }
          ].map((founder, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-integrity-surface p-1 rounded-sm border border-integrity-border group"
            >
              <div className="p-8 flex items-start gap-8">
                <div className="w-24 h-24 border border-integrity-border shrink-0 overflow-hidden rounded-sm group-hover:border-integrity-bright transition-colors">
                  <img src={founder.img} className="w-full h-full object-cover filter grayscale" alt={founder.name} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-2">{founder.name}</h3>
                  <p className="text-integrity-bright font-bold text-[10px] uppercase tracking-widest mb-4">{founder.role}</p>
                  <p className="text-integrity-dim text-xs leading-relaxed">{founder.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MissionVision = () => {
  return (
    <section id="mission" className="py-32 bg-integrity-surface border-y border-integrity-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-32 items-center">
        <div className="relative flex justify-center items-center h-[400px]">
          <div className="absolute w-80 h-80 border border-integrity-border geometric-rotate opacity-20" />
          <div className="absolute w-60 h-60 border border-integrity-bright geometric-rotate opacity-40" />
          <div className="absolute w-40 h-40 border border-integrity-bright rotate-12 flex items-center justify-center p-8 bg-integrity-deep">
            <ShieldCheck className="w-full h-full text-integrity-bright" />
          </div>
        </div>
        
        <div className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xs font-bold text-integrity-bright uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
              <span className="w-8 h-px bg-integrity-bright"></span> Misión
            </h3>
            <p className="text-xl font-light text-white leading-relaxed font-display tracking-tight">
              Desarrollar e implementar soluciones de salud digital basadas en evidencia científica que mejoren la atención y la experiencia del paciente, optimicen la eficiencia del sistema y reduzcan costos, actuando con una mirada ética e integral.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-bold text-integrity-bright uppercase tracking-[0.4em] mb-6 flex items-center gap-4 text-integrity-dim">
              <span className="w-8 h-px bg-integrity-dim"></span> Visión
            </h3>
            <p className="text-xl font-light text-integrity-dim leading-relaxed font-display tracking-tight">
              Liderar el cambio digital en salud mediante el desarrollo de herramientas que generen un impacto positivo real, creando sistemas más eficientes y siendo fundamentales en el cambio de paradigma tecnológico en salud.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PartnersSection = () => {
  return (
    <section className="py-24 border-t border-integrity-border bg-integrity-deep relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="text-center md:text-left">
          <span className="text-[10px] font-bold text-integrity-bright uppercase tracking-[0.4em] mb-4 block">Strategic Network</span>
          <h3 className="text-2xl font-display font-bold text-white tracking-tight">Alianzas y Partners</h3>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-16 items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          {/* Amazon / AWS */}
          <div className="flex flex-col items-center gap-3 group">
            <div className="h-8 flex items-center">
              <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-integrity-bright transition-colors">amazon<span className="text-integrity-bright group-hover:text-white">aws</span></span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-integrity-dim">Infraestructura Cloud</span>
          </div>

          {/* Ministerio de Salud Argentina */}
          <div className="flex flex-col items-center gap-3 group border-x border-integrity-border/50 px-12">
            <div className="h-8 flex items-center text-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">MINISTERIO DE SALUD</span>
                <span className="text-[9px] font-medium text-integrity-dim tracking-[0.2em]">ARGENTINA</span>
              </div>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-integrity-dim">Validación Regulatoria</span>
          </div>

          {/* Hospital Austral */}
          <div className="flex flex-col items-center gap-3 group">
            <div className="h-8 flex items-center">
              <span className="text-[15px] font-display font-bold text-white group-hover:text-integrity-bright transition-colors uppercase tracking-wider">Hospital Austral</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-integrity-dim">Partner Clínico Específico</span>
          </div>
        </div>
      </div>
      
      {/* Background scanline detail */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-integrity-bright/20 to-transparent" />
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-integrity-deep pt-32 pb-16 text-white border-t border-integrity-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-20 mb-32">
          <div className="col-span-2">
            <div className="flex items-start mb-8 -ml-6 scale-90 origin-left">
              <Logo className="h-24" />
            </div>
            <p className="text-integrity-dim max-w-sm mb-10 text-sm leading-relaxed uppercase tracking-tighter">
              Diseño de herramientas digitales para mejorar la toma de decisiones clínicas y la gestión de estándares de calidad en salud.
            </p>
            <div className="flex gap-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-integrity-dim border-b border-transparent hover:border-integrity-bright cursor-pointer transition-all">LINKEDIN</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-integrity-dim border-b border-transparent hover:border-integrity-bright cursor-pointer transition-all">RESEARCH_GATE</div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-integrity-bright">Protocols</h4>
            <div className="space-y-4 text-sm font-medium">
              <a href="#solutions" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">INFRA_V2_DATA</a>
              <a href="#strokeguard" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">STROKE_GUARD_CORE</a>
              <a href="#about" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">AUTH_RESEARCH</a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-integrity-bright">Support</h4>
            <div className="space-y-4 text-sm font-medium">
              <p className="text-integrity-dim tracking-tight">DOCS_RESOURCES</p>
              <p className="text-integrity-dim tracking-tight">API_STATUS: OK</p>
              <p className="text-integrity-dim tracking-tight">BA_ARGENTINA</p>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-integrity-border flex flex-col md:row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">© 2026 Integrity Health Solutions / IHS_SYS</p>
          <div className="flex gap-8">
            <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">HIPAA_COMPLIANT</p>
            <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">QUANTUM_SECURE</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PulseLine = () => {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
        <motion.path
          d="M0 500 L 100 500 L 120 450 L 140 550 L 160 500 L 300 500 L 320 400 L 340 600 L 360 500 L 600 500 L 620 480 L 640 520 L 660 500 L 800 500 L 820 350 L 840 650 L 860 500 L 1000 500"
          stroke="var(--color-integrity-bright)"
          strokeWidth="2"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Note: The audio file should be placed in the root or public folder as 'intro.wav'
    const audio = new Audio('/intro.wav');
    audio.volume = 0.5;
    audioRef.current = audio;

    const handleLoadError = (e: any) => {
      console.error("Error loading audio file '/intro.wav'. Please ensure it is present in the public/root directory.", e);
    };

    audio.addEventListener('error', handleLoadError);

    return () => {
      audio.removeEventListener('error', handleLoadError);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleStartAudio = () => {
    // 1. Attempt to play audio
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.play().catch((err) => {
          console.error("Playback failed:", err);
        });
      }
    }

    // 2. Navigate to the first content section
    const statsSection = document.getElementById('stats');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="font-sans antialiased text-integrity-text bg-integrity-deep selection:bg-integrity-bright/20 min-h-screen relative border-none">
      <CustomCursor />
      
      {/* Audio Control */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 left-8 z-[110] p-3 rounded-full bg-integrity-surface/80 border border-integrity-border text-integrity-bright hover:bg-integrity-bright hover:text-white transition-all duration-300 backdrop-blur-md group"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        <span className="absolute left-14 py-1 px-2 bg-integrity-deep border border-integrity-border text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isMuted ? "SYSTEM_AUDIO: OFF" : "SYSTEM_AUDIO: ON"}
        </span>
      </button>

      <PulseLine />
      <ParallaxNeuralArch />
      {/* Theme specific background elements */}
      <div className="fixed inset-0 grid-overlay opacity-10 pointer-events-none z-[-1]" />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-integrity-bright z-[100]"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      <Navbar />
      <Hero onStart={handleStartAudio} />
      <Stats />
      <Solutions />
      <StrokeGuardSection />
      <MissionVision />
      <TeamSection />
      <PartnersSection />
      <Footer />
    </div>
  );
}
