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
  VolumeX,
  Linkedin,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Mail
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

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

const FounderImage = ({ 
  src, 
  fallbackSrc, 
  imgPosition, 
  fallbackPosition, 
  alt, 
  className 
}: { 
  src: string; 
  fallbackSrc: string; 
  imgPosition: string; 
  fallbackPosition: string; 
  alt: string; 
  className?: string;
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [currentPosition, setCurrentPosition] = useState(imgPosition);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setCurrentPosition(imgPosition);
    setHasFailed(false);
  }, [src, imgPosition]);

  const handleError = () => {
    if (!hasFailed) {
      setCurrentSrc(fallbackSrc);
      setCurrentPosition(fallbackPosition);
      setHasFailed(true);
    }
  };

  return (
    <img 
      src={currentSrc} 
      className={`${className} ${currentPosition}`} 
      alt={alt} 
      onError={handleError}
      referrerPolicy="no-referrer" 
    />
  );
};

interface BioModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: {
    name: string;
    role: string;
    desc: string;
    longBio: string;
    achievements: string[];
    img: string;
    imgPosition: string;
    fallbackImg?: string;
    fallbackImgPosition?: string;
    linkedin: string;
    email?: string;
  } | null;
}

const BioModal = ({ isOpen, onClose, person }: BioModalProps) => {
  if (!isOpen || !person) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-integrity-surface border border-integrity-border p-6 md:p-10 rounded-sm text-white max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-integrity-border scrollbar-track-transparent"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-integrity-dim hover:text-white transition-colors z-10"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-12 gap-8 items-start mt-4">
          {/* Foto & Rol Detallado */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="w-32 h-32 md:w-full aspect-square border border-integrity-border overflow-hidden rounded-sm relative">
              <FounderImage 
                src={person.img} 
                fallbackSrc={person.fallbackImg || "/founders_hackathon.jpg"} 
                imgPosition={person.imgPosition} 
                fallbackPosition={person.fallbackImgPosition || "object-[80%_15%]"} 
                alt={person.name} 
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"
              />
            </div>
            
            <div className="w-full">
              <span className="text-[10px] font-bold text-integrity-bright uppercase tracking-[0.2em] block mb-1">Roles Ejecutivos</span>
              <p className="text-sm font-bold text-white leading-tight">{person.role}</p>
            </div>

            <a 
              href={person.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-integrity-bright/10 text-integrity-bright hover:bg-integrity-bright hover:text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-300 w-full justify-center md:justify-start"
            >
              <Linkedin className="w-4 h-4" /> Perfil Linkedin
            </a>

            {person.email && (
              <a 
                href={`mailto:${person.email}`}
                className="inline-flex items-center gap-2 bg-white/5 border border-integrity-border text-white/90 hover:bg-integrity-bright/10 hover:text-white hover:border-integrity-bright px-4 py-2 rounded-sm text-[11px] font-bold tracking-wider transition-all duration-300 w-full justify-center md:justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                title={`Enviar email a ${person.email}`}
              >
                <Mail className="w-3.5 h-3.5 text-integrity-bright shrink-0" /> {person.email}
              </a>
            )}
          </div>

          {/* Información Detallada */}
          <div className="md:col-span-8 space-y-8">
            <div>
              <span className="text-[10px] font-bold text-integrity-bright uppercase tracking-[0.3em] block mb-2">Miembro Fundador</span>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">{person.name}</h3>
              <p className="text-sm text-integrity-dim font-medium mt-1 italic">{person.desc}</p>
            </div>

            {/* Trayectoria */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-integrity-border/50">
                <Briefcase className="w-4 h-4 text-integrity-bright" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Trayectoria & Enfoque</h4>
              </div>
              <p className="text-integrity-dim text-xs leading-relaxed font-light">
                {person.longBio}
              </p>
            </div>

            {/* Formación & Logros */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-integrity-border/50">
                <GraduationCap className="w-4 h-4 text-integrity-bright" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Aspectos Destacados & Formación</h4>
              </div>
              <ul className="space-y-2.5">
                {person.achievements.map((ach, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-xs text-integrity-dim leading-relaxed">
                    <Award className="w-4 h-4 text-integrity-bright shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-integrity-border/50 flex justify-between items-center text-[10px] font-mono text-integrity-dim uppercase tracking-wider">
          <span>Integrity Health Solutions</span>
          <span>CURRICULUM VITAE // VERIFICADO</span>
        </div>
      </motion.div>
    </div>
  );
};

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const [formData, setFormData] = useState({
    hospitalName: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
    country: "Argentina",
    comment: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-integrity-surface border border-integrity-border p-8 rounded-sm text-white"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-integrity-dim hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] block mb-2">Contacto B2B</span>
              <h3 className="text-2xl font-display font-bold">Solicitar Presentación</h3>
              <p className="text-integrity-dim text-xs mt-1">
                Complete el formulario de contacto empresarial para coordinar una demo del sistema StrokeGuard y una auditoría diagnóstica de procesos clínicos.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Hospital / Sanatorio / Institución *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Clínica Trinidad" 
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Nombre y Apellido *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Dr. Martín Gómez" 
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Cargo / Función *</label>
                <select 
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                >
                  <option value="">Seleccione su opción</option>
                  <option value="Director Médico">Director Médico</option>
                  <option value="Jefe de Emergencias / Guardia">Jefe de Emergencias / Guardia</option>
                  <option value="Jefe de Neurología / Terapia">Jefe de Neurología / Terapia</option>
                  <option value="Jefe de Sistemas / IT">Jefe de Sistemas / IT</option>
                  <option value="Gerente de Operaciones / Calidad">Gerente de Operaciones / Calidad</option>
                  <option value="Médico Asistencial / Otro">Médico Asistencial / Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Email Corporativo *</label>
                <input 
                  type="email" 
                  required
                  placeholder="Ej: martin.gomez@corporacion.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Teléfono / WhatsApp *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Ej: +54 9 11 1234 5678" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">País de Ubicación *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Argentina" 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-integrity-bright uppercase tracking-wider block mb-1.5">Mensaje o necesidad específica</label>
              <textarea 
                rows={3}
                placeholder="Indique los principales desafíos de atención de ACV en su centro..." 
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="w-full bg-integrity-deep border border-integrity-border px-4 py-2 text-sm text-white focus:outline-none focus:border-integrity-bright transition-colors rounded-sm resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-integrity-border/50">
              <span className="text-[9px] font-mono text-integrity-dim tracking-wider uppercase">IHS_SECURE // HIPAA COMPLIANT</span>
              <button 
                type="submit"
                className="bg-integrity-bright text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-integrity-deep transition-all border border-integrity-bright"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 border-2 border-integrity-bright rounded-full flex items-center justify-center mx-auto bg-integrity-bright/10 text-integrity-bright">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-2.5xl font-display font-bold text-white">Solicitud Procesada</h4>
              <p className="text-integrity-dim text-sm max-w-sm mx-auto leading-relaxed">
                 Estimado <strong className="text-white">{formData.contactName}</strong>, se ha recibido con éxito su solicitud para el centro <strong className="text-white">{formData.hospitalName}</strong>. 
              </p>
              <p className="text-integrity-dim text-xs max-w-sm mx-auto leading-relaxed">
                Un consultor B2B de <strong className="text-white">Integrity Health Solutions</strong> se comunicará con usted dentro de las próximas 24 horas hábiles al correo <strong className="text-white">{formData.email}</strong> o WhatsApp <strong className="text-white">{formData.phone}</strong> para coordinar la presentación formal.
              </p>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="border border-integrity-border text-white px-10 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Navbar = ({ onDemoOpen }: { onDemoOpen?: () => void }) => {
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
            <button 
              onClick={onDemoOpen}
              className="bg-integrity-bright text-white px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-integrity-deep transition-all border border-integrity-bright"
            >
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
          <button 
            onClick={() => {
              setIsOpen(false);
              if (onDemoOpen) onDemoOpen();
            }}
            className="bg-integrity-bright text-integrity-deep py-3 rounded-sm font-bold uppercase tracking-widest text-xs"
          >
            Solicitar Demo
          </button>
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

const StrokeGuardSection = ({ onDemoOpen }: { onDemoOpen?: () => void }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const width = useTransform(scrollYProgress, [0, 0.5], ["95%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="strokeguard" ref={containerRef} className="py-32 bg-integrity-surface relative overflow-hidden border-t border-integrity-border">
      <div className="absolute top-0 left-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--color-integrity-bright)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <motion.div 
        style={{ width, opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10"
      >
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Columna Izquierda: Información de la Solución */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold text-integrity-bright bg-integrity-bright/10 border border-integrity-bright/20 px-3 py-1 uppercase tracking-[0.3em] inline-block rounded-sm mb-6">
              Insignia: StrokeGuard
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-[1.0] tracking-tighter text-white">
              Gestión Operativa<br />
              <span className="text-integrity-bright uppercase font-bold tracking-tighter">en Ventana de ACV</span>
            </h2>
            <p className="text-integrity-dim text-sm md:text-base mb-10 leading-relaxed">
              Transformamos protocolos clínicos complejos en procesos asistenciales automatizados, guiados y auditables. StrokeGuard reduce la carga cognitiva en la urgencia y elimina demoras críticas optimizando la ventana de reperfusión.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                { label: "Checklist ACV", val: "Tiempos Críticos" },
                { label: "Algoritmos Clínicos", val: "Soporte de Decisión" },
                { label: "Trazabilidad", val: "Auditoría en Red" },
                { label: "Misión Crítica", val: "Calidad 100%" }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-integrity-border pl-4">
                  <p className="text-[10px] text-integrity-dim uppercase tracking-widest font-bold mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-white leading-tight">{item.val}</p>
                </div>
              ))}
            </div>
            
            <button 
              onClick={onDemoOpen}
              className="bg-integrity-bright text-white h-12 px-8 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-integrity-deep transition-all border border-integrity-bright shadow-lg shadow-integrity-bright/10 active:scale-95 duration-200"
            >
              Solicitar Presentación B2B
            </button>
          </div>
          
          {/* Columna Derecha: Pilares Clave de la Solución */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Pre-notificación Digital",
                desc: "Enlace directo en tiempo real con ambulancias y servicios pre-hospitalarios para alertar anticipadamente y activar el código ACV.",
                tag: "PRE-HOSPITALARIO"
              },
              {
                title: "Checklist Clínico Guiado",
                desc: "Protocolo digital in-situ estructurado para la urgencia médica, disminuyendo errores de omisión diagnóstica en guardia activa.",
                tag: "SOPORTE DECISIÓN"
              },
              {
                title: "Trazabilidad de Ventana",
                desc: "Auditoría en tiempo real y registro preciso del indicador Puerta-Aguja y Puerta-Imagen para cada miembro asistencial.",
                tag: "MÉTRICA CRÍTICA"
              },
              {
                title: "Gobernanza de Datos",
                desc: "Plataforma centralizada con encriptación de extremo a extremo que cumple los estándares de seguridad y privacidad internacional.",
                tag: "HIPAA SECURE"
              }
            ].map((pilar, idx) => (
              <div 
                key={idx} 
                className="bg-integrity-surface/40 border border-integrity-border p-6 rounded-sm hover:border-integrity-bright/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-[8px] font-mono font-bold text-integrity-bright uppercase tracking-widest block mb-2">
                    {pilar.tag}
                  </span>
                  <h3 className="text-md font-bold text-white mb-2">{pilar.title}</h3>
                  <p className="text-xs text-integrity-dim leading-relaxed">{pilar.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-integrity-border/30 flex justify-between items-center text-[8px] tracking-wider text-integrity-dim font-mono">
                  <span>IHS // STROKE_GUARD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-integrity-bright/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Stats = () => {
  return (
    <section id="stats" className="py-24 border-y border-integrity-border bg-integrity-deep relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-integrity-border pb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-4 block">Validación Clínica</span>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-4">
              Resultados de Prueba Piloto
            </h2>
            <p className="text-integrity-dim text-sm leading-relaxed">
              Las métricas de eficiencia y mejora operativa fueron validadas de forma concluyente durante una <strong className="text-white">prueba piloto de 2 meses en un Hospital de Alta Complejidad</strong>, confirmando el impacto crítico de nuestra solución en el entorno de atención real.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { 
              title: "Impacto Clínico Real", 
              desc: "Aumento del 200% en la tasa de diagnóstico en etapa aguda, salvando ventanas terapéuticas críticas.",
              stat: "+200%"
            },
            { 
              title: "Eficiencia Operativa", 
              desc: "Reducción del 70% en tiempos de atención puerto-aguja (door-to-needle), optimizando el circuito asistencial completo.",
              stat: "-70%" 
            },
            { 
              title: "Sostenibilidad", 
              desc: "Reducción del 25% en costos directos anualizados por paciente tratado oportunamente vs. de forma tardía.",
              stat: "-25%"
            }
          ].map((item, i) => (
            <div key={i} className="border border-integrity-border p-8 rounded-sm bg-integrity-surface/30 hover:border-integrity-bright/50 transition-colors">
              <div className="text-4xl font-display font-bold text-integrity-bright mb-4">{item.stat}</div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">{item.title}</h4>
              <p className="text-integrity-dim text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TeamSection = ({ onSelectFounder }: { onSelectFounder?: (person: any) => void }) => {
  return (
    <section id="about" className="py-32 bg-integrity-deep">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div>
            <span className="text-xs font-bold text-integrity-bright uppercase tracking-[0.3em] mb-4 block">Consejo Científico</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
              Liderazgo Técnico / Científico
            </h2>
          </div>
          <p className="text-integrity-dim max-w-md text-sm leading-relaxed">
            Fusionamos la medicina de alta complejidad y la inteligencia artificial clínica con el desarrollo de software de misión crítica.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-16 relative aspect-[4/3] md:aspect-[21/10] overflow-hidden border border-integrity-border rounded-sm group"
        >
          <img 
            src="/founders_hackathon.jpg" 
            alt="Founders at Hackathon 2026" 
            className="w-full h-full object-cover object-[center_15%] grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-integrity-deep via-integrity-deep/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pr-6 md:pr-12 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-integrity-bright text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                Primer Puesto
              </span>
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] border border-white/20 px-3 py-1 rounded-sm bg-black/30 backdrop-blur-sm">
                Harvard & Swiss Medical
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-display font-bold text-white mb-4">Hackathon Global de Innovación en Salud</h3>
            <p className="text-integrity-dim text-xs md:text-sm leading-relaxed max-w-2xl mb-6 hidden md:block">
              La startup argentina Integrity Health fue premiada entre 12 equipos interdisciplinarios por su destacada propuesta, utilizando Inteligencia Artificial para reducir drásticamente los tiempos de atención del ACV.
            </p>
            <a 
              href="https://www.infobae.com/salud/ciencia/2026/04/13/como-es-la-iniciativa-de-ia-aplicada-a-la-salud-que-gano-el-primer-puesto-en-el-hackathon-de-harvard-y-swiss-medical/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest bg-white/10 hover:bg-integrity-bright px-4 py-2 rounded-sm transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-integrity-bright"
            >
              Leer artículo en Infobae <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Guido Nicolás Eboli",
              role: "Co-founder & Especialista en Gestión Sanitaria",
              desc: "Médico especialista en terapia intensiva y gestión sanitaria. Experto en emergencias, coordinación clínica y procesos asistenciales complejos. Especializado en diseño de soluciones digitales e IA aplicada a la salud.",
              longBio: "Médico de Unidad de Terapia Intensiva y Emergenciólogo con sólida experiencia en liderar equipos clínicos frente a patologías de tiempo-dependencia crítica (como el ACV). Combina su práctica asistencial en guardias complejas con un profundo dominio de la gobernanza de servicios sanitarios, la auditoría clínica integral y la optimización de procesos intrahospitalarios. Se especializa en modelar algoritmos lógicos e interfaces clínicas que eliminan cuellos de botella y disminuyen el error humano en misiones críticas.",
              achievements: [
                "Médico especialista en Terapia Intensiva con trayectoria en cuidados críticos.",
                "Líder del desarrollo clínico ganador del primer puesto global en el Hackathon de Harvard y Swiss Medical en 2026.",
                "Formación de postgrado avanzada en gestión de redes sanitarias complejas y auditoría de la calidad asistencial.",
                "Diseñador conceptual de flujos lógicos para soporte de toma de decisiones rápidas de alta fidelidad."
              ],
              img: "/guido.jpg",
              imgPosition: "object-cover object-center",
              fallbackImg: "/founders_hackathon.jpg",
              fallbackImgPosition: "object-[20%_15%]",
              linkedin: "https://www.linkedin.com/in/nicolás-guido-eboli-10a6a4150?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
              email: "guidoeboli@integrityhs.org"
            },
            {
              name: "Paolo Lauretta",
              role: "Co-founder & IA Lead Specialist",
              desc: "Médico especializado en inteligencia artificial aplicada a la salud. Estudiante doctoral en Ciencias Biomédicas y de MBA en Health Business. Lidera proyectos de innovación en sistemas sanitarios.",
              longBio: "Médico e investigador en el campo de la computación biomédica. Su enfoque combina el entendimiento clínico directo en salas de guardias con arquitecturas avanzadas de Machine Learning aplicadas al procesamiento del lenguaje natural (NLP) sobre historias clínicas electrónicas. Dirige los fundamentos científicos de Integrity, diseñando el motor automatizado que asiste las alertas diagnósticas de StrokeGuard.",
              achievements: [
                "Médico de guardia y estudiante doctoral de Doctorado (Ph.D.) en Ciencias Biomédicas.",
                "Especialista en IA aplicada a la Salud, enfocado en optimización asistencial de misiones críticas.",
                "Estudiante del Master of Business Administration (MBA) en Health Business por la Universidad Austral.",
                "Co-diseñador de la suite digital ganadora del primer puesto global por Harvard University."
              ],
              img: "/paolo.jpg",
              imgPosition: "object-cover object-center",
              fallbackImg: "/founders_hackathon.jpg",
              fallbackImgPosition: "object-[80%_15%]",
              linkedin: "https://www.linkedin.com/in/paolo-lauretta-de-santis-607317219?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
            },
            {
              name: "Iván Erlich",
              role: "Lead Software Architect & Developer",
              desc: "Arquitecto de software full-stack experto. Líder en ingeniería de sistemas de salud digital robustos, escalables y seguros para misiones críticas.",
              longBio: "Arquitecto de software senior especializado en sistemas complejos de alta disponibilidad y tolerancia a fallas. Experto en normativas de protección de datos como HIPAA y el estándar HL7/FHIR. Ha liderado el diseño y la programación íntegra de la arquitectura del ecosistema digital, garantizando tiempos de respuesta ultrarrápidos menores a 100ms esenciales para emergencias.",
              achievements: [
                "Ingeniero de Software Full-stack con más de 8 años en empresas tecnológicas líderes.",
                "Diseño y despliegue del motor de base de datos clínico distribuido y redundancia hospitalaria del sistema StrokeGuard.",
                "Co-desarrollador de la arquitectura galardonada internacionalmente por jurados de Harvard.",
                "Especialista senior en ciberseguridad, encriptación en tránsito/reposo y arquitectura de alta disponibilidad."
              ],
              img: "/ivan.jpg",
              imgPosition: "object-cover object-center",
              fallbackImg: "/founders_hackathon.jpg",
              fallbackImgPosition: "object-[50%_15%]",
              linkedin: "https://www.linkedin.com/in/ivan-erlich-6b4b35185?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
            }
          ].map((founder, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-integrity-surface p-1 rounded-sm border border-integrity-border group cursor-pointer hover:border-integrity-bright/50 transition-all duration-300 relative select-none hover:-translate-y-1"
              onClick={() => {
                if (onSelectFounder) onSelectFounder(founder);
              }}
            >
              <div className="p-8 flex items-start gap-6">
                <div className="w-16 h-16 border border-integrity-border shrink-0 overflow-hidden rounded-sm group-hover:border-integrity-bright transition-colors relative">
                  <FounderImage 
                    src={founder.img} 
                    fallbackSrc={founder.fallbackImg} 
                    imgPosition={founder.imgPosition} 
                    fallbackPosition={founder.fallbackImgPosition} 
                    alt={founder.name} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-dense truncate" title={founder.name}>{founder.name}</h3>
                    <a 
                      href={founder.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-integrity-bright/10 p-2 rounded-full text-integrity-bright hover:bg-integrity-bright hover:text-white transition-all duration-300 shrink-0"
                      title="LinkedIn Profile"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitamos que abra el modal al hacer click directo en LinkedIn
                      }}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-integrity-bright font-bold text-[9px] uppercase tracking-widest mb-3 truncate">{founder.role}</p>
                  <p className="text-integrity-dim text-xs leading-relaxed line-clamp-4 mb-2">{founder.desc}</p>
                  <span className="text-[9px] font-bold text-integrity-bright uppercase tracking-widest flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    Ver Trayectoria & CV <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
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
              <span className="w-8 h-px bg-integrity-bright"></span> El Problema
            </h3>
            <p className="text-xl font-light text-white leading-relaxed font-display tracking-tight">
              A nivel global, uno de cada cuatro adultos sufrirá un ACV. A pesar de existir terapias efectivas para el 87% de los casos, menos del 5% accede a tiempo. StrokeGuard cierra esta brecha mediante tecnología aplicada.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-bold text-integrity-bright uppercase tracking-[0.4em] mb-6 flex items-center gap-4 text-integrity-dim">
              <span className="w-8 h-px bg-integrity-dim"></span> Propuesta de Valor
            </h3>
            <p className="text-xl font-light text-integrity-dim leading-relaxed font-display tracking-tight">
              Diseñado desde dentro de un hospital de alta complejidad, StrokeGuard interviene desde la sospecha inicial, guiando la evaluación y reduciendo errores diagnósticos que hoy superan el 25% en la práctica real.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PartnersSection = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <section className="py-24 border-t border-integrity-border bg-integrity-deep relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-integrity-bright bg-integrity-bright/10 border border-integrity-bright/20 px-3 py-1 uppercase tracking-[0.3em] inline-block rounded-sm mb-4">
            Ecosistema de Confianza
          </span>
          <h3 className="text-4xl font-display font-bold text-white tracking-tight">Validación Institucional & Alianzas</h3>
          <p className="text-integrity-dim text-sm mt-3 leading-relaxed">
            Nuestra solución se sustenta en el respaldo de instituciones académicas de primer nivel, partners tecnológicos expertos y la infraestructura global más confiable del sector.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tarjeta 1: Universidad Austral */}
          <div className="bg-integrity-surface/20 border border-integrity-border p-8 rounded-sm hover:border-integrity-bright/40 transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center border border-integrity-border rounded-sm bg-integrity-surface group-hover:border-integrity-bright transition-colors">
                <span className="text-sm font-display font-extrabold text-white group-hover:text-integrity-bright transition-colors">UA</span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight mb-2">Universidad Austral</h4>
              <p className="text-integrity-bright font-bold text-[10px] uppercase tracking-widest mb-4">Incubadora de Empresas</p>
              <p className="text-integrity-dim text-xs leading-relaxed">
                Integrity Health Solutions es una startup incubada de manera oficial en la Universidad Austral. Este lazo institucional proporciona soporte metodológico continuo en gestión sanitaria, mentores calificados y un sólido marco estratégico de gobernanza empresaria.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-integrity-border/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-integrity-dim uppercase">Incubación Oficial</span>
              <span className="w-1.5 h-1.5 rounded-full bg-integrity-bright" />
            </div>
          </div>

          {/* Tarjeta 2: G-Fourmis */}
          <div className="bg-integrity-surface/20 border border-integrity-border p-8 rounded-sm hover:border-integrity-bright/40 transition-all group flex flex-col justify-between h-full relative">
            <div className="absolute top-4 right-4 bg-integrity-bright/10 text-integrity-bright text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
              Partner Tecnológico
            </div>
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center border border-integrity-border rounded-sm bg-integrity-surface group-hover:border-[#FF9900]/60 hover:bg-[#FF9900]/5 transition-colors duration-300 overflow-hidden">
                {!logoError ? (
                  <img 
                    src="/Gfourmis.jpeg" 
                    alt="Logo G-Fourmis" 
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-contain p-2 animate-fade-in"
                  />
                ) : (
                  /* SVG Isotipo Oficial G-Fourmis (Beautifully stylized high-tech Ant) */
                  <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#FF9900]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Ant body parts */}
                    <ellipse cx="50" cy="72" rx="9" ry="14" fill="currentColor" fillOpacity="0.1" />
                    <ellipse cx="50" cy="48" rx="6" ry="8" fill="currentColor" fillOpacity="0.2" />
                    <circle cx="50" cy="29" r="5" fill="currentColor" />
                    
                    {/* Antennae */}
                    <path d="M47 25 C43 18 36 17 33 19" />
                    <path d="M53 25 C57 18 64 17 67 19" />
                    
                    {/* Legs */}
                    <path d="M45 45 L32 42 L24 47" />
                    <path d="M55 45 L68 42 L76 47" />
                    
                    <path d="M44 48 L28 49 L19 56" />
                    <path d="M56 48 L72 49 L81 56" />
                    
                    <path d="M45 52 L30 58 L22 69" />
                    <path d="M55 52 L70 58 L78 69" />
                  </svg>
                )}
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight mb-2">G-Fourmis</h4>
              <p className="text-[#FF9900] font-bold text-[10px] uppercase tracking-widest mb-4">Alianza de Ingeniería Avanzada</p>
              <p className="text-integrity-dim text-xs leading-relaxed">
                Nuestros aliados fundamentales en ingeniería, ciencia de datos y diseño. G-Fourmis aporta capacidades críticas para co-desarrollar, auditar y desplegar infraestructuras asistenciales hiperseguras de alto rendimiento clínico, garantizando el cumplimiento de estrictos estándares técnicos.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-integrity-border/30 flex items-center justify-between">
              <a 
                href="https://gfourmis.co/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-mono hover:text-integrity-bright transition-colors text-white uppercase tracking-wider inline-flex items-center gap-1.5 group/link"
              >
                gfourmis.co <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              </a>
              <span className="w-1.5 h-1.5 rounded-full bg-integrity-bright animate-pulse" />
            </div>
          </div>

          {/* Tarjeta 3: Amazon Web Services */}
          <div className="bg-integrity-surface/20 border border-integrity-border p-8 rounded-sm hover:border-integrity-bright/40 transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center border border-integrity-border rounded-sm bg-integrity-surface group-hover:border-integrity-bright transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white group-hover:text-integrity-bright transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75M12 9.75L14.25 12M12 9.75L9.75 12M3 13.5a6 6 0 1111.954-1.636l-.006.003L19.5 15H21" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight mb-2">Amazon Web Services</h4>
              <p className="text-integrity-bright font-bold text-[10px] uppercase tracking-widest mb-4">Infraestructura Cloud Sanitaria</p>
              <p className="text-integrity-dim text-xs leading-relaxed">
                Procesamiento y almacenamiento de datos robusto bajo la nube de AWS. Permite operaciones redundantes, con disponibilidad crítica del 99.9% de nivel hospitalario y cifrado asistencial de extremo a extremo, compatible con las normativas internacionales de resguardo.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-integrity-border/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-integrity-dim uppercase">AWS Cloud Secure</span>
              <span className="w-1.5 h-1.5 rounded-full bg-integrity-bright" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-integrity-bright/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-integrity-border to-transparent" />
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
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-integrity-bright">Secciones</h4>
            <div className="space-y-4 text-sm font-medium">
              <a href="#solutions" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">Soluciones</a>
              <a href="#strokeguard" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">StrokeGuard</a>
              <a href="#about" className="block text-integrity-dim hover:text-white transition-colors tracking-tight">Consejo Científico</a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-integrity-bright">Contacto</h4>
            <div className="space-y-4 text-sm font-medium">
              <p className="text-integrity-dim tracking-tight">Soporte Técnico</p>
              <p className="text-integrity-dim tracking-tight">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-integrity-border flex flex-col md:row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">© 2026 Integrity Health Solutions</p>
          <div className="flex gap-8">
            <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">Compatibilidad HIPAA</p>
            <p className="text-[10px] font-bold text-integrity-dim uppercase tracking-[0.4em]">Protección de Datos</p>
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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedFounder, setSelectedFounder] = useState<any>(null);
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
      <Navbar onDemoOpen={() => setIsDemoModalOpen(true)} />
      <Hero onStart={handleStartAudio} />
      <Stats />
      <Solutions />
      <StrokeGuardSection onDemoOpen={() => setIsDemoModalOpen(true)} />
      <MissionVision />
      <TeamSection onSelectFounder={setSelectedFounder} />
      <PartnersSection />
      <Footer />

      {/* Demo Presentation Request Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      {/* Detail CV Biography Modal */}
      <BioModal isOpen={!!selectedFounder} onClose={() => setSelectedFounder(null)} person={selectedFounder} />
    </div>
  );
}
