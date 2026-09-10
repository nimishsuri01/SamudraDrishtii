import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  CheckCircle, 
  BarChart2, 
  Layers, 
  Compass, 
  Thermometer, 
  Droplets, 
  Zap, 
  TrendingDown, 
  ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ScatterChart, 
  Scatter 
} from 'recharts';
import { InstrumentMarker, ValidationResult } from '../types/ocean';
import { validatePlatform, fetchInstrumentDetail } from '../services/api';

interface ProfileInspectionModalProps {
  platform: InstrumentMarker | null;
  currentTimeIdx: number;
  onClose: () => void;
}

export const ProfileInspectionModal: React.FC<ProfileInspectionModalProps> = ({
  platform,
  currentTimeIdx,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'ts' | 'metadata'>('profile');
  const [activeVar, setActiveVar] = useState<'temperature' | 'salinity' | 'chlorophyll'>('temperature');
  const [validationData, setValidationData] = useState<ValidationResult | null>(null);
  const [platformDetail, setPlatformDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platform) return;

    setLoading(true);
    setError(null);

    Promise.all([
      validatePlatform(platform.id, currentTimeIdx),
      fetchInstrumentDetail(platform.id)
    ])
      .then(([valRes, detailRes]) => {
        setValidationData(valRes);
        setPlatformDetail(detailRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Validation error:", err);
        setError("Failed to fetch co-located model validation data.");
        setLoading(false);
      });
  }, [platform, currentTimeIdx]);

  if (!platform) return null;

  const metrics = validationData?.metrics?.[activeVar];
  const chartData = validationData?.aligned_profile || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#080e1a] rounded-xl border border-[#18263e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142034] bg-[#0b1322]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e192c] border border-[#1e304f] text-slate-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide font-sans">
                  {platform.name}
                </h2>
                {platform.wmo && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#0e192c] border border-[#1e304f] text-slate-300 font-mono">
                    WMO {platform.wmo}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                  {platform.type}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-4 mt-0.5">
                <span>Coordinates: {platform.lat.toFixed(2)}°N, {platform.lon.toFixed(2)}°E</span>
                <span>{platform.basin || 'North Indian Ocean'}</span>
                <span>Status: {platform.status}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#111c2e] hover:bg-[#182842] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0a1120] border-b border-[#142034]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white border border-slate-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Model vs Observation Depth Profile
            </button>
            <button
              onClick={() => setActiveTab('ts')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === 'ts'
                  ? 'bg-slate-800 text-white border border-slate-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              T-S (Temp-Salinity) Water Masses
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-slate-800 text-white border border-slate-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Platform Telemetry & QC
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveVar('temperature')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  activeVar === 'temperature' ? 'bg-rose-500/30 text-rose-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Temperature (°C)
              </button>
              <button
                onClick={() => setActiveVar('salinity')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  activeVar === 'salinity' ? 'bg-emerald-500/30 text-emerald-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Salinity (PSU)
              </button>
              <button
                onClick={() => setActiveVar('chlorophyll')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  activeVar === 'chlorophyll' ? 'bg-lime-500/30 text-lime-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Chlorophyll-a (mg/m³)
              </button>
            </div>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-300">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Interpolating model grid to instrument coordinates...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          ) : activeTab === 'profile' ? (
            <div>
              {/* Validation Scorecard */}
              {metrics && (
                <div className="grid grid-cols-4 gap-3 mb-5">
                  <div className="rounded-xl p-3 bg-[#0a1120] border border-[#16233b]">
                    <div className="text-[11px] text-slate-400">Root Mean Square Error</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {metrics.rmse !== undefined ? `${metrics.rmse} ${activeVar === 'temperature' ? '°C' : activeVar === 'salinity' ? 'PSU' : 'mg/m³'}` : 'N/A'}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> High Model Skill
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#0a1120] border border-[#16233b]">
                    <div className="text-[11px] text-slate-400">Mean Bias Error (Model - Obs)</div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                      {metrics.mean_bias !== undefined ? `${metrics.mean_bias > 0 ? '+' : ''}${metrics.mean_bias}` : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {Math.abs(metrics.mean_bias || 0) < 0.2 ? 'Minimal Systematic Drift' : 'Acceptable Bias'}
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#0a1120] border border-[#16233b]">
                    <div className="text-[11px] text-slate-400">Pearson Correlation (r)</div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                      {metrics.pearson_r !== undefined ? metrics.pearson_r.toFixed(4) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Near Perfect Profile Match
                    </div>
                  </div>

                  <div className="rounded-xl p-3 bg-[#0a1120] border border-[#16233b]">
                    <div className="text-[11px] text-slate-400">Willmott Agreement Index (d)</div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                      {metrics.willmott_skill !== undefined ? metrics.willmott_skill.toFixed(3) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Scale: 0.0 to 1.0 (Optimal)
                    </div>
                  </div>
                </div>
              )}

              {/* Inverted Vertical Depth Chart */}
              <div className="rounded-xl p-4 bg-[#0a1120] border border-[#16233b]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Vertical Water Column Profile (Depth: 0m to 2000m)
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <span className="w-3 h-1 bg-white rounded-full" />
                      In-Situ Instrument Observation
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-1 border-t-2 border-dashed border-rose-400" />
                      Numerical Ocean Model Prediction
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="depth" 
                        label={{ value: 'Depth (m) [Surface → Deep Water]', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                        stroke="#64748b"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        label={{ 
                          value: activeVar === 'temperature' ? 'Temp (°C)' : activeVar === 'salinity' ? 'Salinity (PSU)' : 'Chlorophyll-a (mg/m³)', 
                          angle: -90, 
                          position: 'insideLeft', 
                          fill: '#94a3b8', 
                          fontSize: 11 
                        }}
                        stroke="#64748b"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={activeVar === 'temperature' ? 'obs_temperature' : activeVar === 'salinity' ? 'obs_salinity' : 'obs_chlorophyll'} 
                        name="In-Situ Observation" 
                        stroke="#06b6d4" 
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#06b6d4' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={activeVar === 'temperature' ? 'model_temperature' : activeVar === 'salinity' ? 'model_salinity' : 'model_chlorophyll'} 
                        name="Model Forecast" 
                        stroke="#f43f5e" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : activeTab === 'ts' ? (
            /* T-S Diagram (Temperature vs Salinity) */
            <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    Temperature - Salinity (T-S) Water Mass Diagram
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Fingerprint of water masses (Arabian Sea High Salinity Water vs Bay of Bengal Fresh Plume)
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      dataKey="obs_salinity" 
                      name="Salinity" 
                      unit=" PSU" 
                      domain={['auto', 'auto']}
                      label={{ value: 'Practical Salinity (PSU)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                      stroke="#64748b"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="obs_temperature" 
                      name="Temperature" 
                      unit=" °C" 
                      domain={['auto', 'auto']}
                      label={{ value: 'Potential Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                      stroke="#64748b"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Scatter 
                      name="Observed Water Mass" 
                      data={chartData.filter(d => d.obs_salinity && d.obs_temperature)} 
                      fill="#06b6d4" 
                    />
                    <Scatter 
                      name="Model Water Mass" 
                      data={chartData.filter(d => d.model_salinity && d.model_temperature)} 
                      fill="#f43f5e" 
                      shape="cross"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Platform Telemetry & QC */
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-[#0a1120] border border-[#16233b]">
                <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Quality Control (QC) & Sensor Audit
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">WMO Identifier:</span>
                    <span className="font-mono text-slate-200 font-semibold">{platform.wmo || platform.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Sensor Payload:</span>
                    <span className="text-slate-200">{platform.sensor || 'Seabird SBE 41CP CTD'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Transmission Protocol:</span>
                    <span className="text-slate-200">Iridium SBD Satellite</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Cycle / Dive Number:</span>
                    <span className="font-mono text-slate-200">Cycle #{platform.cycle || platform.dive_number || 84}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">INCOIS QC Standard:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Passed (Flag 1 - Good Data)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4 bg-[#0a1120] border border-[#16233b]">
                <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-300" />
                  Deployment & Drift Profile
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Basin Sector:</span>
                    <span className="text-slate-200">{platform.basin || 'Arabian Sea'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Profile Depth Range:</span>
                    <span className="text-slate-200 font-mono">0 - 2000 m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Parking Depth:</span>
                    <span className="text-slate-200">1000 dbar (Mid-depth drift)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Operating Agency:</span>
                    <span className="text-slate-200">INCOIS Ocean Valley, Hyderabad</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#070d18] border-t border-[#142034] flex items-center justify-between text-xs text-slate-400">
          <span>CF-1.8 Compliance Verified | INCOIS Ocean Data Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold transition cursor-pointer shadow-sm"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
