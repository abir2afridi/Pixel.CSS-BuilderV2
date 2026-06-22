import { useState, useMemo } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { ANIMATION_PRESETS, PIXEL_PRESETS } from "@/lib/presets";
import type { TimingFunction, LayerState } from "@/lib/types";

type SidebarTab = "presets" | "animation";

const FLICKER_COLORS = [
  "#e24b4a",
  "#378add",
  "#1d9e75",
  "#ef9f27",
  "#7f77dd",
  "#d4537e",
  "#ffffff",
  "#fcc78b",
  "#639922",
  "#ba7517",
  "#533ab7",
  "#000000",
];

const TIMING_OPTIONS: { value: TimingFunction; label: string }[] = [
  { value: "ease-in-out", label: "ease-in-out" },
  { value: "linear", label: "linear" },
  { value: "steps(2)", label: "steps(2) · pixel" },
  { value: "steps(4)", label: "steps(4)" },
  { value: "cubic-bezier(0.68,-0.55,0.27,1.55)", label: "spring" },
];

const mono = { fontFamily: "JetBrains Mono, monospace" } as const;

function MiniPixelGrid({ pixels }: { pixels: Record<string, string> }) {
  const size = 7;
  return (
    <div
      className="grid mx-auto rounded overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        width: 56,
        height: 56,
        gap: "1px",
        background: "var(--builder-border)",
      }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        const key = `${r},${c}`;
        const color = pixels[key];
        return (
          <div
            key={key}
            style={{
              background:
                color ||
                ((r + c) % 2 === 0 ? "var(--builder-checker-a)" : "var(--builder-checker-b)"),
            }}
          />
        );
      })}
    </div>
  );
}

function SectionTitle({
  children,
  accent = "red",
}: {
  children: React.ReactNode;
  accent?: "red" | "emerald" | "amber" | "sky";
}) {
  const dot = {
    red: "bg-red-500 shadow-red-500/70",
    emerald: "bg-emerald-500 shadow-emerald-500/70",
    amber: "bg-amber-500 shadow-amber-500/70",
    sky: "bg-sky-500 shadow-sky-500/70",
  }[accent];
  return (
    <h3
      className="text-[10px] uppercase tracking-[0.18em] text-builder-text-muted mb-3 flex items-center gap-1.5"
      style={mono}
    >
      <span className={`w-1 h-1 rounded-full shadow-[0_0_6px] ${dot}`} />
      {children}
    </h3>
  );
}

