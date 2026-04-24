import { DENSITY_MAPS, AsciiOptions } from '../types';

export const getAsciiChar = (brightness: number, characterSet: keyof typeof DENSITY_MAPS | 'custom', customChars?: string, invert?: boolean): string => {
  let map = characterSet === 'custom' && customChars ? customChars : DENSITY_MAPS[characterSet] || DENSITY_MAPS.standard;
  let normalized = brightness / 255;
  if (invert) normalized = 1 - normalized;
  const index = Math.floor(normalized * (map.length - 1));
  return map[index];
};

export const processFrame = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: AsciiOptions
): string[] => {
  const { contrast, brightness, characterSet, customChars, invert } = options;
  const frameData = ctx.getImageData(0, 0, width, height);
  const data = frameData.data;
  const rows: string[] = [];
  
  // Pre-calculate contrast factor
  const contrastFactor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      // Standard luminosity conversion
      let originalBrightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Apply contrast
      let cBrightness = contrastFactor * (originalBrightness - 128) + 128;
      
      // Apply brightness multiplier
      cBrightness = cBrightness * brightness;

      // Clamp
      cBrightness = Math.max(0, Math.min(255, cBrightness));

      row += getAsciiChar(cBrightness, characterSet, customChars, invert);
    }
    rows.push(row);
  }
  return rows;
};

// Helper to determine text color based on mode
export const getFillStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: AsciiOptions['colorMode'], brightness?: number) => {
  const b = brightness ?? 150;
  if (b > 200) {
    return '#E3F2FD'; // Soft White-Blue
  } else if (b > 100) {
    return '#C7A75D'; // Royal Gold
  }
  return '#1E3A8A'; // Royal Blue
};
