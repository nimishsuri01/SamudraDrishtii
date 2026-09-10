'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Radio 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ScatterChart, 
  Scatter 
} from 'recharts';
import { InstrumentMarker, ValidationResult } from '../types/ocean';
import { validatePlatform } from '../services/api';

interface PlatformDrawerProps {
  platform: InstrumentMarker | null;
  currentTimeIdx: number;
  onClose: () => void;
}

export const PlatformDrawer: React.FC<PlatformDrawerProps> = ({
  platform,
  currentTimeIdx,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'metrics' | 'ts' | 'qc'>('profile');
  const [activeVar, setActiveVar] = useState<'temperature' | 'salinity' | 'chlorophyll'>('temperature');
  const [validationData, setValidationData] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!platform) return;
    setLoading(true);
    validatePlatform(platform.id, currentTimeIdx)
      .then((res) => {
        setValidationData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [platform, currentTimeIdx]);

  if (!platform) return null;

  const metrics = validationData?.metrics?.[activeVar];
  const chartData = validationData?.aligned_profile || [];

  return (
    <aside className="absolute right-0 top-9 bottom-8.5 w-92 bg-white border-l border-slate-300 flex flex-col z-30 shadow-xl text-xs text-slate-800 select-none">
      {/* Drawer Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-300 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[2px] bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs truncate max-w-[190px]">
                {platform.name}
              </span>
              {platform.wmo && (
                <span className="text-[10px] font-mono px-1 rounded-[2px] bg-slate-100 border border-slate-300 text-slate-600 font-semibold">
                  {platform.wmo}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {platform.lat.toFixed(2)}°N, {platform.lon.toFixed(2)}°E • {platform.basin || 'N. Indian Ocean'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-[2px] hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="Close inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center border-b border-slate-300 bg-slate-100 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 text-center transition cursor-pointer border-b-2 ${
            activeTab === 'profile' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Depth Profile
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-1.5 text-center transition cursor-pointer border-b-2 ${
            activeTab === 'metrics' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Validation
        </button>
        <button
          onClick={() => setActiveTab('ts')}
          className={`flex-1 py-1.5 text-center transition cursor-pointer border-b-2 ${
            activeTab === 'ts' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          T-S Mass
        </button>
        <button
          onClick={() => setActiveTab('qc')}
          className={`flex-1 py-1.5 text-center transition cursor-pointer border-b-2 ${
            activeTab === 'qc' 
              ? 'border-slate-800 text-slate-950 bg-white' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          QC Metadata
        </button>
      </div>

      {/* Parameter Toggle for Profile Plot */}
      {activeTab === 'profile' && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-300 bg-slate-50">
          <span className="text-[11px] text-slate-600 font-mono font-semibold">Variable:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-[2px] border border-slate-300 shadow-2xs">
            <button
              onClick={() => setActiveVar('temperature')}
              className={`px-2 py-0.5 rounded-[2px] text-xs transition cursor-pointer ${
                activeVar === 'temperature' ? 'bg-[#005a9c] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveVar('salinity')}
              className={`px-2 py-0.5 rounded-[2px] text-xs transition cursor-pointer ${
                activeVar === 'salinity' ? 'bg-[#005a9c] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sal (PSU)
            </button>
            <button
              onClick={() => setActiveVar('chlorophyll')}
              className={`px-2 py-0.5 rounded-[2px] text-xs transition cursor-pointer ${
                activeVar === 'chlorophyll' ? 'bg-[#005a9c] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chl-a
            </button>
          </div>
        </div>
      )}

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {loading ? (
          <div className="h-48 flex items-center justify-center gap-2 text-slate-500">
            <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Interpolating model grid to platform...</span>
          </div>
        ) : activeTab === 'profile' ? (
          <div className="flex flex-col gap-3">
            {/* Flat Statistics Strip */}
            {metrics && (
              <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-[2px] border border-slate-200 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500">RMSE</div>
                  <div className="text-xs font-bold text-slate-900 tabular-nums">{metrics.rmse}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Mean Bias</div>
                  <div className="text-xs font-bold text-slate-900 tabular-nums">
                    {metrics.mean_bias ? (metrics.mean_bias > 0 ? `+${metrics.mean_bias}` : metrics.mean_bias) : '0.0'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Pearson r</div>
                  <div className="text-xs font-bold text-slate-900 tabular-nums">{metrics.pearson_r}</div>
                </div>
              </div>
            )}

            {/* Depth Profile Chart */}
            <div className="bg-white p-2 rounded-[2px] border border-slate-300 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] mb-2 px-1">
                <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <span className="w-2.5 h-0.5 bg-[#005a9c] rounded-full" />
                  In-Situ Profile
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-rose-600" />
                  Model Forecast
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="depth" 
                      label={{ value: 'Depth (m)', position: 'insideBottom', offset: -8, fill: '#64748b', fontSize: 10 }}
                      stroke="#94a3b8"
                      tick={{ fontSize: 9, fill: '#64748b' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fontSize: 9, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '2px', color: '#0f172a' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={activeVar === 'temperature' ? 'obs_temperature' : activeVar === 'salinity' ? 'obs_salinity' : 'obs_chlorophyll'} 
                      name="In-Situ Obs" 
                      stroke="#005a9c" 
                      strokeWidth={1.8}
                      dot={{ r: 1.8, fill: '#005a9c' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={activeVar === 'temperature' ? 'model_temperature' : activeVar === 'salinity' ? 'model_salinity' : 'model_chlorophyll'} 
                      name="Model Grid" 
                      stroke="#e11d48" 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : activeTab === 'metrics' ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-900 mb-1">
              Colocated Verification Metrics
            </div>
            {metrics ? (
              <div className="flex flex-col divide-y divide-slate-200 text-xs font-mono border border-slate-300 rounded-[2px] bg-white">
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Aligned Depth Layers:</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.n_samples}</span>
                </div>
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Root Mean Square Error:</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.rmse}</span>
                </div>
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Mean Bias Error (MBE):</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.mean_bias}</span>
                </div>
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Mean Absolute Error (MAE):</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.mae}</span>
                </div>
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Pearson Correlation (r):</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.pearson_r}</span>
                </div>
                <div className="flex justify-between py-2 px-2.5">
                  <span className="text-slate-600 font-sans">Willmott Agreement Index (d):</span>
                  <span className="text-slate-900 font-bold tabular-nums">{metrics.willmott_skill}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 text-slate-500">No validation data available for this variable.</div>
            )}
          </div>
        ) : activeTab === 'ts' ? (
          <div className="bg-white p-2 rounded-[2px] border border-slate-300 shadow-2xs">
            <div className="text-[11px] text-slate-700 mb-2 font-mono font-bold">
              Temperature - Salinity (T-S) Water Mass
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: -15, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="obs_salinity" name="Salinity" unit=" PSU" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis type="number" dataKey="obs_temperature" name="Temp" unit=" °C" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '2px', color: '#0f172a' }} />
                  <Scatter name="Observed" data={chartData.filter(d => d.obs_salinity && d.obs_temperature)} fill="#005a9c" />
                  <Scatter name="Model" data={chartData.filter(d => d.model_salinity && d.model_temperature)} fill="#e11d48" shape="cross" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200 text-xs border border-slate-300 rounded-[2px] bg-white">
            <div className="flex justify-between py-2 px-2.5">
              <span className="text-slate-600 font-medium">Sensor Payload:</span>
              <span className="text-slate-900 font-semibold">{platform.sensor || 'SBE 41CP CTD'}</span>
            </div>
            <div className="flex justify-between py-2 px-2.5">
              <span className="text-slate-600 font-medium">Telemetry Link:</span>
              <span className="text-slate-900 font-semibold">Iridium Short Burst Data (SBD)</span>
            </div>
            <div className="flex justify-between py-2 px-2.5">
              <span className="text-slate-600 font-medium">QC Flag:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Flag 1: Good Passed
              </span>
            </div>
            <div className="flex justify-between py-2 px-2.5">
              <span className="text-slate-600 font-medium">DAC Center:</span>
              <span className="text-slate-900 font-semibold">INCOIS Ocean Valley</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
