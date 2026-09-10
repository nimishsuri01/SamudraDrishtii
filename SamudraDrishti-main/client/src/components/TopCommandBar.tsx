'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Layers, 
  Compass, 
  UploadCloud, 
  ShieldAlert, 
  BookOpen, 
  Anchor, 
  Clock,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { EngineMode } from './DualViewport';

interface TopCommandBarProps {
  engineMode: EngineMode;
  onSelectEngine: (mode: EngineMode) => void;
  appMode: 'forecaster' | 'outreach';
  onSelectAppMode: (mode: 'forecaster' | 'outreach') => void;
  onOpenIngestion: () => void;
  onOpenTransect: () => void;
  onOpenAdvisories: () => void;
  onOpenBrand?: () => void;
  onSelectCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  engineMode,
  onSelectEngine,
  appMode,
  onSelectAppMode,
  onOpenIngestion,
  onOpenTransect,
  onOpenAdvisories,
  onOpenBrand,
  onSelectCameraPreset,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <header className="h-9 w-full bg-[#f8fafc] border-b border-slate-300 flex items-center justify-between px-3 text-xs text-slate-700 z-30 select-none">
      {/* Left: Workstation Indicator & Engine Switcher */}
      <div className="flex items-center gap-2.5">
        {isFullscreen ? (
          <div 
            onClick={onOpenBrand}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition mr-1"
            title="SamudraDrishti DSS"
          >
            <img 
              src="/logo-mark.svg" 
              alt="SamudraDrishti" 
              className="w-4 h-4 object-contain" 
            />
            <span className="font-bold text-slate-900 text-xs tracking-tight">
              SamudraDrishti
            </span>
            <span className="text-[10px] text-slate-700 font-mono px-1 py-0.2 rounded bg-slate-100 border border-slate-300 font-semibold">
              FULLSCREEN
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline text-slate-800">Ocean Forecaster</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
          </div>
        )}

        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onSelectEngine('cesium')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
              engineMode === 'cesium'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className={`w-3.5 h-3.5 ${engineMode === 'cesium' ? 'text-white' : 'text-slate-500'}`} />
            <span>3D Globe</span>
          </button>
          <button
            onClick={() => onSelectEngine('three')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
              engineMode === 'three'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${engineMode === 'three' ? 'text-white' : 'text-slate-500'}`} />
            <span>4D Column</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onSelectAppMode('forecaster')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
              appMode === 'forecaster'
                ? 'bg-white text-blue-600 font-bold border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Anchor className="w-3 h-3 text-blue-600" />
            <span>Operational</span>
          </button>
          <button
            onClick={() => onSelectAppMode('outreach')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
              appMode === 'outreach'
                ? 'bg-white text-blue-600 font-bold border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3 h-3 text-blue-600" />
            <span>Outreach</span>
          </button>
        </div>
      </div>

      {/* Right: GIS Action Tools & Camera Presets */}
      <div className="flex items-center gap-2">
        {/* Camera View Presets Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 transition cursor-pointer shadow-2xs">
            <Compass className="w-3 h-3 text-slate-500" />
            <span>Presets</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 top-full mt-0.5 w-44 py-1 rounded-lg bg-white border border-slate-200 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-40">
            <button
              onClick={() => onSelectCameraPreset('overview')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium"
            >
              Plan View (Top-Down)
            </button>
            <button
              onClick={() => onSelectCameraPreset('oblique')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium"
            >
              3D Oblique Perspective
            </button>
            <button
              onClick={() => onSelectCameraPreset('arabian')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium"
            >
              Arabian Sea Upwelling
            </button>
            <button
              onClick={() => onSelectCameraPreset('bob')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium"
            >
              Bay of Bengal Plume
            </button>
            <button
              onClick={() => onSelectCameraPreset('eez')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium"
            >
              India EEZ Maritime Zone
            </button>
          </div>
        </div>

        {/* 3D Transect Tool */}
        <button
          onClick={onOpenTransect}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer shadow-2xs"
        >
          <Layers className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline">Transect</span>
        </button>

        {/* Operational Advisories */}
        <button
          onClick={onOpenAdvisories}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer shadow-2xs"
        >
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          <span className="hidden sm:inline">Advisories</span>
        </button>

        {/* Data Ingestion */}
        <button
          onClick={onOpenIngestion}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 border border-blue-600 text-xs text-white font-semibold transition cursor-pointer shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5 text-white" />
          <span>Upload</span>
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 hover:text-slate-950 transition cursor-pointer ml-1 shadow-2xs"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workstation"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-slate-700" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-700" />}
          </button>
        )}
      </div>
    </header>
  );
};
