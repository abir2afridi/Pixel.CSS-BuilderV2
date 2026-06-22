import { useBuilderStore } from "@/store/useBuilderStore";
import type { Tool, GridSize } from "@/lib/types";
import { PIXEL_PRESETS } from "@/lib/presets";

const GRID_SIZES: GridSize[] = [8, 10, 12, 14, 16, 20, 24, 32];

const TOOL_ICONS: Record<Tool, string> = {
  draw: "✎",
  erase: "⌫",
  fill: "▦",
  eyedropper: "◉",
};

export function Toolbar() {
  const tool = useBuilderStore((s) => s.tool);
  const setTool = useBuilderStore((s) => s.setTool);
  const drawColor = useBuilderStore((s) => s.drawColor);
  const setDrawColor = useBuilderStore((s) => s.setDrawColor);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const setGridSize = useBuilderStore((s) => s.setGridSize);
  const clearPixels = useBuilderStore((s) => s.clearPixels);
  const loadPreset = useBuilderStore((s) => s.loadPreset);

  const tools: { id: Tool; label: string }[] = [
    { id: "draw", label: "Draw" },
    { id: "erase", label: "Erase" },
    { id: "fill", label: "Fill" },
    { id: "eyedropper", label: "Pick" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-builder-border bg-builder-surface/40 backdrop-blur-sm px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors">
      {/* Tool segmented */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-builder-surface-inset border border-builder-border transition-colors">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              tool === t.id
                ? "bg-gradient-to-b from-red-500/20 to-red-600/10 text-red-400 dark:text-red-300 ring-1 ring-red-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "text-builder-text-muted hover:text-builder-text hover:bg-builder-surface/60"
            }`}
          >
            <span className="text-sm leading-none">{TOOL_ICONS[t.id]}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-builder-border" />

      {/* Color */}
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-builder-surface-inset border border-builder-border transition-colors">
        <div
          className="relative h-6 w-6 rounded-md ring-1 ring-black/10 shadow-inner overflow-hidden"
          style={{ background: drawColor }}
        >
          <input
            type="color"
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </div>
        <span
          className="text-[10px] uppercase tracking-wider text-builder-text"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {drawColor}
        </span>
      </div>

      <div className="h-6 w-px bg-builder-border" />

      {/* Grid size */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-builder-text-muted">
          grid
        </span>
        <select
          value={gridSize}
          onChange={(e) => setGridSize(+e.target.value as GridSize)}
          className="text-[11px] bg-builder-surface-inset border border-builder-border text-builder-text rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500/40 transition"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {GRID_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}×{s}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-builder-border" />

      {/* Presets */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.15em] text-builder-text-muted mr-1">
          load
        </span>
        {Object.keys(PIXEL_PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            className="px-2 py-1 text-[10px] text-builder-text-muted rounded-md border border-builder-border bg-builder-surface-inset hover:border-builder-border-strong hover:text-builder-text hover:bg-builder-surface/60 transition-all"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {name.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="ml-auto" />

      <button
        onClick={clearPixels}
        className="px-2.5 py-1 text-[11px] rounded-md text-builder-text-muted border border-builder-border bg-builder-surface-inset hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
      >
        Clear
      </button>
    </div>
  );
}
