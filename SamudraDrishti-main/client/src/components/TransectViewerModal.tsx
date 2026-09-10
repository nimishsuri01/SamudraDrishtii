import React, { useState, useEffect } from 'react';
import { X, Layers, Compass, ArrowRight, RefreshCw } from 'lucide-react';
import { TransectData } from '../types/ocean';
import { fetchTransect } from '../services/api';
import { interpolateColor } from '../utils/colormaps';

interface TransectViewerModalProps {
  transectData: TransectData | null;
  onUpdateTransect: (data: TransectData) => void;
  currentTimeIdx: number;
  onClose: () => void;
}

export const TransectViewerModal: React.FC<TransectViewerModalProps> = ({
  transectData,
  onUpdateTransect,
  currentTimeIdx,
  onClose
}) => {
  const PRESETS = [
    { name: 'Chennai → Port Blair (Bay of Bengal)', lat1: 13.08, lon1: 80.27, lat2: 11.62, lon2: 92.72 },
    { name: 'Mumbai → Central Arabian Basin', lat1: 18.92, lon1: 72.83, lat2: 14.50, lon2: 63.00 },
    { name: 'Kochi → Lakshadweep Kavaratti', lat1: 9.93, lon1: 76.26, lat2: 10.56, lon2: 72.64 },
    { name: 'Equatorial Indian Ocean Section', lat1: 2.0, lon1: 65.0, lat2: 2.0, lon2: 95.0 },
  ];

  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [variable, setVariable] = useState<string>('thetao');
  const [lat1, setLat1] = useState<number>(13.08);
  const [lon1, setLon1] = useState<number>(80.27);
  const [lat2, setLat2] = useState<number>(11.62);
  const [lon2, setLon2] = useState<number>(92.72);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setLat1(p.lat1);
    setLon1(p.lon1);
    setLat2(p.lat2);
    setLon2(p.lon2);
  };

  const loadTransect = async () => {
    setLoading(true);
    try {
      const data = await fetchTransect(lat1, lon1, lat2, lon2, variable, currentTimeIdx);
      onUpdateTransect(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!transectData) {
      loadTransect();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                3D Ocean Vertical Transect Curtain
              </h2>
              <p className="text-xs text-slate-600">
                Cross-sectional water column view revealing thermoclines, upwelling domes & freshwater lenses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-semibold mr-1">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(idx)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-xs ${
                  selectedPreset === idx
                    ? 'bg-[#005a9c] text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                }`}
              >
                {p.name.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Variable Selector */}
          <div className="flex items-center gap-2">
            <select
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-medium focus:outline-none shadow-2xs"
            >
              <option value="thetao">Potential Temperature (°C)</option>
              <option value="so">Practical Salinity (PSU)</option>
              <option value="chl">Chlorophyll-a (mg/m³)</option>
              <option value="wo">Vertical Velocity (10⁻⁴ m/s)</option>
            </select>

            <button
              onClick={loadTransect}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#005a9c]' : 'text-slate-500'}`} />
              Generate Transect
            </button>
          </div>
        </div>

        {/* Transect Display Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {transectData && (
            <div className="rounded-xl p-4 bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-mono font-medium">
                  <span>Start: {transectData.start.lat}°N, {transectData.start.lon}°E</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>End: {transectData.end.lat}°N, {transectData.end.lon}°E</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  Total Distance: {transectData.total_distance_km} km
                </span>
              </div>

              {/* 2D Vertical Cross-Section Curtain Plot */}
              <div className="relative w-full h-80 bg-slate-950 rounded-lg overflow-hidden border border-slate-300 p-2">
                <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-800 z-10 bg-white/95 px-2 py-0.5 rounded border border-slate-200 shadow-xs font-semibold">
                  Surface (0m)
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-800 z-10 bg-white/95 px-2 py-0.5 rounded border border-slate-200 shadow-xs font-semibold">
                  Abyssal Floor (2000m)
                </div>

                <div className="w-full h-full flex flex-col">
                  {transectData.curtain.map((row, dIdx) => (
                    <div key={dIdx} className="flex-1 flex w-full">
                      {row.map((val, wIdx) => {
                        const depthVal = transectData.depths[dIdx];
                        const norm = variable === 'thetao'
                          ? (val ? (val - 2) / 28 : 0)
                          : variable === 'so'
                          ? (val ? (val - 28) / 9 : 0)
                          : (val ? Math.min(1, val / 2.5) : 0);
                        const pal = variable === 'thetao' ? 'thermal' : variable === 'so' ? 'haline' : 'algae';
                        const rgb = interpolateColor(norm, pal);
                        return (
                          <div
                            key={wIdx}
                            className="flex-1 h-full transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: val !== null ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '#020617'
                            }}
                            title={`Distance: ${transectData.distances[wIdx]} km | Depth: ${depthVal} m | Value: ${val}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Oceanographic Explanation Note */}
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-900 font-bold">Oceanographic Insight: </span>
                Notice the steep vertical thermal gradient in the upper 200m representing the permanent and seasonal thermocline. In the Bay of Bengal, the surface layer contains low salinity runoff water, creating a barrier layer that inhibits vertical mixing and retains heat.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#005a9c] hover:bg-[#00477d] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Apply to 3D Viewport
          </button>
        </div>
      </div>
    </div>
  );
};
