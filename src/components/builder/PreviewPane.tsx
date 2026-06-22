import { useBuilderStore } from "@/store/useBuilderStore";
import { generateKeyframes, getAnimationName } from "@/lib/animationEngine";
import { getBottomRows } from "@/lib/pixelUtils";

export function PreviewPane() {
  const pixels = useBuilderStore((s) => s.pixels);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const activePreset = useBuilderStore((s) => s.activePreset);
  const animParams = useBuilderStore((s) => s.animParams);
  const layers = useBuilderStore((s) => s.layers);
  const previewScale = useBuilderStore((s) => s.previewScale);
  const previewDarkBg = useBuilderStore((s) => s.previewDarkBg);
  const setPreviewScale = useBuilderStore((s) => s.setPreviewScale);
  const togglePreviewBg = useBuilderStore((s) => s.togglePreviewBg);

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

  return (
    <div>
      <style>{keyframes}</style>

      {/* Section label + controls */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-builder-text-muted flex items-center gap-1.5"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/80 animate-pulse" />
          Live Preview
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-builder-surface-inset border border-builder-border transition-colors">
            {([2, 3, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPreviewScale(s)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${
                  previewScale === s
                    ? "bg-red-500/20 text-red-400 dark:text-red-300 ring-1 ring-red-500/40 shadow-sm"
                    : "text-builder-text-muted hover:text-builder-text"
                }`}
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            onClick={togglePreviewBg}
            className="px-2.5 py-1 text-[10px] rounded-lg text-builder-text-muted border border-builder-border bg-builder-surface-inset hover:border-builder-border-strong hover:text-builder-text transition-all"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {previewDarkBg ? "light" : "dark"}
          </button>
        </div>
      </div>

      {/* Card frame */}
      <div className="rounded-2xl border border-builder-border bg-gradient-to-b from-builder-surface/60 to-builder-surface/30 backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors">
        {/* Preview viewport */}
        <div
          className="relative flex items-center justify-center mx-4 mt-4 rounded-xl overflow-hidden ring-1 ring-inset ring-builder-border/50"
          style={{
            background: previewDarkBg
              ? "radial-gradient(circle at 50% 40%, #1a0a0a 0%, #000 70%)"
              : "radial-gradient(circle at 50% 40%, #f0f0f3 0%, #dcdce0 70%)",
            minHeight: "180px",
          }}
        >
          {/* dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="relative inline-block py-6">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridSize}, ${cell}px)`,
                gridTemplateRows: `repeat(${gridSize}, ${cell}px)`,
                gap: 0,
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 20px rgba(226,75,74,0.3))",
                ...bodyStyle,
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const r = Math.floor(i / gridSize);
                const c = i % gridSize;
                const key = `${r},${c}`;
                const color = pixels[key];
                if (!color) return <div key={key} style={{ width: cell, height: cell }} />;
                const isBottom = bottomKeys.has(key);
                const flickAnim =
                  isBottom && layers.flicker
                    ? `${(r + c) % 2 === 0 ? "anim-flicker0" : "anim-flicker1"} ${dur} infinite ${tim}`
                    : undefined;
                const isPupil = layers.eyes && color === "#1a4fa8";
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
                filter: "blur(8px)",
                bottom: -cell * 0.9,
                left: "50%",
                transform: "translateX(-50%)",
                animation: layers.shadow ? `anim-shadow ${dur} infinite ${tim}` : undefined,
              }}
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div
          className="flex items-center justify-between px-5 py-2.5 text-[10px] text-builder-text-muted border-t border-builder-border/50"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-builder-text-muted/50" />
            {(animParams.speed / 1000).toFixed(2)}s · {animParams.timing}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-builder-text">{Object.keys(pixels).length}</span> pixels
          </span>
        </div>
      </div>
    </div>
  );
}
