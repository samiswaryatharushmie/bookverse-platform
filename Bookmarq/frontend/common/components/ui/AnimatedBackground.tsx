import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  opacitySpeed: number;
  opacityDir: number;
}

interface BokehCircle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
  hue: number; // 30-50 for warm gold/amber
}

/**
 * AnimatedBackground — renders a living, breathing library scene.
 *
 * Layers (bottom → top):
 * 1. Static `classic_bg.png` with a slow Ken Burns zoom/pan via CSS animation
 * 2. Warm amber/black gradient overlay for depth
 * 3. Canvas: floating golden dust motes and bokeh circles
 * 4. Subtle animated vignette to focus the eye inward
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // ── Dust motes (fine golden particles) ──────────────────────────────────
    const PARTICLE_COUNT = 120;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.35 + 0.05), // drift upward
      opacitySpeed: Math.random() * 0.003 + 0.001,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // ── Bokeh circles (soft light blobs) ────────────────────────────────────
    const BOKEH_COUNT = 18;
    const bokeh: BokehCircle[] = Array.from({ length: BOKEH_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 90 + 30,
      opacity: Math.random() * 0.06 + 0.01,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: (Math.random() - 0.5) * 0.08,
      hue: Math.random() * 20 + 30, // 30–50° (amber-gold)
    }));

    // ── Animation loop ───────────────────────────────────────────────────────
    let t = 0;

    function draw() {
      if (!ctx) return;
      t++;
      ctx.clearRect(0, 0, width, height);

      // ── Draw bokeh blobs ──────────────────────────────────────────────────
      bokeh.forEach(b => {
        b.x += b.speedX;
        b.y += b.speedY;
        // Wrap around
        if (b.x < -b.radius) b.x = width + b.radius;
        if (b.x > width + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = height + b.radius;
        if (b.y > height + b.radius) b.y = -b.radius;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        // Pulsing opacity via sine wave
        const pulse = b.opacity * (0.7 + 0.3 * Math.sin(t * 0.012 + b.x));
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 65%, ${pulse})`);
        grad.addColorStop(1, `hsla(${b.hue}, 60%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw dust motes ───────────────────────────────────────────────────
      particles.forEach(p => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Gentle horizontal sway
        p.x += Math.sin(t * 0.008 + p.y * 0.01) * 0.15;

        // Wrap vertically — reset at bottom when drifting off top
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        // Fade in/out
        p.opacity += p.opacitySpeed * p.opacityDir;
        if (p.opacity > 0.75 || p.opacity < 0.05) p.opacityDir *= -1;

        // Draw glowing dot
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(230, 195, 120, ${p.opacity})`);
        grad.addColorStop(1, `rgba(197, 160, 89, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Ambient lamp glow — center-left warm cone ─────────────────────────
      const lampPulse = 0.04 + 0.015 * Math.sin(t * 0.018);
      const lampGrad = ctx.createRadialGradient(
        width * 0.28, height * 0.72, 0,
        width * 0.28, height * 0.72, Math.min(width, height) * 0.45
      );
      lampGrad.addColorStop(0, `rgba(255, 195, 80, ${lampPulse})`);
      lampGrad.addColorStop(0.5, `rgba(200, 140, 40, ${lampPulse * 0.4})`);
      lampGrad.addColorStop(1, 'rgba(150, 90, 10, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, width, height);

      // ── Secondary lamp — top right ─────────────────────────────────────────
      const lamp2Pulse = 0.03 + 0.01 * Math.sin(t * 0.023 + 1.5);
      const lamp2Grad = ctx.createRadialGradient(
        width * 0.82, height * 0.22, 0,
        width * 0.82, height * 0.22, Math.min(width, height) * 0.3
      );
      lamp2Grad.addColorStop(0, `rgba(255, 220, 140, ${lamp2Pulse})`);
      lamp2Grad.addColorStop(1, 'rgba(255, 190, 80, 0)');
      ctx.fillStyle = lamp2Grad;
      ctx.fillRect(0, 0, width, height);

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return createPortal(
    <div id="animated-bg-root" aria-hidden="true">
      {/* Layer 1: Ken Burns animated image */}
      <div className="animated-bg-image" />

      {/* Layer 2: Rich warm overlay gradient */}
      <div className="animated-bg-overlay" />

      {/* Layer 3: Canvas (dust + bokeh + lamp glows) */}
      <canvas
        ref={canvasRef}
        className="animated-bg-canvas"
      />

      {/* Layer 4: Vignette */}
      <div className="animated-bg-vignette" />
    </div>,
    document.body
  );
}