export function ControlsPanel() {
  const [tab, setTab] = useState<SidebarTab>("presets");
  const activePreset = useBuilderStore((s) => s.activePreset);
  const animParams = useBuilderStore((s) => s.animParams);
  const layers = useBuilderStore((s) => s.layers);
  const flickerColor = useBuilderStore((s) => s.flickerColor);
  const loadPreset = useBuilderStore((s) => s.loadPreset);
  const applyAnimPreset = useBuilderStore((s) => s.applyAnimPreset);
  const updateAnimParams = useBuilderStore((s) => s.updateAnimParams);
  const toggleLayer = useBuilderStore((s) => s.toggleLayer);
  const setFlickerColor = useBuilderStore((s) => s.setFlickerColor);
  const pixels = useBuilderStore((s) => s.pixels);
  const replaceColor = useBuilderStore((s) => s.replaceColor);

  const [sourceColor, setSourceColor] = useState<string | null>(null);
  const [targetColor, setTargetColor] = useState("#e24b4a");

  const uniqueColors = useMemo(() => {
    const map = new Map<string, number>();
    for (const color of Object.values(pixels)) {
      const lower = color.toLowerCase();
      map.set(lower, (map.get(lower) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color, count]) => ({ color, count }));
  }, [pixels]);

  const controls: {
    label: string;
    id: keyof typeof animParams;
    min: number;
    max: number;
    step: number;
    val: number;
    fmt: (v: number) => string;
  }[] = [
    {
      label: "Speed",
      id: "speed",
      min: 80,
      max: 3000,
      step: 10,
      val: animParams.speed,
      fmt: (v) => `${(v / 1000).toFixed(2)}s`,
    },
    {
      label: "Float",
      id: "floatHeight",
      min: 0,
      max: 30,
      step: 1,
      val: animParams.floatHeight,
      fmt: (v) => `${v}px`,
    },
    {
      label: "Scale",
      id: "scale",
      min: 100,
      max: 200,
      step: 5,
      val: Math.round(animParams.scale * 100),
      fmt: (v) => `${(v / 100).toFixed(2)}×`,
    },
    {
      label: "Rotate",
      id: "rotation",
      min: 0,
      max: 360,
      step: 5,
      val: animParams.rotation,
      fmt: (v) => `${v}°`,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-builder-surface-inset border border-builder-border mb-3 transition-colors shrink-0">
        {[
          { id: "presets" as SidebarTab, label: "Presets", emoji: "🎨" },
          { id: "animation" as SidebarTab, label: "Animation", emoji: "✨" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              tab === t.id
                ? "bg-gradient-to-b from-red-500/20 to-red-600/10 text-red-400 dark:text-red-300 ring-1 ring-red-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "text-builder-text-muted hover:text-builder-text hover:bg-builder-surface/60"
            }`}
            style={mono}
          >
            <span className="text-sm leading-none">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top scrollable area — tab content */}
      <div className="min-h-0 max-h-[40%] overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-builder-border-strong [&::-webkit-scrollbar-thumb]:rounded shrink-0">
        {tab === "presets" && (
          <section>
            <SectionTitle accent="red">Pixel Art</SectionTitle>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(PIXEL_PRESETS).map(([name, pixels]) => {
                const pixelCount = Object.keys(pixels).length;
                return (
                  <button
                    key={name}
                    onClick={() => loadPreset(name)}
                    className="text-left p-2.5 rounded-lg border border-builder-border bg-builder-surface-inset hover:border-builder-border-strong hover:bg-builder-surface/60 hover:text-builder-text text-builder-text-muted transition-all group"
                  >
                    <MiniPixelGrid pixels={pixels} />
                    <div className="text-[10px] font-semibold mt-2 capitalize" style={mono}>
                      {name.replace("_", " ")}
                    </div>
                    <div className="text-[9px] text-builder-text-muted mt-0.5">{pixelCount} px</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {tab === "animation" && (
          <section>
            <SectionTitle accent="red">Animation</SectionTitle>
            <div className="grid grid-cols-2 gap-1.5">
              {ANIMATION_PRESETS.map((p) => {
                const active = activePreset === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyAnimPreset(p.name)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all relative overflow-hidden ${
                      active
                        ? "bg-gradient-to-br from-red-500/15 to-red-600/5 border-red-500/40 text-red-600 dark:text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_18px_-6px_rgba(226,75,74,0.45)]"
                        : "bg-builder-surface-inset border-builder-border text-builder-text-muted hover:border-builder-border-strong hover:bg-builder-surface/60 hover:text-builder-text"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-red-400 shadow-[0_0_6px] shadow-red-400" />
                    )}
                    <div className="text-base leading-none mb-1.5">{p.emoji}</div>
                    <div className="text-[11px] font-semibold">{p.label}</div>
                    <div className="text-[9px] text-builder-text-muted mt-0.5 leading-tight">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t border-builder-border/50 my-2" />

      {/* Bottom scrollable area — controls */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-builder-border-strong [&::-webkit-scrollbar-thumb]:rounded">
        <section>
          <SectionTitle accent="amber">Parameters</SectionTitle>
          <div className="space-y-2.5">
            {controls.map((ctrl) => (
              <div key={ctrl.id} className="flex items-center gap-2.5">
                <span
                  className="text-[10px] text-builder-text-muted w-12 uppercase tracking-wider"
                  style={mono}
                >
                  {ctrl.label}
                </span>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={ctrl.val}
                  onChange={(e) => {
                    const raw = +e.target.value;
                    const v = ctrl.id === "scale" ? raw / 100 : raw;
                    updateAnimParams({
                      [ctrl.id]: v,
                    } as Partial<typeof animParams>);
                  }}
                  className="flex-1 h-1 accent-red-500"
                />
                <span className="text-[10px] text-builder-text w-12 text-right" style={mono}>
                  {ctrl.fmt(ctrl.val)}
                </span>
              </div>
            ))}

            <div className="flex items-center gap-2.5 pt-1">
              <span
                className="text-[10px] text-builder-text-muted w-12 uppercase tracking-wider"
                style={mono}
              >
                Easing
              </span>
              <select
                value={animParams.timing}
                onChange={(e) => updateAnimParams({ timing: e.target.value as TimingFunction })}
                className="flex-1 text-[11px] bg-builder-surface-inset border border-builder-border text-builder-text rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500/40 transition"
                style={mono}
              >
                {TIMING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <SectionTitle accent="sky">Layers</SectionTitle>
          <div className="space-y-1.5 rounded-lg bg-builder-surface-inset border border-builder-border p-2 transition-colors">
            {(Object.keys(layers) as (keyof LayerState)[]).map((layer) => {
              const on = layers[layer];
              return (
                <div key={layer} className="flex items-center justify-between px-1.5 py-1">
                  <span
                    className={`text-[11px] capitalize transition-colors ${on ? "text-builder-text" : "text-builder-text-muted"}`}
                    style={mono}
                  >
                    {layer}
                  </span>
                  <button
                    onClick={() => toggleLayer(layer)}
                    className={`w-8 h-4 rounded-full relative transition-all ${
                      on
                        ? "bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_8px] shadow-red-500/50"
                        : "bg-builder-border-strong"
                    }`}
                    aria-pressed={on}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                      style={{ left: on ? 16 : 2 }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-4">
          <SectionTitle accent="emerald">Flicker color</SectionTitle>
          <div className="grid grid-cols-6 gap-1.5">
            {FLICKER_COLORS.map((c) => {
              const active = flickerColor === c;
              return (
                <button
                  key={c}
                  onClick={() => setFlickerColor(c)}
                  style={{ background: c }}
                  className={`h-7 rounded-md transition-all relative ${
                    active
                      ? "ring-2 ring-white dark:ring-white ring-offset-2 ring-offset-builder-surface scale-105"
                      : "ring-1 ring-black/10 dark:ring-white/5 hover:scale-105"
                  }`}
                  aria-label={c}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2.5 px-2 py-1.5 rounded-md bg-builder-surface-inset border border-builder-border transition-colors">
            <span
              className="text-[10px] text-builder-text-muted uppercase tracking-wider"
              style={mono}
            >
              custom
            </span>
            <div
              className="relative h-5 w-5 rounded ring-1 ring-black/10 dark:ring-white/10"
              style={{ background: flickerColor }}
            >
              <input
                type="color"
                value={flickerColor}
                onChange={(e) => setFlickerColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-builder-text ml-auto" style={mono}>
              {flickerColor}
            </span>
          </div>
        </section>

        {uniqueColors.length > 0 && (
          <section className="mt-4">
            <SectionTitle accent="sky">Color Mode</SectionTitle>
            <div className="space-y-3">
              {/* Source colors */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-builder-text-muted" style={mono}>
                    {sourceColor ? "Source selected" : "Pick a color to replace"}
                  </span>
                  {sourceColor && (
                    <button
                      onClick={() => setSourceColor(null)}
                      className="text-[9px] text-red-400 hover:text-red-300 transition-colors"
                      style={mono}
                    >
                      clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {uniqueColors.map(({ color, count }) => {
                    const active = sourceColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSourceColor(active ? null : color)}
                        style={{ background: color }}
                        className={`aspect-square rounded-md transition-all relative group ${
                          active
                            ? "ring-2 ring-blue-400 dark:ring-blue-300 ring-offset-2 ring-offset-builder-surface scale-110 z-10"
                            : "ring-1 ring-black/10 dark:ring-white/5 hover:scale-110 hover:z-10"
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={mono}>
                            FROM
                          </span>
                        )}
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[7px] bg-builder-surface border border-builder-border text-builder-text opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20" style={mono}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Replacement flow */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-builder-surface-inset border border-builder-border transition-colors">
                {/* FROM */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-md ring-1 transition-all ${sourceColor ? "ring-blue-400/60 dark:ring-blue-300/60 shadow-[0_0_8px] shadow-blue-400/30" : "ring-builder-border ring-dashed"}`}
                    style={{ background: sourceColor || "transparent" }}
                  />
                  <span className="text-[8px] text-builder-text-muted uppercase tracking-wider" style={mono}>
                    from
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[16px] text-builder-text-muted leading-none">→</span>
                </div>

                {/* TO */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-8 h-8 rounded-md ring-1 ring-emerald-400/60 dark:ring-emerald-300/60 shadow-[0_0_8px] shadow-emerald-400/30" style={{ background: targetColor }}>
                    <input
                      type="color"
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-[8px] text-builder-text-muted uppercase tracking-wider" style={mono}>
                    to
                  </span>
                </div>
              </div>

              {/* Replace button */}
              <button
                onClick={() => {
                  if (sourceColor) {
                    replaceColor(sourceColor, targetColor);
                    setSourceColor(null);
                  }
                }}
                disabled={!sourceColor}
                className="w-full px-3 py-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_2px_12px_-2px_rgba(56,189,248,0.5)] hover:from-sky-400 hover:to-sky-500 hover:shadow-[0_4px_16px_-2px_rgba(56,189,248,0.6)] active:scale-[0.98] disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
                style={mono}
              >
                {sourceColor ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: sourceColor, boxShadow: `0 0 6px ${sourceColor}40` }} />
                    Replace →
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: targetColor, boxShadow: `0 0 6px ${targetColor}40` }} />
                  </>
                ) : (
                  "Select a color above"
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
