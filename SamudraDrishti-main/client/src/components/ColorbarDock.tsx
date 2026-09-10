'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { COLOR_PALETTES } from '../utils/colormaps';

interface ColorbarDockProps {
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

export const ColorbarDock: React.FC<ColorbarDockProps> = ({
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
  const [expanded, setExpanded] = useState(false);

  const palettesList = [
    { id: 'thermal', name: 'cmocean: thermal (Temp)' },
    { id: 'haline', name: 'cmocean: haline (Salinity)' },
    { id: 'speed', name: 'cmocean: speed (Velocity)' },
    { id: 'algae', name: 'cmocean: algae (Chlorophyll)' },
    { id: 'deep', name: 'cmocean: deep (Bathymetry)' },
    { id: 'balance', name: 'cmocean: balance (Upwelling)' },
    { id: 'turbo', name: 'Turbo' },
    { id: 'viridis', name: 'Viridis' },
    { id: 'coolwarm', name: 'Coolwarm' }
  ];

  const getGradientCss = (palId: string) => {
    const cols = COLOR_PALETTES[palId] || COLOR_PALETTES.thermal;
    const stops = cols.map((c, idx) => {
      const pct = Math.round((idx / (cols.length - 1)) * 100);
      return `rgb(${c.r}, ${c.g}, ${c.b}) ${pct}%`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  };

  return (
    <div className="bg-white/95 border border-slate-300 rounded-[2px] p-2 text-xs text-slate-800 w-52 select-none shadow-md backdrop-blur-xs">
      {/* Legend Title & Actions */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          Scale: {units}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onResetRange}
            className="text-[10px] text-slate-700 hover:text-slate-950 font-medium px-1.5 py-0.5 rounded-[2px] bg-slate-100 border border-slate-300 transition cursor-pointer shadow-2xs"
            title="Auto-scale to active depth field"
          >
            Auto
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
            title={expanded ? 'Hide settings' : 'Show settings'}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Clean Gradient Line */}
      <div
        className="w-full h-2 rounded-[1px] border border-slate-300 mb-1"
        style={{ background: getGradientCss(palette) }}
      />

      {/* Min / Max Range */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-700 font-bold tabular-nums">
        <span>{valMin.toFixed(1)}</span>
        <span className="text-slate-500 font-sans font-medium capitalize">{palette}</span>
        <span>{valMax.toFixed(1)}</span>
      </div>

      {/* Collapsible Palette Options */}
      {expanded && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200">
          <div>
            <label className="text-[10px] text-slate-600 block mb-0.5 font-medium">Colormap:</label>
            <select
              value={palette}
              onChange={(e) => onChangePalette(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-[2px] px-1 py-1 text-slate-800 cursor-pointer focus:outline-none shadow-2xs font-medium"
            >
              {palettesList.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono">
            <div>
              <span className="text-[10px] text-slate-600 block font-sans font-medium">Min:</span>
              <input
                type="number"
                step="0.1"
                value={valMin}
                onChange={(e) => onChangeRange(Number(e.target.value), valMax)}
                className="w-full text-xs bg-white border border-slate-300 rounded-[2px] px-1.5 py-0.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block font-sans font-medium">Max:</span>
              <input
                type="number"
                step="0.1"
                value={valMax}
                onChange={(e) => onChangeRange(valMin, Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-300 rounded-[2px] px-1.5 py-0.5 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-medium">
              <span>Opacity</span>
              <span className="font-mono text-slate-800 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={1.0}
              step={0.05}
              value={opacity}
              onChange={(e) => onChangeOpacity(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
