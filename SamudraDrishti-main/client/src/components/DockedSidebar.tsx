'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  ArrowDownUp, 
  TrendingUp, 
  Flame, 
  Fish, 
  LifeBuoy, 
  Layers 
} from 'lucide-react';
import { VariableMeta, ViewportLayers, InstrumentMarker } from '../types/ocean';

interface DockedSidebarProps {
  variables: VariableMeta[];
  activeVariable: string;
  onSelectVariable: (varId: string) => void;
  depths: number[];
  depthIdx: number;
  onSelectDepthIdx: (idx: number) => void;
  verticalExaggeration: number;
  onChangeVerticalExaggeration: (val: number) => void;
  layers: ViewportLayers;
  onToggleLayer: (key: keyof ViewportLayers) => void;
  instruments: InstrumentMarker[];
  onSelectPlatform: (platform: InstrumentMarker) => void;
  onOpenTransect: () => void;
  onOpenAdvisories: () => void;
  onNavigateChapter: (chapter: any) => void;
}

export const DockedSidebar: React.FC<DockedSidebarProps> = ({
  variables,
  activeVariable,
  onSelectVariable,
  depths,
  depthIdx,
  onSelectDepthIdx,
  verticalExaggeration,
  onChangeVerticalExaggeration,
  layers,
  onToggleLayer,
  instruments,
  onSelectPlatform,
  onOpenTransect,
  onOpenAdvisories,
  onNavigateChapter
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'vars' | 'fleet' | 'advisories' | 'stories'>('vars');

  const currentDepth = depths[depthIdx] ?? 0;

  const getVarIcon = (id: string) => {
    switch (id) {
      case 'thetao': return <Thermometer className="w-3.5 h-3.5 text-slate-400" />;
      case 'so': return <Droplets className="w-3.5 h-3.5 text-slate-400" />;
      case 'velocity': return <Wind className="w-3.5 h-3.5 text-slate-400" />;
      case 'chl': return <Activity className="w-3.5 h-3.5 text-slate-400" />;
      case 'wo': return <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />;
      case 'zos': return <TrendingUp className="w-3.5 h-3.5 text-slate-400" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getOceanZone = (d: number) => {
    if (d <= 50) return { label: 'Surface Mixed Layer', range: '0–50 m' };
    if (d <= 200) return { label: 'Thermocline Gradient', range: '50–200 m' };
    if (d <= 1000) return { label: 'Mesopelagic Zone', range: '200–1000 m' };
    return { label: 'Bathypelagic Abyss', range: '1000–2000 m' };
  };

  const zone = getOceanZone(currentDepth);

  const CHAPTERS = [
    {
      title: "The Great Monsoon Current Reversal",
      tagline: "Twice-yearly reversal of the Somali & Monsoon Drift",
      variable: "velocity",
      depthIdx: 0,
      cameraPreset: "arabian" as const
    },
    {
      title: "The Mystery of the Ocean Thermocline",
      tagline: "Sharp 18°C temperature drop between 50m and 200m",
      variable: "thetao",
      depthIdx: 4,
      cameraPreset: "oblique" as const
    },
    {
      title: "Upwelling: The Ocean's Nutrient Fountain",
      tagline: "Cold nutrient surges powering Kerala & Oman fisheries",
      variable: "chl",
      depthIdx: 0,
      cameraPreset: "arabian" as const
    },
    {
      title: "The Robotic Fleet: Autonomous Argo Floats",
      tagline: "Robotic buoys surveying 2,000m deep water columns",
      variable: "so",
      depthIdx: 6,
      cameraPreset: "eez" as const
    },
    {
      title: "Cyclones & Ocean Heat: Fuel for Superstorms",
      tagline: "High TCHP reserves (>80 kJ/cm²) triggering rapid intensification",
      variable: "thetao",
      depthIdx: 3,
      cameraPreset: "bob" as const
    }
  ];

  return (
    <aside className={`relative h-[calc(100vh-36px-34px)] bg-white border-r border-slate-300 flex flex-col transition-all duration-200 z-20 select-none ${collapsed ? 'w-9' : 'w-72'}`}>
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-2.5 top-2.5 w-5 h-5 rounded-[2px] bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-950 transition z-30 cursor-pointer shadow-2xs"
        title={collapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Desktop-Style Flat Tabs */}
      <div className="flex items-center border-b border-slate-300 bg-slate-100">
        <button
          onClick={() => { setActiveTab('vars'); setCollapsed(false); }}
          className={`flex-1 py-1.5 text-xs transition cursor-pointer border-b-2 text-center font-semibold ${
            activeTab === 'vars' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {collapsed ? 'Var' : 'Variables'}
        </button>

        <button
          onClick={() => { setActiveTab('fleet'); setCollapsed(false); }}
          className={`flex-1 py-1.5 text-xs transition cursor-pointer border-b-2 text-center font-semibold ${
            activeTab === 'fleet' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {collapsed ? 'Flt' : 'Fleet'}
        </button>

        <button
          onClick={() => { setActiveTab('advisories'); setCollapsed(false); }}
          className={`flex-1 py-1.5 text-xs transition cursor-pointer border-b-2 text-center font-semibold ${
            activeTab === 'advisories' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {collapsed ? 'Adv' : 'Advisories'}
        </button>

        <button
          onClick={() => { setActiveTab('stories'); setCollapsed(false); }}
          className={`flex-1 py-1.5 text-xs transition cursor-pointer border-b-2 text-center font-semibold ${
            activeTab === 'stories' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {collapsed ? 'Out' : 'Stories'}
        </button>
      </div>

      {/* Expanded Control Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3 text-xs flex flex-col gap-4 text-slate-700">
          {/* TAB 1: VARIABLES & 4D SLICING */}
          {activeTab === 'vars' && (
            <>
              {/* Vertical Variables List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Variables
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">3D/4D Field</span>
                </div>

                <div className="flex flex-col divide-y divide-slate-200 border border-slate-300 rounded-[2px] bg-white">
                  {variables.map((v) => {
                    const isSel = v.id === activeVariable;
                    return (
                      <button
                        key={v.id}
                        onClick={() => onSelectVariable(v.id)}
                        className={`w-full text-left px-2.5 py-1.5 transition flex items-center justify-between cursor-pointer ${
                          isSel
                            ? 'bg-slate-100 text-slate-950 font-bold border-l-2 border-slate-800'
                            : 'hover:bg-slate-50 text-slate-700 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getVarIcon(v.id)}
                          <span className="text-xs truncate">{v.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 ml-2 shrink-0">
                          {v.units}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Depth Level Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    Depth Slicing
                  </span>
                  <span className="font-mono text-xs text-slate-900 font-bold tabular-nums">
                    {currentDepth} m
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 mb-2 flex items-center justify-between font-medium">
                  <span>{zone.label}</span>
                  <span className="font-mono text-slate-500">{zone.range}</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={depths.length - 1}
                  step={1}
                  value={depthIdx}
                  onChange={(e) => onSelectDepthIdx(Number(e.target.value))}
                  className="w-full cursor-pointer mb-2"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-2">
                  <span>Surface (0m)</span>
                  <span>Thermocline (200m)</span>
                  <span>Abyss (2000m)</span>
                </div>

                {/* Standard Compact Depth Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {[0, 20, 50, 100, 200, 500, 1000, 2000].map((d) => {
                    const idx = depths.indexOf(d);
                    if (idx === -1) return null;
                    const isSel = idx === depthIdx;
                    return (
                      <button
                        key={d}
                        onClick={() => onSelectDepthIdx(idx)}
                        className={`text-[11px] font-mono py-1 rounded-[2px] transition text-center cursor-pointer ${
                          isSel 
                            ? 'bg-[#005a9c] text-white font-bold border border-[#00477d] shadow-2xs' 
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                        }`}
                      >
                        {d === 0 ? '0m' : `${d}m`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Vertical Exaggeration Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Vertical Exaggeration
                  </span>
                  <span className="font-mono text-xs text-slate-900 font-bold tabular-nums">
                    {verticalExaggeration}×
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={35}
                  step={1}
                  value={verticalExaggeration}
                  onChange={(e) => onChangeVerticalExaggeration(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="h-px bg-slate-200" />

              {/* Layer Visibility Checklist */}
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2">
                  Layers
                </div>
                <div className="flex flex-col divide-y divide-slate-200 text-xs">
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Model scalar field</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showModelSlice} 
                      onChange={() => onToggleLayer('showModelSlice')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Current velocity streamlines</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showVectorParticles} 
                      onChange={() => onToggleLayer('showVectorParticles')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Argo profiling floats</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showArgo} 
                      onChange={() => onToggleLayer('showArgo')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Underwater gliders</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showGliders} 
                      onChange={() => onToggleLayer('showGliders')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Moored buoys (OMNI / RAMA)</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showBuoys} 
                      onChange={() => onToggleLayer('showBuoys')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">India EEZ (200 NM boundary)</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showEez} 
                      onChange={() => onToggleLayer('showEez')} 
                    />
                  </label>
                  <label className="flex items-center justify-between py-1.5 cursor-pointer hover:text-slate-950 font-medium">
                    <span className="text-slate-700">Seafloor bathymetry</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showBathymetry} 
                      onChange={() => onToggleLayer('showBathymetry')} 
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: OBSERVATION FLEET */}
          {activeTab === 'fleet' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Observation Platforms
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">{instruments.length} active</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                Click to inspect profile curves, validation stats, and T-S water masses:
              </p>
              <div className="flex flex-col divide-y divide-slate-200 border border-slate-300 rounded-[2px] bg-white max-h-[calc(100vh-210px)] overflow-y-auto">
                {instruments.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => onSelectPlatform(inst)}
                    className="text-left py-2 px-2.5 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{inst.name}</span>
                        {inst.wmo && (
                          <span className="font-mono text-[10px] text-slate-500">
                            ({inst.wmo})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {inst.lat.toFixed(2)}°N, {inst.lon.toFixed(2)}°E
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-slate-100 border border-slate-300 text-slate-700 capitalize font-medium">
                      {inst.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONAL ADVISORIES */}
          {activeTab === 'advisories' && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-900 mb-1">
                Advisory Bulletins
              </div>
              <div className="flex flex-col divide-y divide-slate-200 border border-slate-300 rounded-[2px] bg-white">
                <button
                  onClick={onOpenAdvisories}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tropical Cyclone Heat Potential (TCHP)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Bay of Bengal: 112.4 kJ/cm² (&gt;80 threshold)
                  </div>
                </button>

                <button
                  onClick={onOpenAdvisories}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Fish className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Potential Fishing Zones (PFZ)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    4 Coastal Advisory Sectors Active
                  </div>
                </button>

                <button
                  onClick={onOpenAdvisories}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#005a9c]" />
                    <span>Search & Rescue (SAR) Drift</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Maritime distress advection & leeway model
                  </div>
                </button>

                <button
                  onClick={onOpenTransect}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>Vertical 3D Transect Slicer</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Chennai → Port Blair Cross-Section
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SCIENCE STORIES */}
          {activeTab === 'stories' && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-900 mb-1">
                Guided Science Journeys
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                Interactive 3D chapters for educational and outreach demonstration:
              </p>
              <div className="flex flex-col divide-y divide-slate-200 border border-slate-300 rounded-[2px] bg-white">
                {CHAPTERS.map((ch, idx) => (
                  <button
                    key={ch.title}
                    onClick={() => onNavigateChapter(ch)}
                    className="text-left p-2.5 hover:bg-slate-50 transition flex flex-col gap-0.5 cursor-pointer"
                  >
                    <div className="text-[10px] font-mono text-[#005a9c] font-semibold">
                      Chapter 0{idx + 1}
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">
                      {ch.title}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {ch.tagline}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
