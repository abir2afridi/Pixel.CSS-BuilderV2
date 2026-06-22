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
}

const DEFAULT_PARAMS: AnimParams = {
  speed: 500,
  floatHeight: 10,
  scale: 1.0,
  rotation: 0,
  timing: "steps(2)",
};

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

  setTool: (tool) => set({ tool }),
  setDrawColor: (color) => set({ drawColor: color }),
  setFlickerColor: (color) => set({ flickerColor: color }),
  startDrawing: () => set({ isDrawing: true }),
  stopDrawing: () => set({ isDrawing: false }),

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

  clearPixels: () => set({ pixels: {} }),

  loadPreset: (name) => {
    if (PIXEL_PRESETS[name]) set({ pixels: { ...PIXEL_PRESETS[name] } });
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
}));
