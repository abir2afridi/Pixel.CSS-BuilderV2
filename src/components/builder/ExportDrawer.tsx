import { useState } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { generateCSS, generateHTML, generateReact } from "@/lib/exportHelpers";

type ExportTab = "css" | "html" | "react";

export function ExportDrawer() {
  const store = useBuilderStore();
  const setExportOpen = store.setExportOpen;
  const [tab, setTab] = useState<ExportTab>("css");
  const [copied, setCopied] = useState(false);

  const opts = {
    pixels: store.pixels,
    gridSize: store.gridSize,
    activePreset: store.activePreset,
    animParams: store.animParams,
    layers: store.layers,
    flickerColor: store.flickerColor,
  };

  const content =
    tab === "css" ? generateCSS(opts) : tab === "html" ? generateHTML(opts) : generateReact(opts);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
      onClick={() => setExportOpen(false)}
    >
      <div
        className="w-full max-w-2xl h-full bg-builder-bg border-l border-builder-border flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-builder-border px-4 py-3">
          <div className="flex gap-1">
            {(["css", "html", "react"] as ExportTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition ${
                  tab === t
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-builder-surface-inset text-builder-text-muted border border-builder-border hover:text-builder-text"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="px-3 py-1.5 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setExportOpen(false)}
              className="px-3 py-1.5 text-xs font-mono text-builder-text-muted hover:text-builder-text transition"
            >
              Close
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-[11px] font-mono text-builder-text whitespace-pre">
          {content}
        </pre>
      </div>
    </div>
  );
}
