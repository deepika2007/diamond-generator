import { findClosestDmcColor, DmcColor } from './DmcPalette';

export interface QuantizedColor {
  dmc: DmcColor;
  count: number;
  symbol: string;
}

export interface QuantizedResult {
  pixels: DmcColor[];       // Flat array of DMC colors corresponding to each cell in the grid
  palette: QuantizedColor[]; // The K unique colors selected, with counts and symbols
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Select symbols depending on the user's preference
const ALPHABET_SYMBOLS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  // Omitted 'I' and 'O' to prevent confusion with numbers 1 and 0
];

const NUMBER_SYMBOLS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
];

const MIXED_SYMBOLS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '+', '-', '*', '?', '#', '@', '$', '◆', '▲', '●'
];

/**
 * Standard K-Means Clustering on RGB pixel data.
 */
function runKMeans(pixels: RGB[], k: number, maxIterations = 15): RGB[] {
  if (pixels.length === 0) return [];
  if (k >= pixels.length) return pixels.map(p => ({ ...p }));

  // 1. Initialize centroids by selecting k pixels evenly spaced throughout the image
  const centroids: RGB[] = [];
  const step = Math.floor(pixels.length / k);
  for (let i = 0; i < k; i++) {
    const idx = Math.min(i * step, pixels.length - 1);
    centroids.push({ ...pixels[idx] });
  }

  const assignments = new Uint16Array(pixels.length);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // 2. Assignment Step: assign each pixel to the nearest centroid
    for (let pIdx = 0; pIdx < pixels.length; pIdx++) {
      const pixel = pixels[pIdx];
      let minDistance = Infinity;
      let closestIdx = 0;

      for (let cIdx = 0; cIdx < k; cIdx++) {
        const centroid = centroids[cIdx];
        const dr = pixel.r - centroid.r;
        const dg = pixel.g - centroid.g;
        const db = pixel.b - centroid.b;
        const dist = dr * dr + dg * dg + db * db; // Simple Euclidean distance for clustering speed

        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = cIdx;
        }
      }

      if (assignments[pIdx] !== closestIdx) {
        assignments[pIdx] = closestIdx;
        changed = true;
      }
    }

    if (!changed) break; // Converted early

    // 3. Update Step: recalculate centroids as mean of assigned pixels
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (let pIdx = 0; pIdx < pixels.length; pIdx++) {
      const clusterIdx = assignments[pIdx];
      const pixel = pixels[pIdx];
      sums[clusterIdx].r += pixel.r;
      sums[clusterIdx].g += pixel.g;
      sums[clusterIdx].b += pixel.b;
      sums[clusterIdx].count++;
    }

    for (let cIdx = 0; cIdx < k; cIdx++) {
      const sum = sums[cIdx];
      if (sum.count > 0) {
        centroids[cIdx] = {
          r: Math.round(sum.r / sum.count),
          g: Math.round(sum.g / sum.count),
          b: Math.round(sum.b / sum.count)
        };
      }
    }
  }

  return centroids;
}

/**
 * Pixelates an image and quantizes its colors to the DMC color space, returning
 * mapped pixel data and the final color legend details.
 */
export function quantizeImage(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
  kColors: number,
  symbolStyle: 'alphabet' | 'number' | 'mixed'
): QuantizedResult {
  const pixels: RGB[] = [];
  const len = pixelData.length;

  for (let i = 0; i < len; i += 4) {
    pixels.push({
      r: pixelData[i],
      g: pixelData[i + 1],
      b: pixelData[i + 2]
    });
  }

  // 1. Run K-Means to find dominant color centroids
  const rawCentroids = runKMeans(pixels, kColors);

  // 2. Map centroids to their nearest DMC colors and ensure they are unique
  const mappedDmcCentroids: DmcColor[] = rawCentroids.map(c => findClosestDmcColor(c.r, c.g, c.b));
  
  // Deduplicate DMC colors (sometimes two centroids map to the same closest DMC color)
  const uniqueDmcCentroids: DmcColor[] = [];
  const seenCodes = new Set<string>();
  
  for (const dmc of mappedDmcCentroids) {
    if (!seenCodes.has(dmc.code)) {
      seenCodes.add(dmc.code);
      uniqueDmcCentroids.push(dmc);
    }
  }

  // 3. For each pixel in the grid, map it to the closest DMC color in the selected unique DMC palette
  const quantizedPixels: DmcColor[] = [];
  const counts: Record<string, number> = {};

  for (const pixel of pixels) {
    let minDistance = Infinity;
    let closestDmc = uniqueDmcCentroids[0];

    // Find closest DMC from our computed palette
    for (const dmc of uniqueDmcCentroids) {
      const meanR = (pixel.r + dmc.r) / 2;
      const deltaR = pixel.r - dmc.r;
      const deltaG = pixel.g - dmc.g;
      const deltaB = pixel.b - dmc.b;

      const weightR = 2 + meanR / 256;
      const weightG = 4.0;
      const weightB = 2 + (255 - meanR) / 256;

      const dist = Math.sqrt(
        weightR * deltaR * deltaR +
        weightG * deltaG * deltaG +
        weightB * deltaB * deltaB
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestDmc = dmc;
      }
    }

    quantizedPixels.push(closestDmc);
    counts[closestDmc.code] = (counts[closestDmc.code] || 0) + 1;
  }

  // 4. Assign symbols to the palette based on the chosen symbol style
  let symbolsSource = MIXED_SYMBOLS;
  if (symbolStyle === 'alphabet') {
    symbolsSource = ALPHABET_SYMBOLS;
  } else if (symbolStyle === 'number') {
    symbolsSource = NUMBER_SYMBOLS;
  }

  // Sort unique palette by count descending (or by code, but count is standard)
  const sortedPaletteDmc = [...uniqueDmcCentroids].sort((a, b) => {
    return (counts[b.code] || 0) - (counts[a.code] || 0);
  });

  const palette: QuantizedColor[] = sortedPaletteDmc.map((dmc, index) => {
    // If we run out of symbols in the requested style, fallback to mixed
    let symbol = symbolsSource[index % symbolsSource.length];
    if (symbolStyle === 'number' && index >= symbolsSource.length) {
      symbol = MIXED_SYMBOLS[index % MIXED_SYMBOLS.length];
    }
    return {
      dmc,
      count: counts[dmc.code] || 0,
      symbol
    };
  });

  return {
    pixels: quantizedPixels,
    palette
  };
}
