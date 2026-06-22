import { useEffect, useCallback } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { generateKeyframes, getAnimationName } from "@/lib/animationEngine";
import { getBottomRows } from "@/lib/pixelUtils";

export function FullscreenPreview() {
  const pixels = useBuilderStore((s) => s.pixels);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const activePreset = useBuilderStore((s) => s.activePreset);
  const animParams = useBuilderStore((s) => s.animParams);
  const layers = useBuilderStore((s) => s.layers);
  const flickerCells = useBuilderStore((s) => s.flickerCells);
  const previewDarkBg = useBuilderStore((s) => s.previewDarkBg);
  const togglePreviewBg = useBuilderStore((s) => s.togglePreviewBg);
  const toggleFullscreen = useBuilderStore((s) => s.toggleFullscreen);
  const previewScale = useBuilderStore((s) => s.previewScale);
  const setPreviewScale = useBuilderStore((s) => s.setPreviewScale);

  const scale = previewScale;
  const cell = 10 * scale;
  const dur = `${animParams.speed}ms`;
  const tim = animParams.timing;
  const animName = getAnimationName(activePreset);
  const keyframes = generateKeyframes(activePreset, animParams);
  const bottomKeys = getBottomRows(pixels, gridSize);

  const bodyStyle: React.CSSProperties = layers.float
    ? { animation: `${animName} ${dur} infinite ${tim}` }
    : {};

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleFullscreen();
    },
    [toggleFullscreen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      <style>{keyframes}</style>

      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-5 bg-black/80 backdrop-blur-md border-b border-white/10 shrink-0">
        <span className="text-xs text-white/60" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          Fullscreen Preview
        </span>
        <div className="flex items-center gap-2">
          {/* Scale selector */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/10 border border-white/10">
            {([2, 3, 4, 5, 6] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPreviewScale(s)}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                  scale === s
                    ? "bg-red-500/30 text-red-300 ring-1 ring-red-500/50"
                    : "text-white/50 hover:text-white/80 hover:bg-white/10"
                }`}
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            onClick={togglePreviewBg}
            className="px-2.5 py-1 text-[11px] rounded-lg text-white/50 border border-white/10 bg-white/5 hover:border-white/20 hover:text-white/80 transition-all"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {previewDarkBg ? "light" : "dark"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-[11px] rounded-lg text-white/50 border border-white/10 bg-white/5 hover:border-red-500/40 hover:text-red-300 transition-all"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            ✕ close
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden"
          style={{
            background: previewDarkBg
              ? "radial-gradient(circle at 50% 40%, #1a0a0a 0%, #000 70%)"
              : "radial-gradient(circle at 50% 40%, var(--builder-surface-raised) 0%, var(--builder-bg) 70%)",
          }}
        >
          {/* dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="relative inline-block p-10">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridSize}, ${cell}px)`,
                gridTemplateRows: `repeat(${gridSize}, ${cell}px)`,
                gap: 0,
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 30px rgba(226,75,74,0.4))",
                ...bodyStyle,
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const r = Math.floor(i / gridSize);
                const c = i % gridSize;
                const key = `${r},${c}`;
                const color = pixels[key];
                if (!color) return <div key={key} style={{ width: cell, height: cell }} />;
                const flickerType = flickerCells[key];
                const hasCustomFlicker = Object.keys(flickerCells).length > 0;
                const isAutoFlicker = !hasCustomFlicker && bottomKeys.has(key);
                const flickAnim = layers.flicker && (flickerType || isAutoFlicker)
                  ? `anim-flicker${flickerType || ((r + c) % 2 === 0 ? "0" : "1")} ${dur} infinite ${tim}`
                  : undefined;
                const isPupil = layers.eyes && (color === "#1a4fa8" || color === "#0000ff");
                const eyeAnim = isPupil ? `anim-eyes ${dur} infinite ${tim}` : undefined;
                return (
                  <div
                    key={key}
                    style={{
                      width: cell,
                      height: cell,
                      background: color,
                      animation: eyeAnim || flickAnim,
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                width: "70%",
                height: cell * 0.55,
                background: "rgba(0,0,0,0.55)",
                borderRadius: "50%",
                filter: "blur(12px)",
                bottom: -cell * 0.9,
                left: "50%",
                transform: "translateX(-50%)",
                animation: layers.shadow ? `anim-shadow ${dur} infinite ${tim}` : undefined,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div
        className="h-10 flex items-center justify-center gap-6 px-5 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 text-[11px] text-white/40"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        <span>
          {gridSize}×{gridSize} · {Object.keys(pixels).length} pixels
        </span>
        <span className="text-white/20">·</span>
        <span>
          {(animParams.speed / 1000).toFixed(2)}s · {animParams.timing}
        </span>
        <span className="text-white/20">·</span>
        <span className="text-red-400/60">{activePreset}</span>
      </div>
    </div>
  );
}
