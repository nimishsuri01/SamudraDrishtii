import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Fish, 
  Flame, 
  LifeBuoy, 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Play 
} from 'lucide-react';
import { PfzZone, MhwAlert, SarDriftResult } from '../types/ocean';
import { fetchTchp, fetchPfz, fetchMhw, simulateSarDrift } from '../services/api';

interface OperationalAdvisoryPanelProps {
  currentTimeIdx: number;
  onClose: () => void;
}

export const OperationalAdvisoryPanel: React.FC<OperationalAdvisoryPanelProps> = ({
  currentTimeIdx,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'tchp' | 'pfz' | 'mhw' | 'sar'>('tchp');
  const [tchpData, setTchpData] = useState<any>(null);
  const [pfzList, setPfzList] = useState<PfzZone[]>([]);
  const [mhwList, setMhwList] = useState<MhwAlert[]>([]);
  const [sarLat, setSarLat] = useState<number>(15.2);
  const [sarLon, setSarLon] = useState<number>(70.4);
  const [sarHours, setSarHours] = useState<number>(48);
  const [sarResult, setSarResult] = useState<SarDriftResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTchp(currentTimeIdx),
      fetchPfz(currentTimeIdx),
      fetchMhw()
    ])
      .then(([tchp, pfz, mhw]) => {
        setTchpData(tchp);
        setPfzList(pfz);
        setMhwList(mhw);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentTimeIdx]);

  const handleRunSar = async () => {
    try {
      const res = await simulateSarDrift(sarLat, sarLon, sarHours);
      setSarResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                INCOIS Operational Ocean Advisories &amp; Hazard Decision Suite
              </h2>
              <p className="text-xs text-slate-600">
                Disaster management, fishery advisories, coral reef monitoring &amp; search and rescue (SAR)
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tchp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'tchp'
                ? 'bg-white text-rose-700 border border-slate-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            Cyclone Heat (TCHP &amp; D26)
          </button>
          <button
            onClick={() => setActiveTab('pfz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'pfz'
                ? 'bg-white text-emerald-700 border border-slate-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-emerald-600" />
            Potential Fishing Zones (PFZ)
          </button>
          <button
            onClick={() => setActiveTab('mhw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'mhw'
                ? 'bg-white text-amber-700 border border-slate-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Marine Heatwaves (MHW)
          </button>
          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sar'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#005a9c]" />
            Search &amp; Rescue (SAR) Drift
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'tchp' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-semibold">Peak TCHP Heat Content</div>
                  <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">
                    {tchpData?.max_tchp || 112.4} kJ/cm²
                  </div>
                  <div className="text-[10px] text-rose-700 mt-1 font-bold">
                    Category: High Cyclone Fuel
                  </div>
                </div>

                <div className="rounded-xl p-3 border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-semibold">Rapid Intensification Threshold</div>
                  <div className="text-xl font-bold text-amber-700 font-mono mt-0.5">
                    80.0 kJ/cm²
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">
                    INCOIS Cyclone Warning Mandate
                  </div>
                </div>

                <div className="rounded-xl p-3 border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-semibold">26°C Isotherm Depth (D26)</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                    65 - 110 m
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">
                    Deeper in Bay of Bengal
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  Operational Cyclone Heat Advisory
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tropical Cyclone Heat Potential (TCHP) is a measure of the integrated thermal energy stored in the ocean from the sea surface down to the depth of the 26°C isotherm ($D_{26}$). Areas where TCHP exceeds 80 kJ/cm² provide immense thermal reserves that prevent negative cyclone self-cooling, enabling rapid intensification of tropical cyclones into Very Severe or Super Cyclonic Storms in the Bay of Bengal.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pfz' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-slate-700 font-medium mb-1">
                Active Potential Fishing Zones identified from thermal fronts and chlorophyll convergence:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pfzList.map((z) => (
                  <div key={z.zone_id} className="rounded-xl p-3.5 border border-slate-200 bg-slate-50 flex flex-col gap-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">{z.sector}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold">
                        {z.confidence} Confidence
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <div><span className="text-slate-500 font-medium">Target Species:</span> {z.target_species}</div>
                      <div><span className="text-slate-500 font-medium">SST Front:</span> {z.sst_gradient}</div>
                      <div><span className="text-slate-500 font-medium">Chlorophyll:</span> {z.chlorophyll_mg_m3} mg/m³</div>
                      <div><span className="text-slate-500 font-medium">Depth Range:</span> {z.depth_range}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mhw' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-slate-700 font-medium mb-1">
                Marine Heatwave thermal anomalies threatening coral ecosystems and coastal fisheries:
              </div>
              <div className="flex flex-col gap-3">
                {mhwList.map((m) => (
                  <div key={m.region} className="rounded-xl p-4 border border-slate-200 bg-slate-50 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-amber-900">{m.region}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{m.category} | {m.sst_anomaly_c}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Duration: {m.duration_days} consecutive days</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
                        {m.coral_bleaching_alert}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sar' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-[#005a9c]" />
                  Maritime Search &amp; Rescue (SAR) Drift Trajectory Simulator
                </h3>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Distress Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={sarLat}
                      onChange={(e) => setSarLat(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 font-mono shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Distress Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={sarLon}
                      onChange={(e) => setSarLon(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 font-mono shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Simulation Window</label>
                    <select
                      value={sarHours}
                      onChange={(e) => setSarHours(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 shadow-2xs font-medium"
                    >
                      <option value={12}>12 Hours Forecast</option>
                      <option value={24}>24 Hours Forecast</option>
                      <option value={48}>48 Hours Forecast</option>
                      <option value={72}>72 Hours Forecast</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRunSar}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#005a9c] hover:bg-[#00477d] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  Simulate Surface Current Advection &amp; Leeway
                </button>
              </div>

              {sarResult && (
                <div className="rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Projected Search Datum</span>
                    <span className="text-xs text-amber-700 font-mono font-bold">
                      Radius: ±{sarResult.final_datum.radius_nm} NM
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mb-2">
                    Predicted Object Location at T+{sarResult.duration_hours}h: <span className="font-mono font-bold text-slate-900">{sarResult.final_datum.lat}°N, {sarResult.final_datum.lon}°E</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Recommended Search Pattern: <span className="text-slate-900 font-semibold">{sarResult.recommended_search_pattern}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
