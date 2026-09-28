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
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
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
    let trail: TrailPoint[] = [];
    let w = 0;
    let h = 0;
    let tick = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
    const mouseSpeed = { v: 0 };

    const isDark = () => document.documentElement.classList.contains('dark');
    const color = () => (isDark() ? '255, 255, 255' : '0, 0, 0');

    const initParticles = () => {
      const n = Math.min(60, Math.max(25, Math.floor((w * h) / 30000)));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseR: Math.random() * 1.6 + 1.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
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
      const dark = isDark();

      const affectRadius = 200;

      // 主题相关的强度
      const linkAlpha = dark ? 0.08 : 0.18;
      const haloAlpha = dark ? 0.18 : 0.35;
      const haloMidAlpha = dark ? 0.06 : 0.15;
      const coreAlpha = dark ? 0.45 : 0.7;

      // 鼠标速度
      if (mouse.x > 0 && mouse.px > 0) {
        const dx = mouse.x - mouse.px;
        const dy = mouse.y - mouse.py;
        mouseSpeed.v = mouseSpeed.v * 0.85 + Math.hypot(dx, dy) * 0.15;
      } else {
        mouseSpeed.v *= 0.9;
      }

      // 轨迹点写入
      if (mouse.x > 0 && mouseSpeed.v > 0.5) {
        trail.push({ x: mouse.x, y: mouse.y, life: 1 });
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.025;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }
      if (trail.length > 40) trail.splice(0, trail.length - 40);

      // ---------- 1. 鼠标光晕 ----------
      if (mouse.x > 0) {
        const haloRadius = 80 + Math.sin(tick * 0.04) * 10;
        const intensity = 0.05 + Math.min(mouseSpeed.v / 30, 0.08);
        const halo = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          haloRadius,
        );
        halo.addColorStop(0, `rgba(${c}, ${intensity})`);
        halo.addColorStop(0.5, `rgba(${c}, ${intensity * 0.3})`);
        halo.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);

        // 双层光环
        ctx.strokeStyle = `rgba(${c}, ${0.08 + Math.min(mouseSpeed.v / 40, 0.12)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(
          mouse.x,
          mouse.y,
          20 + Math.sin(tick * 0.05) * 3,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        ctx.strokeStyle = `rgba(${c}, ${0.04 + Math.min(mouseSpeed.v / 60, 0.06)})`;
        ctx.beginPath();
        ctx.arc(
          mouse.x,
          mouse.y,
          34 + Math.sin(tick * 0.05 + 1) * 4,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // ---------- 2. 鼠标轨迹 ----------
      for (const t of trail) {
        const alpha = t.life * (dark ? 0.25 : 0.4);
        const r = 2 + t.life * 3;
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r * 4);
        grad.addColorStop(0, `rgba(${c}, ${alpha})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---------- 3. 更新粒子 ----------
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < affectRadius * affectRadius) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / affectRadius) ** 2;

          const tx = -dy / d;
          const ty = dx / d;
          const nx = dx / d;
          const ny = dy / d;

          const spinStrength = f * 0.12;
          const pullStrength = f * 0.03;

          p.vx += tx * spinStrength - nx * pullStrength;
          p.vy += ty * spinStrength - ny * pullStrength;
        }

        // 随机游走
        p.vx += (Math.random() - 0.5) * 0.018;
        p.vy += (Math.random() - 0.5) * 0.018;

        // 限速
        const sp = Math.hypot(p.vx, p.vy);
        const max = 1.3;
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

      // ---------- 4. 连线 ----------
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 160) {
            const alpha = (1 - d / 160) * linkAlpha;
            ctx.strokeStyle = `rgba(${c}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ---------- 5. 粒子 ----------
      for (const p of particles) {
        const breath = 1 + Math.sin(p.pulse) * 0.4;
        const r = p.baseR * breath;

        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const proximity = md < affectRadius ? (1 - md / affectRadius) * 0.5 : 0;

        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 14);
        halo.addColorStop(0, `rgba(${c}, ${haloAlpha + proximity})`);
        halo.addColorStop(0.4, `rgba(${c}, ${haloMidAlpha + proximity * 0.4})`);
        halo.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${c}, ${coreAlpha + proximity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---------- 6. 底部柔光 ----------
      const bottomGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
      bottomGrad.addColorStop(0, `rgba(${c}, 0)`);
      bottomGrad.addColorStop(1, `rgba(${c}, 0.03)`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // 更新上一帧鼠标位置
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouse.x < 0) {
        mouse.px = e.clientX;
        mouse.py = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.px = -9999;
      mouse.py = -9999;
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
