'use client';

import React from 'react';
import { 
  Globe2, 
  Layers, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  Database,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface CapabilitiesSectionProps {
  onOpenTransect: () => void;
  onOpenAdvisories: () => void;
  onOpenIngestion: () => void;
  onLaunchWorkstation: () => void;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({
  onOpenTransect,
  onOpenAdvisories,
  onOpenIngestion,
  onLaunchWorkstation
}) => {
  return (
    <section id="features" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 scroll-mt-20">
      <div id="capabilities" className="sr-only" />
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-600 text-xs font-semibold shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>OPERATIONAL ARCHITECTURE &amp; CAPABILITIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight font-sans">
            Scientific Capabilities &amp;<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400">
              Decision Systems
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Bridging the operational barrier between numerical hydrodynamic circulation models and autonomous physical instruments through a unified 3D/4D digital twin framework.
          </p>
        </div>

        {/* 4 Major Capabilities in Modern Glassmorphism Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Capability 1: Dual-Engine 3D/4D Hydrodynamics */}
          <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Globe2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  CF-1.8 / WGS84
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                Dual-Engine 3D/4D Hydrodynamics
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Combines a true WGS84 ellipsoidal globe for macro-scale maritime domain awareness with an accelerated volumetric water column slicer. Slices potential temperature, salinity, currents, and chlorophyll from surface down to 2000m abyss.
              </p>

              {/* Technical Specifications Table */}
              <div className="bg-white/90 rounded-2xl border border-blue-100/60 p-4 mb-6 shadow-xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Vertical Discretization</span>
                    <span className="font-bold text-slate-900">13 Depth Levels (0–2000 m)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Vertical Exaggeration</span>
                    <span className="font-bold text-slate-900">1× to 35× Continuous</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Advection Particles</span>
                    <span className="font-bold text-slate-900">3D Current Streamlines (u, v)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Maritime Geodesy</span>
                    <span className="font-bold text-slate-900">2.37M km² Indian EEZ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-100/70 flex items-center justify-between">
              <button
                onClick={onLaunchWorkstation}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Launch 3D Viewport</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenIngestion}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Inspect NetCDF Grid
              </button>
            </div>
          </div>

          {/* Capability 2: Autonomous Fleet Co-Visualization & Validation */}
          <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                  14 Platforms Live
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                Fleet Co-Visualization &amp; Validation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Simultaneously renders physical in-situ platforms alongside numerical simulation fields. Computes automated point-to-point co-located statistical scorecards to verify forecast fidelity against physical observations.
              </p>

              {/* Technical Specifications Table */}
              <div className="bg-white/90 rounded-2xl border border-blue-100/60 p-4 mb-6 shadow-xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Statistical Metrics</span>
                    <span className="font-bold text-slate-900">RMSE, Bias, Pearson r, Willmott d</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Active Sensors</span>
                    <span className="font-bold text-slate-900">CTD, Bio-Argo Fluorometers</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Fleet Registry</span>
                    <span className="font-bold text-slate-900">8 Argo, 2 Gliders, 4 Buoys</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Quality Control</span>
                    <span className="font-bold text-slate-900">WMO QC Flag 1 (Verified)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-100/70 flex items-center justify-between">
              <a
                href="#impact"
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Inspect Fleet Registry</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Real-Time Telemetry
              </span>
            </div>
          </div>

          {/* Capability 3: Operational Marine Hazard Advisories */}
          <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                  3 Advisory Feeds
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                Marine Hazards &amp; Fisheries Advisories
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Automated spatial decision models monitoring thermal energy thresholds, coastal upwelling boundaries, and marine heatwave anomalies across sensitive pelagic and coral ecosystems.
              </p>

              {/* Technical Specifications Table */}
              <div className="bg-white/90 rounded-2xl border border-blue-100/60 p-4 mb-6 shadow-xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Tropical Cyclone Heat (TCHP)</span>
                    <span className="font-bold text-slate-900">&gt;80 kJ/cm² Rapid Intensification</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Potential Fishing Zones (PFZ)</span>
                    <span className="font-bold text-slate-900">Thermal Front Gradient (∇T)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Marine Heatwaves (MHW)</span>
                    <span className="font-bold text-slate-900">ΔT ≥ 1.5°C Thermal Stress</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Advisory Output</span>
                    <span className="font-bold text-slate-900">GeoJSON Hazard Boundaries</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-100/70 flex items-center justify-between">
              <button
                onClick={onOpenAdvisories}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Open Hazard Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-amber-700">
                Active Thresholds
              </span>
            </div>
          </div>

          {/* Capability 4: Sub-Surface Transect Curtains & SAR Drift */}
          <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                  Acoustics &amp; SAR
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                Vertical Transects &amp; Leeway Drift
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Generates arbitrary great-circle vertical transects across strategic maritime channels (e.g. Chennai–Port Blair) to map thermoclines and acoustic SOFAR channels, coupled with 48-hour stochastic leeway drift advection.
              </p>

              {/* Technical Specifications Table */}
              <div className="bg-white/90 rounded-2xl border border-blue-100/60 p-4 mb-6 shadow-xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Transect Projection</span>
                    <span className="font-bold text-slate-900">Great-Circle Geodetic Curtain</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Acoustic SOFAR Channel</span>
                    <span className="font-bold text-slate-900">Mackenzie Sound Profile</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Drift Advection</span>
                    <span className="font-bold text-slate-900">4th-Order Runge-Kutta</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Emergency Search</span>
                    <span className="font-bold text-slate-900">SOLAS Leeway Radius</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-100/70 flex items-center justify-between">
              <button
                onClick={onOpenTransect}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Generate Vertical Transect</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-500">
                0–2000m Depth
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
