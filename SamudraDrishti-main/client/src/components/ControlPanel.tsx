import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  ArrowDownUp, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Eye, 
  Navigation 
} from 'lucide-react';
import { VariableMeta, ViewportLayers } from '../types/ocean';

interface ControlPanelProps {
  variables: VariableMeta[];
  activeVariable: string;
  onSelectVariable: (varId: string) => void;
  depths: number[];
  depthIdx: number;
  onSelectDepthIdx: (idx: number) => void;
  verticalExaggeration: number;
  onChangeVerticalExaggeration: (val: number) => void;
  layers: ViewportLayers;
  onToggleLayer: (layerKey: keyof ViewportLayers) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  variables,
  activeVariable,
  onSelectVariable,
  depths,
  depthIdx,
  onSelectDepthIdx,
  verticalExaggeration,
  onChangeVerticalExaggeration,
  layers,
  onToggleLayer
}) => {
  const currentDepth = depths[depthIdx] ?? 0;

  // Oceanographic zone classification
  const getOceanZone = (d: number) => {
    if (d <= 50) return { label: 'Surface Mixed Layer', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
    if (d <= 200) return { label: 'Thermocline Zone', color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' };
    if (d <= 1000) return { label: 'Mesopelagic (Twilight)', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' };
    return { label: 'Bathypelagic (Abyss)', color: 'text-sky-300 border-sky-500/40 bg-sky-950/40' };
  };

  const zone = getOceanZone(currentDepth);

  const getVarIcon = (id: string) => {
    switch (id) {
      case 'thetao': return <Thermometer className="w-4 h-4 text-rose-400" />;
      case 'so': return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'velocity': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'chl': return <Activity className="w-4 h-4 text-lime-400" />;
      case 'wo': return <ArrowDownUp className="w-4 h-4 text-teal-400" />;
      case 'zos': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 text-slate-200 shadow-2xl max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* Variable Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Ocean State Variables
          </h2>
          <span className="text-[10px] text-cyan-400/80 font-mono">CF-1.8 GRID</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {variables.map((v) => {
            const isActive = v.id === activeVariable;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVariable(v.id)}
                className={`flex flex-col text-left p-2 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-950 to-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  {getVarIcon(v.id)}
                  <span className="text-[10px] font-mono text-slate-400">{v.units}</span>
                </div>
                <span className="text-xs font-semibold leading-tight line-clamp-1">
                  {v.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* Depth Level Navigation */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-blue-400" />
            Water Column Depth
          </h2>
          <span className="text-xs font-bold text-cyan-300 font-mono">
            {currentDepth} m
          </span>
        </div>

        {/* Ocean Zone Badge */}
        <div className="mb-2.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${zone.color}`}>
            {zone.label}
          </span>
        </div>

        {/* Depth Slider */}
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={depths.length - 1}
            step={1}
            value={depthIdx}
            onChange={(e) => onSelectDepthIdx(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0m (Surface)</span>
            <span>200m (Thermocline)</span>
            <span>2000m (Abyss)</span>
          </div>
        </div>

        {/* Quick Depth Buttons */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {[0, 20, 50, 100, 200, 500, 1000, 2000].map((d) => {
            const idx = depths.indexOf(d);
            if (idx === -1) return null;
            const isSel = idx === depthIdx;
            return (
              <button
                key={d}
                onClick={() => onSelectDepthIdx(idx)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition ${
                  isSel
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d === 0 ? 'Surface' : `${d}m`}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* Vertical Exaggeration Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            Vertical Exaggeration
          </h2>
          <span className="text-xs font-bold text-teal-300 font-mono">
            {verticalExaggeration}x
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">
          Expands vertical depth axis relative to horizontal coordinates.
        </p>
        <div className="px-1">
          <input
            type="range"
            min={1}
            max={35}
            step={1}
            value={verticalExaggeration}
            onChange={(e) => onChangeVerticalExaggeration(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>1x (True)</span>
            <span>15x</span>
            <span>35x (High)</span>
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* Layer Visibility Toggles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Layer Controls
          </h2>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Ocean Model Slice
            </span>
            <input
              type="checkbox"
              checked={layers.showModelSlice}
              onChange={() => onToggleLayer('showModelSlice')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              3D Flow Particles (Currents)
            </span>
            <input
              type="checkbox"
              checked={layers.showVectorParticles}
              onChange={() => onToggleLayer('showVectorParticles')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Argo Profiling Floats
            </span>
            <input
              type="checkbox"
              checked={layers.showArgo}
              onChange={() => onToggleLayer('showArgo')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              Underwater Gliders
            </span>
            <input
              type="checkbox"
              checked={layers.showGliders}
              onChange={() => onToggleLayer('showGliders')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Moored Buoys (OMNI/RAMA)
            </span>
            <input
              type="checkbox"
              checked={layers.showBuoys}
              onChange={() => onToggleLayer('showBuoys')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              India EEZ Boundary (200 NM)
            </span>
            <input
              type="checkbox"
              checked={layers.showEez}
              onChange={() => onToggleLayer('showEez')}
              className="accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              3D Seafloor Bathymetry
            </span>
            <input
              type="checkbox"
              checked={layers.showBathymetry}
              onChange={() => onToggleLayer('showBathymetry')}
              className="accent-cyan-400 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
