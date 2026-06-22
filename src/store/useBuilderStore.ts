import { create } from "zustand";
import type {
  BuilderState,
  Tool,
  GridSize,
  AnimPresetName,
  AnimParams,
  LayerState,
} from "@/lib/types";
import { ANIMATION_PRESETS, PIXEL_PRESETS } from "@/lib/presets";
import { floodFill } from "@/lib/pixelUtils";

interface BuilderActions {
  setTool: (tool: Tool) => void;
  setDrawColor: (color: string) => void;
  setFlickerColor: (color: string) => void;
  setGridSize: (size: GridSize) => void;
  paintPixel: (row: number, col: number) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  clearPixels: () => void;
  loadPreset: (name: string) => void;
  applyAnimPreset: (name: AnimPresetName) => void;
  updateAnimParams: (params: Partial<AnimParams>) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  setPreviewScale: (scale: 2 | 3 | 4 | 5 | 6) => void;
  togglePreviewBg: () => void;
  setExportOpen: (open: boolean) => void;
  setCanvasZoom: (zoom: number) => void;
  toggleFullscreen: () => void;
  replaceColor: (fromColor: string, toColor: string) => void;
  undo: () => void;
  redo: () => void;
}

const DEFAULT_PARAMS: AnimParams = {
  speed: 500,
  floatHeight: 10,
  scale: 1.0,
  rotation: 0,
  timing: "steps(2)",
};

const MAX_HISTORY = 50;

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => ({
  gridSize: 14,
  pixels: {},
  tool: "draw",
  drawColor: "#e24b4a",
  flickerColor: "#e24b4a",
  activePreset: "float",
  animParams: DEFAULT_PARAMS,
  layers: { float: true, flicker: true, shadow: true, eyes: true },
  previewScale: 3,
  previewDarkBg: false,
  exportOpen: false,
  isDrawing: false,
  canvasZoom: 1,
  isFullscreen: false,

  history: [],
  future: [],
  prePixels: null,

  setTool: (tool) => set({ tool }),
  setDrawColor: (color) => set({ drawColor: color }),
  setFlickerColor: (color) => set({ flickerColor: color }),

  startDrawing: () => {
    const { pixels, prePixels } = get();
    set({ isDrawing: true, prePixels: prePixels ?? { ...pixels } });
  },

  stopDrawing: () => {
    const { prePixels, pixels, history, future } = get();
    if (prePixels) {
      const changed = JSON.stringify(prePixels) !== JSON.stringify(pixels);
      if (changed) {
        const newHistory = [...history, prePixels].slice(-MAX_HISTORY);
        set({ isDrawing: false, prePixels: null, history: newHistory, future: [] });
        return;
      }
    }
    set({ isDrawing: false, prePixels: null });
  },

  setGridSize: (gridSize) => set({ gridSize, pixels: {} }),

  paintPixel: (row, col) => {
    const { tool, drawColor, pixels, gridSize } = get();
    const key = `${row},${col}`;
    if (tool === "draw") {
      if (pixels[key] === drawColor) return;
      set({ pixels: { ...pixels, [key]: drawColor } });
    } else if (tool === "erase") {
      if (!pixels[key]) return;
      const next = { ...pixels };
      delete next[key];
      set({ pixels: next });
    } else if (tool === "fill") {
      const filled = floodFill(pixels, row, col, drawColor, gridSize);
      set({ pixels: filled });
    } else if (tool === "eyedropper") {
      if (pixels[key]) set({ drawColor: pixels[key], tool: "draw" });
    }
  },

  clearPixels: () => {
    const { pixels, history } = get();
    const newHistory = [...history, { ...pixels }].slice(-MAX_HISTORY);
    set({ pixels: {}, history: newHistory, future: [] });
  },

  loadPreset: (name) => {
    if (PIXEL_PRESETS[name]) {
      const { pixels, history } = get();
      const newHistory = [...history, { ...pixels }].slice(-MAX_HISTORY);
      set({ pixels: { ...PIXEL_PRESETS[name] }, history: newHistory, future: [] });
    }
  },

  applyAnimPreset: (name) => {
    const preset = ANIMATION_PRESETS.find((p) => p.name === name);
    if (preset) set({ activePreset: name, animParams: preset.defaultParams });
  },

  updateAnimParams: (params) => {
    set((state) => ({ animParams: { ...state.animParams, ...params } }));
  },

  toggleLayer: (layer) => {
    set((state) => ({ layers: { ...state.layers, [layer]: !state.layers[layer] } }));
  },

  setPreviewScale: (scale) => set({ previewScale: scale }),
  togglePreviewBg: () => set((state) => ({ previewDarkBg: !state.previewDarkBg })),
  setExportOpen: (open) => set({ exportOpen: open }),

  setCanvasZoom: (zoom) =>     set({ canvasZoom: Math.max(0.5, Math.min(1, zoom)) }),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  replaceColor: (fromColor, toColor) => {
    const { pixels, history } = get();
    const from = fromColor.toLowerCase();
    const to = toColor.toLowerCase();
    const next: Record<string, string> = {};
    for (const [key, color] of Object.entries(pixels)) {
      next[key] = color.toLowerCase() === from ? to : color;
    }
    const newHistory = [...history, { ...pixels }].slice(-MAX_HISTORY);
    set({ pixels: next, history: newHistory, future: [] });
  },

  undo: () => {
    const { history, pixels, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const newFuture = [...future, { ...pixels }];
    set({ pixels: prev, history: newHistory, future: newFuture });
  },

  redo: () => {
    const { future, pixels, history } = get();
    if (future.length === 0) return;
    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);
    const newHistory = [...history, { ...pixels }];
    set({ pixels: next, history: newHistory, future: newFuture });
  },
}));
