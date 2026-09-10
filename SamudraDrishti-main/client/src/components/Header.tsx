import React from 'react';
import { 
  Waves, 
  Layers, 
  UploadCloud, 
  Compass, 
  ShieldAlert, 
  BookOpen, 
  Maximize2, 
  Eye, 
  Anchor 
} from 'lucide-react';

interface HeaderProps {
  appMode: 'forecaster' | 'outreach';
  setAppMode: (mode: 'forecaster' | 'outreach') => void;
  onOpenIngestion: () => void;
  onOpenTransect: () => void;
  onOpenAdvisories: () => void;
  onSelectCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  onOpenIngestion,
  onOpenTransect,
  onOpenAdvisories,
  onSelectCameraPreset
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 glass-panel border-b border-cyan-500/20">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <img src="/logo-mark.svg" alt="SamudraDrishti Crest" className="w-full h-full object-contain filter drop-shadow-md" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              SamudraDrishti
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0f172a] border border-[#1e293b] text-slate-300 font-semibold tracking-wider font-mono">
              OPERATIONAL v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            3D Ocean Digital Twin & In-Situ Observation Platform
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
        <button
          onClick={() => setAppMode('forecaster')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            appMode === 'forecaster'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anchor className="w-3.5 h-3.5" />
          Forecaster Mode
        </button>
        <button
          onClick={() => setAppMode('outreach')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            appMode === 'outreach'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Science Outreach Mode
        </button>
      </div>

      {/* Action Tools & View Presets */}
      <div className="flex items-center gap-2">
        {/* Camera Preset Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Camera Presets</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-44 py-1.5 rounded-lg glass-panel border border-slate-700/80 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-30">
            <button
              onClick={() => onSelectCameraPreset('overview')}
              className="w-full text-left px-3 py-1 text-xs text-slate-200 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              Plan View (Top-Down)
            </button>
            <button
              onClick={() => onSelectCameraPreset('oblique')}
              className="w-full text-left px-3 py-1 text-xs text-slate-200 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              3D Water Column Oblique
            </button>
            <button
              onClick={() => onSelectCameraPreset('arabian')}
              className="w-full text-left px-3 py-1 text-xs text-slate-200 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              Arabian Sea Upwelling
            </button>
            <button
              onClick={() => onSelectCameraPreset('bob')}
              className="w-full text-left px-3 py-1 text-xs text-slate-200 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              Bay of Bengal Fresh Plume
            </button>
            <button
              onClick={() => onSelectCameraPreset('eez')}
              className="w-full text-left px-3 py-1 text-xs text-slate-200 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              India EEZ Maritime View
            </button>
          </div>
        </div>

        {/* Vertical Transect Slicer Tool */}
        <button
          onClick={onOpenTransect}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition"
          title="Vertical Ocean Transect Curtain"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>3D Transect</span>
        </button>

        {/* Operational Advisories */}
        <button
          onClick={onOpenAdvisories}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-amber-300 transition"
          title="Tropical Cyclone Heat Potential, PFZ & SAR Drift"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Advisories</span>
        </button>

        {/* Ingestion & Upload */}
        <button
          onClick={onOpenIngestion}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/40 text-xs text-cyan-300 font-medium transition shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>Data Ingestion</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
