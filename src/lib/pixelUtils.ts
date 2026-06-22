import type { PixelMap, GridSize } from "./types";

export function floodFill(
  pixels: PixelMap,
  startRow: number,
  startCol: number,
  fillColor: string,
  gridSize: GridSize,
): PixelMap {
  const key = (r: number, c: number) => `${r},${c}`;
  const targetColor = pixels[key(startRow, startCol)] || "";
  if (targetColor === fillColor) return pixels;

  const result = { ...pixels };
  const stack: [number, number][] = [[startRow, startCol]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
    if ((result[key(r, c)] || "") !== targetColor) continue;
    if (targetColor === "") {
      // don't fill empty space infinitely — only fill if target was a color
      continue;
    }
    result[key(r, c)] = fillColor;
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }

  return result;
}

export function getBottomRows(pixels: PixelMap, gridSize: GridSize): Set<string> {
  const bottomSet = new Set<string>();
  for (let r = gridSize - 2; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const k = `${r},${c}`;
      if (pixels[k]) bottomSet.add(k);
    }
  }
  return bottomSet;
}
