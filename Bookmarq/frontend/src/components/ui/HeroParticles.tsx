import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  size: number; opacity: number;
  speedX: number; speedY: number;
  opacitySpeed: number; opacityDir: number;
}

interface BokehCircle {
  x: number; y: number;
  radius: number; opacity: number;
  speedX: number; speedY: number;
  hue: number;
}

/**
 * HeroParticles — same dust motes, bokeh, and lamp glows as AnimatedBackground
 * but rendered inside the hero section so they layer above the Gallery Tunnel.
 */
export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement!;
    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // ── Dust motes ───────────────────────────────────────────────────────────
    const particles: Particle[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.3 + 0.05),
      opacitySpeed: Math.random() * 0.003 + 0.001,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // ── Bokeh circles ────────────────────────────────────────────────────────
    const bokeh: BokehCircle[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 80 + 25,
      opacity: Math.random() * 0.07 + 0.01,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: (Math.random() - 0.5) * 0.08,
      hue: Math.random() * 20 + 30,
    }));

    let t = 0;
    let alive = true;

    function draw() {
      if (!ctx || !alive) return;
      t++;
      ctx.clearRect(0, 0, width, height);

      // Bokeh
      bokeh.forEach(b => {
        b.x += b.speedX;
        b.y += b.speedY;
        if (b.x < -b.radius) b.x = width + b.radius;
        if (b.x > width + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = height + b.radius;
        if (b.y > height + b.radius) b.y = -b.radius;

        const pulse = b.opacity * (0.7 + 0.3 * Math.sin(t * 0.012 + b.x));
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 65%, ${pulse})`);
        grad.addColorStop(1, `hsla(${b.hue}, 60%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dust motes
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.x += Math.sin(t * 0.008 + p.y * 0.01) * 0.15;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        p.opacity += p.opacitySpeed * p.opacityDir;
        if (p.opacity > 0.72 || p.opacity < 0.05) p.opacityDir *= -1;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(230, 195, 120, ${p.opacity})`);
        grad.addColorStop(1, `rgba(197, 160, 89, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lamp glow — lower-left
      const lampPulse = 0.045 + 0.015 * Math.sin(t * 0.018);
      const lampGrad = ctx.createRadialGradient(
        width * 0.25, height * 0.75, 0,
        width * 0.25, height * 0.75, Math.min(width, height) * 0.45
      );
      lampGrad.addColorStop(0, `rgba(255, 195, 80, ${lampPulse})`);
      lampGrad.addColorStop(0.5, `rgba(200, 140, 40, ${lampPulse * 0.4})`);
      lampGrad.addColorStop(1, 'rgba(150, 90, 10, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, width, height);

      // Lamp glow — upper-right
      const lamp2Pulse = 0.03 + 0.01 * Math.sin(t * 0.023 + 1.5);
      const lamp2Grad = ctx.createRadialGradient(
        width * 0.82, height * 0.2, 0,
        width * 0.82, height * 0.2, Math.min(width, height) * 0.3
      );
      lamp2Grad.addColorStop(0, `rgba(255, 220, 140, ${lamp2Pulse})`);
      lamp2Grad.addColorStop(1, 'rgba(255, 190, 80, 0)');
      ctx.fillStyle = lamp2Grad;
      ctx.fillRect(0, 0, width, height);

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const ro = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
    });
    ro.observe(container);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
}
