import React from 'react';
import { Palette, RefreshCw, Eye } from 'lucide-react';
import { COLOR_PALETTES } from '../utils/colormaps';

interface ColorbarEditorProps {
  palette: string;
  onChangePalette: (pal: string) => void;
  valMin: number;
  valMax: number;
  onChangeRange: (min: number, max: number) => void;
  onResetRange: () => void;
  opacity: number;
  onChangeOpacity: (op: number) => void;
  units: string;
}

export const ColorbarEditor: React.FC<ColorbarEditorProps> = ({
  palette,
  onChangePalette,
  valMin,
  valMax,
  onChangeRange,
  onResetRange,
  opacity,
  onChangeOpacity,
  units
}) => {
  const palettesList = [
    { id: 'thermal', name: 'cmocean: thermal (Temp)' },
    { id: 'haline', name: 'cmocean: haline (Salinity)' },
    { id: 'speed', name: 'cmocean: speed (Currents)' },
    { id: 'algae', name: 'cmocean: algae (Chlorophyll)' },
    { id: 'deep', name: 'cmocean: deep (Bathymetry)' },
    { id: 'balance', name: 'cmocean: balance (Upwelling)' },
    { id: 'turbo', name: 'Turbo (Rainbow)' },
    { id: 'viridis', name: 'Viridis' },
    { id: 'coolwarm', name: 'Coolwarm' }
  ];

  // Generate CSS gradient string from palette
  const getGradientCss = (palId: string) => {
    const cols = COLOR_PALETTES[palId] || COLOR_PALETTES.thermal;
    const stops = cols.map((c, idx) => {
      const pct = Math.round((idx / (cols.length - 1)) * 100);
      return `rgb(${c.r}, ${c.g}, ${c.b}) ${pct}%`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  };

  return (
    <div className="bg-[#0b121e] rounded-xl border border-[#16253c] p-3.5 flex flex-col gap-3 shadow-2xl text-slate-200 w-80">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          Colorbar & Scale Editor
        </h3>
        <button
          onClick={onResetRange}
          className="flex items-center gap-1 text-[10px] text-slate-200 hover:text-white bg-[#131f33] hover:bg-[#1a2b47] border border-[#1e3252] px-2 py-0.5 rounded transition cursor-pointer"
          title="Auto-stretch min/max to data values"
        >
          <RefreshCw className="w-3 h-3 text-slate-300" />
          Auto-Scale
        </button>
      </div>

      {/* Live Gradient Preview */}
      <div className="flex flex-col gap-1">
        <div
          className="w-full h-4 rounded-md border border-[#16253c] shadow-inner"
          style={{ background: getGradientCss(palette) }}
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
          <span>{valMin.toFixed(2)} {units}</span>
          <span className="text-slate-400">Range</span>
          <span>{valMax.toFixed(2)} {units}</span>
        </div>
      </div>

      {/* Palette Selector */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">Color Palette</label>
        <select
          value={palette}
          onChange={(e) => onChangePalette(e.target.value)}
          className="w-full text-xs bg-[#0e1726] border border-[#1b2a43] rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-slate-400"
        >
          {palettesList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Min & Max Controls */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Min Value ({units})</label>
          <input
            type="number"
            step="0.1"
            value={valMin}
            onChange={(e) => onChangeRange(Number(e.target.value), valMax)}
            className="w-full text-xs font-mono bg-[#0e1726] border border-[#1b2a43] rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Max Value ({units})</label>
          <input
            type="number"
            step="0.1"
            value={valMax}
            onChange={(e) => onChangeRange(valMin, Number(e.target.value))}
            className="w-full text-xs font-mono bg-[#0e1726] border border-[#1b2a43] rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Opacity Slider */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" />
            Layer Transparency
          </span>
          <span className="font-mono text-slate-200">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.15}
          max={1.0}
          step={0.05}
          value={opacity}
          onChange={(e) => onChangeOpacity(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
        />
      </div>
    </div>
  );
};
