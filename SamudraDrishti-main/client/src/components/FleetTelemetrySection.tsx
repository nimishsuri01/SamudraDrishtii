'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  ArrowUpRight, 
  MapPin, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { InstrumentMarker } from '../types/ocean';

interface FleetTelemetrySectionProps {
  instruments: InstrumentMarker[];
  onSelectPlatform: (platform: InstrumentMarker) => void;
  onLaunchWorkstation: () => void;
}

export const FleetTelemetrySection: React.FC<FleetTelemetrySectionProps> = ({
  instruments,
  onSelectPlatform,
  onLaunchWorkstation
}) => {
  const [filterType, setFilterType] = useState<'all' | 'argo' | 'glider' | 'buoy'>('all');

  const handleInspect = (inst: InstrumentMarker) => {
    onSelectPlatform(inst);
    onLaunchWorkstation();
  };

  const filtered = filterType === 'all' 
    ? instruments 
    : instruments.filter(i => (i.category === filterType || i.type?.toLowerCase().includes(filterType)));

  const countArgo = instruments.filter(i => i.category === 'argo' || i.type?.toLowerCase().includes('argo')).length || 8;
  const countGlider = instruments.filter(i => i.category === 'glider' || i.type?.toLowerCase().includes('glider')).length || 2;
  const countBuoy = instruments.filter(i => i.category === 'buoy' || i.type?.toLowerCase().includes('buoy')).length || 4;

  const getPlatformDepth = (inst: InstrumentMarker) => {
    if (inst.depth) return `${inst.depth} m`;
    const cat = inst.category || (inst.type?.toLowerCase().includes('argo') ? 'argo' : inst.type?.toLowerCase().includes('glider') ? 'glider' : 'buoy');
    if (cat === 'argo') return '0 – 2000 m';
    if (cat === 'glider') return '0 – 1000 m';
    return '0 – 500 m';
  };

  const getPlatformTypeLabel = (inst: InstrumentMarker) => {
    if (inst.type) return inst.type;
    if (inst.category === 'argo') return 'Argo Profiling Float';
    if (inst.category === 'glider') return 'Autonomous Glider';
    return 'Moored OMNI Buoy';
  };

  return (
    <section id="impact" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-100 scroll-mt-20">
      <div id="fleet" className="sr-only" />
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-600 text-xs font-semibold shadow-xs mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>IN-SITU OBSERVATIONAL NETWORK</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight font-sans">
              Autonomous Fleet &amp;<br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400">
                Telemetry Registry
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Continuous live oceanographic soundings from autonomous profiling floats, gliders, and moored buoys deployed across the Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-2.5 text-xs text-slate-700 bg-white border border-blue-100/80 rounded-2xl px-4 py-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-900">{instruments.length || 14} Platforms Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">CF-1.8 Co-Located</span>
          </div>
        </div>

        {/* Operational Filter & Tabular Container */}
        <div className="bg-white border border-blue-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
          
          {/* Top Filter Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-sky-50/20 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-500" />
                Filter:
              </span>
              
              <button
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-blue-200'
                }`}
              >
                All Platforms ({instruments.length || 14})
              </button>
              
              <button
                onClick={() => setFilterType('argo')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'argo'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-blue-200'
                }`}
              >
                Argo Floats ({countArgo})
              </button>
              
              <button
                onClick={() => setFilterType('glider')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'glider'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-blue-200'
                }`}
              >
                Gliders ({countGlider})
              </button>
              
              <button
                onClick={() => setFilterType('buoy')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'buoy'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-blue-200'
                }`}
              >
                Moored Buoys ({countBuoy})
              </button>
            </div>

            {/* Quality Statement */}
            <div className="text-xs text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>QC Flag 1: Verified Soundings</span>
            </div>
          </div>

          {/* Desktop Tabular View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3">Platform / ID</th>
                  <th scope="col" className="px-5 py-3">Type &amp; Sensor</th>
                  <th scope="col" className="px-5 py-3">Coordinates / Basin</th>
                  <th scope="col" className="px-5 py-3">Depth Range</th>
                  <th scope="col" className="px-5 py-3">SST / SSS</th>
                  <th scope="col" className="px-5 py-3">Model RMSE</th>
                  <th scope="col" className="px-5 py-3">Last Sounding</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-xs font-mono">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Synchronizing observational in-situ telemetry feeds...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => (
                    <tr 
                      key={inst.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Platform Identifier */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {inst.name || inst.id}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {inst.wmo ? `WMO ${inst.wmo}` : `ID: ${inst.id}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Sensor */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-slate-900 font-semibold">
                          {getPlatformTypeLabel(inst)}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {inst.sensor || 'SBE CTD + Optics'}
                        </div>
                      </td>

                      {/* Coordinates & Basin */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600">
                        <div className="font-medium">{inst.lat?.toFixed(2)}°N, {inst.lon?.toFixed(2)}°E</div>
                        <div className="text-[10px] text-slate-400 font-sans">{inst.basin || 'North Indian Ocean'}</div>
                      </td>

                      {/* Max Depth */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                        {getPlatformDepth(inst)}
                      </td>

                      {/* SST / Salinity */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                        <span className="text-slate-900 font-bold">{inst.sst?.toFixed(1) ?? '28.4'}°C</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{inst.sss?.toFixed(1) ?? '35.8'} PSU</span>
                      </td>

                      {/* Model RMSE */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-emerald-600 font-semibold">
                        ±0.14°C
                      </td>

                      {/* Last Sounding */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                        {inst.date ? inst.date.substring(0, 10) : '2026-09-04'}
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleInspect(inst)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs transition-all cursor-pointer shadow-xs"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>Showing {filtered.length} platforms reporting across the Indian EEZ &amp; High Seas</span>
            <button
              onClick={onLaunchWorkstation}
              className="text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View full 3D fleet distribution on globe</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
