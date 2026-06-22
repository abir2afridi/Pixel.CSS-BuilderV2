import { useCallback, useEffect, useRef } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";

const ZOOM_STEPS = [0.5, 0.75, 1];

export function PixelCanvas() {
  const gridSize = useBuilderStore((s) => s.gridSize);
  const pixels = useBuilderStore((s) => s.pixels);
  const paintPixel = useBuilderStore((s) => s.paintPixel);
  const startDrawing = useBuilderStore((s) => s.startDrawing);
  const stopDrawing = useBuilderStore((s) => s.stopDrawing);
  const isDrawing = useBuilderStore((s) => s.isDrawing);
  const canvasZoom = useBuilderStore((s) => s.canvasZoom);
  const setCanvasZoom = useBuilderStore((s) => s.setCanvasZoom);

  const baseCell = Math.max(14, Math.floor(480 / gridSize));
  const gap = 1;
  const baseWidth = gridSize * baseCell + (gridSize - 1) * gap;
  const baseHeight = gridSize * baseCell + (gridSize - 1) * gap;
  const scaledWidth = baseWidth * canvasZoom;
  const scaledHeight = baseHeight * canvasZoom;

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCellInteract = useCallback(
    (row: number, col: number) => paintPixel(row, col),
    [paintPixel],
  );

  useEffect(() => {
    const up = () => stopDrawing();
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [stopDrawing]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const idx = ZOOM_STEPS.findIndex((z) => z >= canvasZoom);
      const current = idx === -1 ? ZOOM_STEPS.length - 1 : idx;
      if (e.deltaY < 0) {
        const next = Math.min(ZOOM_STEPS.length - 1, current + 1);
        setCanvasZoom(ZOOM_STEPS[next]);
      } else {
        const next = Math.max(0, current - 1);
        setCanvasZoom(ZOOM_STEPS[next]);
      }
    },
    [canvasZoom, setCanvasZoom],
  );

  const zoomIn = useCallback(() => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= canvasZoom);
    const next = Math.min(ZOOM_STEPS.length - 1, (idx === -1 ? 0 : idx) + 1);
    setCanvasZoom(ZOOM_STEPS[next]);
  }, [canvasZoom, setCanvasZoom]);

  const zoomOut = useCallback(() => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= canvasZoom);
    const next = Math.max(0, (idx === -1 ? 0 : idx) - 1);
    setCanvasZoom(ZOOM_STEPS[next]);
  }, [canvasZoom, setCanvasZoom]);

  const zoomReset = useCallback(() => setCanvasZoom(1), [setCanvasZoom]);

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
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] text-builder-text-muted"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {baseCell}px / cell
          </span>
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-builder-surface-inset border border-builder-border transition-colors">
            <button
              onClick={zoomOut}
              disabled={canvasZoom <= 0.5}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[11px] text-builder-text-muted hover:text-builder-text hover:bg-builder-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              −
            </button>
            <button
              onClick={zoomReset}
              className="px-1.5 h-6 flex items-center justify-center rounded-md text-[10px] text-builder-text-muted hover:text-builder-text hover:bg-builder-surface transition-all"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {Math.round(canvasZoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={canvasZoom >= 1}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[11px] text-builder-text-muted hover:text-builder-text hover:bg-builder-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Card frame */}
      <div className="rounded-2xl border border-builder-border bg-gradient-to-b from-builder-surface/60 to-builder-surface/30 backdrop-blur-md p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] select-none transition-colors">
        {/* Scroll container — base size when zoomed out, grows when zoomed in */}
        <div
          ref={scrollRef}
          className="rounded-xl overflow-auto ring-1 ring-inset ring-builder-border/50"
          style={{
            padding: "6px",
            minWidth: baseWidth + 12,
            minHeight: baseHeight + 12,
            background:
              "linear-gradient(135deg, var(--builder-surface-inset) 0%, var(--builder-surface) 100%)",
          }}
          onWheel={handleWheel}
        >
          {/* Scaled wrapper — flexbox centers the grid */}
          <div
            style={{
              width: scaledWidth,
              height: scaledHeight,
              minWidth: baseWidth,
              minHeight: baseHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Grid — base layout size, visual scale from center */}
            <div
              className="grid rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, ${baseCell}px)`,
                gridTemplateRows: `repeat(${gridSize}, ${baseCell}px)`,
                gap: `${gap}px`,
                background: "var(--builder-border)",
                transform: `scale(${canvasZoom})`,
                transformOrigin: "center center",
                width: baseWidth,
                height: baseHeight,
                flexShrink: 0,
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
                      width: baseCell,
                      height: baseCell,
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
    </div>
  );
}
