"use client";
import { useEffect, useRef } from "react";

export default function GraphPanel({
  expression,
  arrowsEnabled,
  onLog,
  gridDensity = 0.55,
  arrowScale = 0.5,
}: {
  expression: string;
  arrowsEnabled: boolean;
  onLog: (line: string) => void;
  gridDensity?: number;
  arrowScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // make sure canvas does not capture pointer events for overlays outside it
    canvas.style.zIndex = "1";
    canvas.style.position = "relative";
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--panel') || "#0f1113";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // grid (based on gridDensity)
    const gridGap = Math.max(20, Math.round(40 * (1 - (gridDensity || 0.5))));
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.clientWidth; x += gridGap) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvas.clientHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.clientHeight; y += gridGap) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.clientWidth, y + 0.5);
      ctx.stroke();
    }

    // sample a simple waveform or expression fallback
    ctx.lineWidth = 2;
    ctx.strokeStyle = "var(--accent)";
    ctx.beginPath();
    const midY = canvas.clientHeight / 2;
    const scaleX = canvas.clientWidth / 200;
    for (let i = 0; i <= 200; i++) {
      const x = i * scaleX;
      let y = 0;
      try {
        if (expression && expression.trim()) {
          // try very safe eval for simple math using Math.* only — sandboxed string op
          // allow only numbers, x, Math, parentheses, operators, sin/cos/tan, pow
          const safe = expression.replace(/[^0-9xMath\\+\\-\\*\\/\\(\\)\\.\\,\\s\\^sincotaepow]/g, "");
          // eslint-disable-next-line no-new-func
          const fn = new Function("x", "Math", `return (${safe});`);
          y = Number(fn((i - 100) / 20, Math));
          if (!isFinite(y)) y = Math.sin(i / 10) * 0.5 + Math.cos(i / 20) * 0.2;
        } else {
          y = Math.sin(i / 10) * 0.5 + Math.cos(i / 20) * 0.2;
        }
      } catch (e) {
        y = Math.sin(i / 10) * 0.5 + Math.cos(i / 20) * 0.2;
      }
      const py = midY - y * (canvas.clientHeight / 3);
      if (i === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();

    // simple arrows indicator if enabled
    if (arrowsEnabled) {
      ctx.strokeStyle = "var(--accent2)";
      ctx.lineWidth = 1.5;
      for (let i = 10; i < canvas.clientWidth; i += Math.max(30, Math.round(60 * (1 - (gridDensity || 0.5))))) {
        ctx.beginPath();
        ctx.moveTo(i, midY);
        ctx.lineTo(i + 10 * (arrowScale || 0.5), midY - 6 * (arrowScale || 0.5));
        ctx.stroke();
      }
    }
  }, [expression, arrowsEnabled, gridDensity, arrowScale]);

  // Keep this component lightweight and non-blocking
  return (
    <div className="w-full h-[300px] sm:h-[60vh] rounded border border-[rgba(255,255,255,0.03)] panel" style={{position: "relative"}}>
      <canvas ref={canvasRef} className="w-full h-full" style={{display: "block", width: "100%", height: "100%" , touchAction: "manipulation"}} />
    </div>
  );
}
