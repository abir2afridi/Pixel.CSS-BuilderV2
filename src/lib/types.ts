export type Tool = "draw" | "erase" | "fill" | "eyedropper";

export type GridSize = 8 | 10 | 12 | 14 | 16 | 20 | 24 | 32;

export type AnimPresetName =
  | "float"
  | "flicker"
  | "pulse"
  | "shake"
  | "spin"
  | "wave"
  | "bounce"
  | "drift"
  | "heartbeat"
  | "glitch";

export type TimingFunction =
  | "ease-in-out"
  | "linear"
  | "steps(2)"
  | "steps(4)"
  | "cubic-bezier(0.68,-0.55,0.27,1.55)";

export interface AnimParams {
  speed: number;
  floatHeight: number;
  scale: number;
  rotation: number;
  timing: TimingFunction;
}

export interface AnimPreset {
  name: AnimPresetName;
  label: string;
  emoji: string;
  description: string;
  defaultParams: AnimParams;
}

export interface LayerState {
  float: boolean;
  flicker: boolean;
  shadow: boolean;
  eyes: boolean;
}

export interface PixelMap {
  [key: string]: string;
}

export interface BuilderState {
  gridSize: GridSize;
  pixels: PixelMap;
  tool: Tool;
  drawColor: string;
  flickerColor: string;
  activePreset: AnimPresetName;
  animParams: AnimParams;
  layers: LayerState;
  previewScale: 2 | 3 | 4 | 5 | 6;
  previewDarkBg: boolean;
  exportOpen: boolean;
  isDrawing: boolean;
  canvasZoom: number;
  isFullscreen: boolean;
  history: PixelMap[];
  future: PixelMap[];
  prePixels: PixelMap | null;
}
