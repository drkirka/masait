import { useEffect, useRef } from "react";

type NoiseProps = {
  fps?: number;
  patternAlpha?: number;
};

export default function Noise({
  fps = 8,
  patternAlpha = 15,
}: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const size = 180;
    let animationId = 0;
    let lastDraw = 0;
    const interval = 1000 / Math.max(1, fps);
    const image = context.createImageData(size, size);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    canvas.width = size;
    canvas.height = size;

    const draw = () => {
      for (let index = 0; index < image.data.length; index += 4) {
        const value = Math.random() * 255;
        image.data[index] = value;
        image.data[index + 1] = value;
        image.data[index + 2] = value;
        image.data[index + 3] = patternAlpha;
      }

      context.putImageData(image, 0, 0);
    };

    const animate = (timestamp: number) => {
      if (!document.hidden && timestamp - lastDraw >= interval) {
        draw();
        lastDraw = timestamp;
      }
      animationId = window.requestAnimationFrame(animate);
    };

    draw();
    if (!reducedMotion) {
      animationId = window.requestAnimationFrame(animate);
    }

    return () => window.cancelAnimationFrame(animationId);
  }, [fps, patternAlpha]);

  return <canvas ref={canvasRef} className="noise-overlay" aria-hidden="true" />;
}
