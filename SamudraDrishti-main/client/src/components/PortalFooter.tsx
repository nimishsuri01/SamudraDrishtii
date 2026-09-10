'use client';

import React from 'react';
import { 
  Globe2, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Compass, 
  Radio, 
  FileText 
} from 'lucide-react';

interface PortalFooterProps {
  onOpenBrand: () => void;
  onOpenAdvisories: () => void;
  onOpenIngestion: () => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  onOpenBrand,
  onOpenAdvisories,
  onOpenIngestion
}) => {
  return (
    <footer className="w-full bg-[#09162a] border-t border-slate-800 text-xs text-slate-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Top Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-10 mb-10 border-b border-slate-800 gap-6">
          <div className="flex items-center gap-3">
            <div 
              onClick={onOpenBrand}
              className="w-10 h-10 flex items-center justify-center cursor-pointer transition hover:scale-105 flex-shrink-0"
              title="Inspect INCOIS SamudraDrishti Brand & Identity"
            >
              <img 
                src="/logo-mark.svg" 
                alt="SamudraDrishti Crest" 
                className="w-full h-full object-contain filter drop-shadow-md" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-blue-400 tracking-tight font-sans">
                  Samudra
                </span>
                <span className="text-lg font-black text-white tracking-tight font-sans">
                  Drishti
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-200 font-semibold uppercase tracking-wider ml-1">
                  Operational
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                National Oceanographic Digital Twin &amp; In-Situ Observation Platform • Decision Support Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Interactive OpenAPI /docs</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>

            <button
              onClick={onOpenBrand}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              Institutional Identity
            </button>
          </div>
        </div>

        {/* 4-Column Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* Col 1 */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span>3D Digital Twin</span>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#web3d" className="hover:text-white transition">Cesium.js WGS84 3D Globe</a></li>
              <li><a href="#web3d" className="hover:text-white transition">Three.js 4D Water Column</a></li>
              <li><a href="#web3d" className="hover:text-white transition">Vertical Exaggeration (1x–35x)</a></li>
              <li><a href="#web3d" className="hover:text-white transition">Current Vector Streamlines</a></li>
              <li><a href="#web3d" className="hover:text-white transition">Indian EEZ 200 NM Boundaries</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Observational Fleet</span>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#fleet" className="hover:text-white transition">Argo Profiling Floats (0–2000m)</a></li>
              <li><a href="#fleet" className="hover:text-white transition">Autonomous Ocean Gliders</a></li>
              <li><a href="#fleet" className="hover:text-white transition">Deep-Ocean OMNI Moored Buoys</a></li>
              <li><a href="#fleet" className="hover:text-white transition">Statistical Inversion (RMSE, r, d)</a></li>
              <li><a href="#fleet" className="hover:text-white transition">T-S Water Mass Diagrams</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Marine Advisories</span>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={onOpenAdvisories} className="hover:text-white transition text-left cursor-pointer">Potential Fishing Zones (PFZ)</button></li>
              <li><button onClick={onOpenAdvisories} className="hover:text-white transition text-left cursor-pointer">Marine Heatwave Alerts (MHW)</button></li>
              <li><button onClick={onOpenAdvisories} className="hover:text-white transition text-left cursor-pointer">Cyclone Heat Potential (TCHP)</button></li>
              <li><button onClick={onOpenAdvisories} className="hover:text-white transition text-left cursor-pointer">SAR Leeway Drift Trajectories</button></li>
              <li><button onClick={onOpenAdvisories} className="hover:text-white transition text-left cursor-pointer">Coastal Ocean Upwelling Cells</button></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-300" />
              <span>Standards &amp; Docs</span>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={onOpenIngestion} className="hover:text-white transition text-left cursor-pointer">CF-1.8 NetCDF Ingestion</button></li>
              <li><a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">FastAPI REST / OpenAPI Engine</a></li>
              <li><span className="text-slate-400">WGS84 Ellipsoidal Datum</span></li>
              <li><span className="text-slate-400">Cesium Native 3D Engine</span></li>
              <li><button onClick={onOpenBrand} className="hover:text-white transition text-left cursor-pointer">Design &amp; Asset Packages</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimers Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} SamudraDrishti Oceanographic Intelligence Platform. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenBrand} className="hover:text-slate-200 transition cursor-pointer">
              National Brand Asset Kit
            </button>
            <span>•</span>
            <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition">
              OpenAPI Swagger UI
            </a>
            <span>•</span>
            <span className="font-mono text-[10px] text-slate-400">
              NATIONAL OCEANOGRAPHIC DECISION SUPPORT SYSTEM • BUILD 2026.09
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
