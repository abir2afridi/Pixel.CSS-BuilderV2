import { useCallback, useEffect } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";

export function PixelCanvas() {
  const gridSize = useBuilderStore((s) => s.gridSize);
  const pixels = useBuilderStore((s) => s.pixels);
  const paintPixel = useBuilderStore((s) => s.paintPixel);
  const startDrawing = useBuilderStore((s) => s.startDrawing);
  const stopDrawing = useBuilderStore((s) => s.stopDrawing);
  const isDrawing = useBuilderStore((s) => s.isDrawing);

  const cellSize = Math.max(14, Math.floor(480 / gridSize));

  const handleCellInteract = useCallback(
    (row: number, col: number) => paintPixel(row, col),
    [paintPixel],
  );

  useEffect(() => {
    const up = () => stopDrawing();
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [stopDrawing]);

  return (
    <div className="inline-block">
      {/* Section label */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-builder-text-muted flex items-center gap-1.5"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px] shadow-red-500/80" />
          Canvas
        </span>
        <span
          className="text-[10px] text-builder-text-muted"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {cellSize}px / cell
        </span>
      </div>

      {/* Card frame */}
      <div className="rounded-2xl border border-builder-border bg-gradient-to-b from-builder-surface/60 to-builder-surface/30 backdrop-blur-md p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] inline-block select-none transition-colors">
        {/* Inner grid wrapper */}
        <div
          className="rounded-xl overflow-hidden ring-1 ring-inset ring-builder-border/50"
          style={{
            padding: "6px",
            background:
              "linear-gradient(135deg, var(--builder-surface-inset) 0%, var(--builder-surface) 100%)",
          }}
        >
          <div
            className="grid rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
              gap: "1px",
              background: "var(--builder-border)",
            }}
            onMouseLeave={() => stopDrawing()}
          >
            {Array.from({ length: gridSize * gridSize }, (_, i) => {
              const row = Math.floor(i / gridSize);
              const col = i % gridSize;
              const key = `${row},${col}`;
              const color = pixels[key];
              const checker =
                (row + col) % 2 === 0 ? "var(--builder-checker-a)" : "var(--builder-checker-b)";
              return (
                <div
                  key={key}
                  style={{
                    background: color || checker,
                    width: cellSize,
                    height: cellSize,
                  }}
                  className="transition-[background] duration-75 hover:brightness-150 cursor-crosshair"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startDrawing();
                    handleCellInteract(row, col);
                  }}
                  onMouseEnter={() => {
                    if (isDrawing) handleCellInteract(row, col);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
