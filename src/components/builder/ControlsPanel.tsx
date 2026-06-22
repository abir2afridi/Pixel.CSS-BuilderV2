import { useBuilderStore } from "@/store/useBuilderStore";
import { ANIMATION_PRESETS } from "@/lib/presets";
import type { TimingFunction, LayerState } from "@/lib/types";

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
  const activePreset = useBuilderStore((s) => s.activePreset);
  const animParams = useBuilderStore((s) => s.animParams);
  const layers = useBuilderStore((s) => s.layers);
  const flickerColor = useBuilderStore((s) => s.flickerColor);
  const applyAnimPreset = useBuilderStore((s) => s.applyAnimPreset);
  const updateAnimParams = useBuilderStore((s) => s.updateAnimParams);
  const toggleLayer = useBuilderStore((s) => s.toggleLayer);
  const setFlickerColor = useBuilderStore((s) => s.setFlickerColor);

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
    <div className="h-full space-y-5 overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-builder-border-strong [&::-webkit-scrollbar-thumb]:rounded">
      {/* Presets */}
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

      {/* Controls */}
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
                  updateAnimParams({ [ctrl.id]: v } as Partial<typeof animParams>);
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

      {/* Layers */}
      <section>
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

      {/* Flicker color */}
      <section>
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
    </div>
  );
}
