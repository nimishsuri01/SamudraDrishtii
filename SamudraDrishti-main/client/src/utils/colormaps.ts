// Oceanographic Colormap Palettes (cmocean standards)

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const COLOR_PALETTES: Record<string, RGB[]> = {
  thermal: [
    { r: 3, g: 18, b: 54 },      // Abyss Navy
    { r: 14, g: 70, b: 145 },    // Cold Deep Ocean
    { r: 14, g: 135, b: 205 },   // Sub-surface Blue
    { r: 20, g: 184, b: 166 },   // Thermocline Cyan/Teal
    { r: 74, g: 222, b: 128 },   // Sea Green
    { r: 250, g: 204, b: 21 },   // Warm Sun Yellow
    { r: 249, g: 115, b: 22 },   // Surface Amber
    { r: 225, g: 29, b: 72 },    // Tropical Warm Coral
  ],
  haline: [
    { r: 15, g: 23, b: 42 },     // Deep Marine Slate (Freshwater Plume)
    { r: 14, g: 85, b: 150 },    // Coastal Brackish
    { r: 6, g: 148, b: 162 },    // Intermediate Shelf
    { r: 16, g: 185, b: 129 },   // Open Ocean Base
    { r: 132, g: 204, b: 22 },   // High Salinity Fringe
    { r: 234, g: 179, b: 8 },    // Arabian Sea Core Salinity
    { r: 254, g: 240, b: 138 },  // Maximum Evaporative Apex
  ],
  speed: [
    { r: 8, g: 28, b: 68 },      // Sluggish / Quiescent Navy
    { r: 14, g: 95, b: 165 },    // Moderate Flow
    { r: 20, g: 184, b: 166 },   // Jet Boundary
    { r: 132, g: 204, b: 22 },   // Monsoon Drift
    { r: 245, g: 158, b: 11 },   // Somali Current Core
    { r: 225, g: 29, b: 72 },    // High-Velocity Jet Max
  ],
  algae: [
    { r: 10, g: 24, b: 50 },
    { r: 16, g: 65, b: 85 },
    { r: 25, g: 115, b: 85 },
    { r: 40, g: 165, b: 75 },
    { r: 110, g: 205, b: 55 },
    { r: 195, g: 235, b: 55 },
    { r: 245, g: 252, b: 140 },
  ],
  deep: [
    { r: 4, g: 10, b: 24 },
    { r: 12, g: 28, b: 65 },
    { r: 20, g: 65, b: 125 },
    { r: 30, g: 115, b: 175 },
    { r: 56, g: 189, b: 248 },
    { r: 147, g: 218, b: 253 },
    { r: 240, g: 249, b: 255 },
  ],
  balance: [
    { r: 14, g: 95, b: 165 },    // Downwelling Blue
    { r: 56, g: 189, b: 248 },
    { r: 203, g: 213, b: 225 },   // Neutral Slate
    { r: 245, g: 158, b: 11 },
    { r: 225, g: 29, b: 72 },    // Upwelling Warm Front
  ],
  turbo: [
    { r: 4, g: 20, b: 65 },
    { r: 14, g: 120, b: 220 },
    { r: 20, g: 215, b: 175 },
    { r: 150, g: 245, b: 50 },
    { r: 245, g: 180, b: 40 },
    { r: 225, g: 60, b: 15 },
    { r: 130, g: 10, b: 5 },
  ],
  viridis: [
    { r: 10, g: 30, b: 70 },
    { r: 18, g: 75, b: 130 },
    { r: 25, g: 130, b: 140 },
    { r: 35, g: 170, b: 120 },
    { r: 85, g: 195, b: 90 },
    { r: 165, g: 215, b: 50 },
    { r: 250, g: 230, b: 40 },
  ],
  coolwarm: [
    { r: 14, g: 85, b: 175 },
    { r: 96, g: 165, b: 250 },
    { r: 203, g: 213, b: 225 },
    { r: 248, g: 113, b: 113 },
    { r: 185, g: 28, b: 28 },
  ]
};

export function interpolateColor(t: number, paletteName: string = "thermal"): RGB {
  const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.thermal;
  const clampedT = Math.max(0, Math.min(1, t));
  const pos = clampedT * (palette.length - 1);
  const idx = Math.floor(pos);
  const frac = pos - idx;

  if (idx >= palette.length - 1) {
    return palette[palette.length - 1];
  }

  const c1 = palette[idx];
  const c2 = palette[idx + 1];

  return {
    r: Math.round(c1.r + frac * (c2.r - c1.r)),
    g: Math.round(c1.g + frac * (c2.g - c1.g)),
    b: Math.round(c1.b + frac * (c2.b - c1.b)),
  };
}

export function getColorCss(val: number, min: number, max: number, palette: string = "thermal", alpha: number = 1.0): string {
  if (val === null || val === undefined || isNaN(val)) {
    return "rgba(0,0,0,0)";
  }
  const norm = max > min ? (val - min) / (max - min) : 0.5;
  const rgb = interpolateColor(norm, palette);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getHexColor(val: number, min: number, max: number, palette: string = "thermal"): number {
  const norm = max > min ? (val - min) / (max - min) : 0.5;
  const rgb = interpolateColor(norm, palette);
  return (rgb.r << 16) | (rgb.g << 8) | rgb.b;
}
