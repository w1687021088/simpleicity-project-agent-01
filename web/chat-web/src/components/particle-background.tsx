// src/components/particle-background.tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseR: number;
  pulse: number;
  pulseSpeed: number;
  phase: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let tick = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    const color = () =>
      document.documentElement.classList.contains('dark')
        ? '255, 255, 255'
        : '0, 0, 0';

    const initParticles = () => {
      const n = Math.min(60, Math.max(25, Math.floor((w * h) / 30000)));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, // 0.15 → 0.25
        vy: (Math.random() - 0.5) * 0.25,
        baseR: Math.random() * 1.6 + 1.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);
      const c = color();

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 1600) {
          const d = Math.sqrt(d2) || 1;
          const f = (40 - d) / 40;
          p.vx += (dx / d) * f * 0.01;
          p.vy += (dy / d) * f * 0.01;
        }

        // 随机游走 0.004 → 0.008
        p.vx += (Math.random() - 0.5) * 0.008;
        p.vy += (Math.random() - 0.5) * 0.008;

        // 限速 0.4 → 0.7
        const sp = Math.hypot(p.vx, p.vy);
        const max = 0.7;
        if (sp > max) {
          p.vx = (p.vx / sp) * max;
          p.vy = (p.vy / sp) * max;
        }

        p.x += p.vx;
        p.y += p.vy;

        // 柔和卷回
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        p.pulse += p.pulseSpeed;
      }

      // 极淡连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 160) {
            const alpha = (1 - d / 160) * 0.06;
            ctx.strokeStyle = `rgba(${c}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 粒子 + 呼吸
      for (const p of particles) {
        const breath = 1 + Math.sin(p.pulse) * 0.4;
        const r = p.baseR * breath;

        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 14);
        halo.addColorStop(0, `rgba(${c}, 0.18)`);
        halo.addColorStop(0.4, `rgba(${c}, 0.06)`);
        halo.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${c}, 0.45)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 底部柔光
      const bottomGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
      bottomGrad.addColorStop(0, `rgba(${c}, 0)`);
      bottomGrad.addColorStop(1, `rgba(${c}, 0.03)`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />,
    document.body,
  );
}
