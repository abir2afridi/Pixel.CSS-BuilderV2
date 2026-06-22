import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { Toolbar } from "@/components/builder/Toolbar";
import { PixelCanvas } from "@/components/builder/PixelCanvas";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { ControlsPanel } from "@/components/builder/ControlsPanel";
import { ExportDrawer } from "@/components/builder/ExportDrawer";
import { FullscreenPreview } from "@/components/builder/FullscreenPreview";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PIXEL.CSS — CSS Pixel Animation Builder" },
      {
        name: "description",
        content: "Draw pixel art and generate copy-pasteable CSS keyframe animations instantly.",
      },
      { property: "og:title", content: "PIXEL.CSS — CSS Pixel Animation Builder" },
      {
        property: "og:description",
        content: "Draw pixel art and generate copy-pasteable CSS keyframe animations instantly.",
      },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const loadPreset = useBuilderStore((s) => s.loadPreset);
  const setExportOpen = useBuilderStore((s) => s.setExportOpen);
  const exportOpen = useBuilderStore((s) => s.exportOpen);
  const isFullscreen = useBuilderStore((s) => s.isFullscreen);
  const gridSize = useBuilderStore((s) => s.gridSize);
  const pixelCount = useBuilderStore((s) => Object.keys(s.pixels).length);
  const activePreset = useBuilderStore((s) => s.activePreset);
  const { theme, toggleTheme } = useTheme();
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);

  useEffect(() => {
    loadPreset("ghost_red");
  }, [loadPreset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <div
      className="h-screen bg-builder-bg text-builder-text font-sans antialiased flex flex-col overflow-hidden transition-colors"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-builder-border bg-builder-surface/70 backdrop-blur-md shrink-0 relative z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 ring-1 ring-red-400/40">
            <div className="w-4 h-4 grid grid-cols-2 gap-[2px]">
              <div className="bg-white/90 rounded-[1px]" />
              <div className="bg-white/40 rounded-[1px]" />
              <div className="bg-white/40 rounded-[1px]" />
              <div className="bg-white/90 rounded-[1px]" />
            </div>
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-builder-text tracking-tight">
              PIXEL.CSS
              <span className="ml-2 text-[10px] font-mono text-builder-text-muted font-normal">
                v1.0
              </span>
            </h1>
            <p
              className="text-[10px] text-builder-text-muted uppercase tracking-[0.18em]"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              CSS Pixel Animation Builder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-md bg-builder-surface-inset border border-builder-border text-[10px] text-builder-text-muted transition-colors"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            <span>
              {gridSize}×{gridSize}
            </span>
            <span className="w-px h-3 bg-builder-border" />
            <span>{pixelCount} px</span>
            <span className="w-px h-3 bg-builder-border" />
            <span className="text-red-400">{activePreset}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="group inline-flex items-center justify-center w-8 h-8 rounded-md bg-builder-surface-inset border border-builder-border hover:border-builder-border-strong text-builder-text-secondary hover:text-builder-text transition-all"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="text-sm">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-md shadow-lg shadow-red-600/25 ring-1 ring-red-400/40 transition-all"
          >
            Export
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4 overflow-auto">
        <div className="flex flex-col gap-4 min-w-0">
          <Toolbar />
          <div className="flex flex-wrap gap-4 items-start flex-1 min-h-0">
            <PixelCanvas />
            <div className="flex-1 min-w-[300px]">
              <PreviewPane />
            </div>
          </div>
        </div>
        <aside className="rounded-xl border border-builder-border bg-builder-surface/40 backdrop-blur-sm p-4 lg:max-h-[calc(100vh-88px)] overflow-hidden transition-colors">
          <ControlsPanel />
        </aside>
      </main>

      {/* Status bar */}
      <footer
        className="h-7 px-4 flex items-center justify-between border-t border-builder-border bg-builder-surface/80 text-[10px] text-builder-text-muted shrink-0 transition-colors"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/70 animate-pulse" />
            <span className="uppercase tracking-wider">Ready</span>
          </span>
          <span className="text-builder-border">·</span>
          <span>autosave: off</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            animation: <span className="text-builder-text">{activePreset}</span>
          </span>
          <span className="text-builder-border">·</span>
          <span>
            grid: {gridSize}×{gridSize}
          </span>
        </div>
      </footer>

      {exportOpen && <ExportDrawer />}
      {isFullscreen && <FullscreenPreview />}
    </div>
  );
}
