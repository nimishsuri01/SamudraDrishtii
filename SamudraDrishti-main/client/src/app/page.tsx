'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PortalNavbar } from '../components/PortalNavbar';
import { HeroSection } from '../components/HeroSection';
import { CapabilitiesSection } from '../components/CapabilitiesSection';
import { FleetTelemetrySection } from '../components/FleetTelemetrySection';
import { PortalFooter } from '../components/PortalFooter';

import { TopCommandBar } from '../components/TopCommandBar';
import { DockedSidebar } from '../components/DockedSidebar';
import { DockedTimeline } from '../components/DockedTimeline';
import { ColorbarDock } from '../components/ColorbarDock';
import { PlatformDrawer } from '../components/PlatformDrawer';
import { TransectViewerModal } from '../components/TransectViewerModal';
import { OperationalAdvisoryPanel } from '../components/OperationalAdvisoryPanel';
import { DataIngestionModal } from '../components/DataIngestionModal';
import { ScienceOutreachModal } from '../components/ScienceOutreachModal';
import { BrandModal } from '../components/BrandModal';
import { EngineMode, DualViewportHandle } from '../components/DualViewport';

import { 
  Globe2, 
  Layers, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Activity, 
  Radio, 
  Database,
  ArrowRight,
  LifeBuoy,
  Fish,
  ShieldAlert
} from 'lucide-react';

import { 
  ModelMetadata, 
  SliceData, 
  TransectData, 
  InstrumentMarker, 
  ViewportLayers 
} from '../types/ocean';
import { fetchMetadata, fetchSlice, fetchInstruments, fetchTransect } from '../services/api';

import { FALLBACK_INSTRUMENTS } from '../data/fallbackPlatforms';

// SSR-safe dynamic import of 3D Dual Engine Viewport
const DualViewport = dynamic(
  () => import('../components/DualViewport').then((m) => m.DualViewport),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center text-slate-600 gap-2 font-mono text-xs">
        <div className="w-5 h-5 border-2 border-[#005a9c] border-t-transparent rounded-full animate-spin" />
        <span>INITIALIZING WGS84 3D WEBGL ENGINE...</span>
      </div>
    )
  }
);

export default function OceanApp() {
  const viewportRef = useRef<DualViewportHandle>(null);

  const [engineMode, setEngineMode] = useState<EngineMode>('cesium');
  const [appMode, setAppMode] = useState<'forecaster' | 'outreach'>('forecaster');
  const [isFullscreenWorkstation, setIsFullscreenWorkstation] = useState<boolean>(false);

  // Backend state
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [sliceData, setSliceData] = useState<SliceData | null>(null);
  const [transectData, setTransectData] = useState<TransectData | null>(null);
  const [instruments, setInstruments] = useState<InstrumentMarker[]>(FALLBACK_INSTRUMENTS);

  // Selection state
  const [activeVariable, setActiveVariable] = useState<string>('thetao');
  const [depthIdx, setDepthIdx] = useState<number>(0);
  const [currentTimeIdx, setCurrentTimeIdx] = useState<number>(0);

  // Colormap & Visuals
  const [palette, setPalette] = useState<string>('thermal');
  const [valMin, setValMin] = useState<number>(2.0);
  const [valMax, setValMax] = useState<number>(31.0);
  const [opacity, setOpacity] = useState<number>(0.88);
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(12);

  // Hover coordinates HUD
  const [hoverInfo, setHoverInfo] = useState<{ lat: number; lon: number; depth: number; val: number | null } | null>(null);

  // Drawer & Modals
  const [selectedPlatform, setSelectedPlatform] = useState<InstrumentMarker | null>(null);
  const [isTransectOpen, setIsTransectOpen] = useState<boolean>(false);
  const [isAdvisoriesOpen, setIsAdvisoriesOpen] = useState<boolean>(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [isOutreachOpen, setIsOutreachOpen] = useState<boolean>(false);
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);

  // Layers
  const [layers, setLayers] = useState<ViewportLayers>({
    showModelSlice: true,
    showBathymetry: true,
    showEez: true,
    showVectorParticles: true,
    showArgo: true,
    showGliders: true,
    showBuoys: true,
    showTransectCurtain: false,
    showPfzFronts: false,
    showTchpLayer: false
  });

  // Initial load
  useEffect(() => {
    fetchMetadata()
      .then((meta) => {
        setMetadata(meta);
        if (meta.variables && meta.variables.length > 0) {
          const first = meta.variables[0];
          setActiveVariable(first.id);
          setPalette(first.palette);
          setValMin(first.min);
          setValMax(first.max);
        }
      })
      .catch((err) => console.error(err));

    fetchInstruments()
      .then((inst) => setInstruments(inst))
      .catch((err) => console.error(err));

    fetchTransect(13.08, 80.27, 11.62, 92.72, 'thetao', 0)
      .then((trans) => setTransectData(trans))
      .catch(() => {});
  }, []);

  // Slice updates
  useEffect(() => {
    fetchSlice(activeVariable, depthIdx, currentTimeIdx)
      .then((data) => {
        setSliceData(data);
        if (data && typeof data.min === 'number' && typeof data.max === 'number' && data.max > data.min) {
          const pad = (data.max - data.min) * 0.02;
          setValMin(Number((data.min - pad).toFixed(2)));
          setValMax(Number((data.max + pad).toFixed(2)));
        }
      })
      .catch((err) => console.error(err));
  }, [activeVariable, depthIdx, currentTimeIdx]);

  const handleSelectVariable = (varId: string) => {
    setActiveVariable(varId);
    if (!metadata) return;
    const vMeta = metadata.variables.find((v) => v.id === varId);
    if (vMeta) {
      setPalette(vMeta.palette);
      setValMin(vMeta.min);
      setValMax(vMeta.max);
    }
  };

  const handleResetRange = () => {
    if (sliceData) {
      setValMin(sliceData.min);
      setValMax(sliceData.max);
    }
  };

  const handleToggleLayer = (key: keyof ViewportLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCameraPreset = (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => {
    if (viewportRef.current) {
      viewportRef.current.setCameraPreset(preset);
    }
  };

  const handleOutreachNavigate = (chapter: any) => {
    handleSelectVariable(chapter.variable);
    setDepthIdx(chapter.depthIdx);
    setEngineMode('three');
    setTimeout(() => {
      handleCameraPreset(chapter.cameraPreset);
    }, 200);
  };

  const handleLaunchWorkstation = () => {
    const el = document.getElementById('web3d');
    if (el) {
      const navOffset = 84;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (appMode === 'outreach') {
      setIsOutreachOpen(true);
    }
  }, [appMode]);

  const currentUnits = metadata?.variables.find((v) => v.id === activeVariable)?.units || '';
  const currentDepths = metadata?.depths || [0, 10, 20, 50, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];
  const currentTimes = metadata?.times || ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];

  // Common Workstation Workspace
  const renderWorkstation = (isFullscreen: boolean) => (
    <div className={`flex flex-col w-full h-full overflow-hidden bg-white text-slate-800 select-none ${
      isFullscreen ? 'fixed inset-0 z-50' : 'relative'
    }`}>
      {/* 1. Flush Docked Top Command Bar */}
      <TopCommandBar
        engineMode={engineMode}
        onSelectEngine={(mode) => setEngineMode(mode)}
        appMode={appMode}
        onSelectAppMode={(m) => {
          setAppMode(m);
          if (m === 'outreach') setIsOutreachOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenTransect={() => setIsTransectOpen(true)}
        onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
        onOpenBrand={() => setIsBrandOpen(true)}
        onSelectCameraPreset={handleCameraPreset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreenWorkstation(!isFullscreen)}
      />

      {/* 2. Main Middle Workspace: Left Sidebar + Viewport + Right Inspector Drawer */}
      <div className="relative flex-1 flex w-full overflow-hidden">
        {/* Docked Left Sidebar */}
        <DockedSidebar
          variables={metadata?.variables || []}
          activeVariable={activeVariable}
          onSelectVariable={handleSelectVariable}
          depths={currentDepths}
          depthIdx={depthIdx}
          onSelectDepthIdx={(idx) => setDepthIdx(idx)}
          verticalExaggeration={verticalExaggeration}
          onChangeVerticalExaggeration={(v) => setVerticalExaggeration(v)}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          instruments={instruments}
          onSelectPlatform={(p) => setSelectedPlatform(p)}
          onOpenTransect={() => setIsTransectOpen(true)}
          onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
          onNavigateChapter={handleOutreachNavigate}
        />

        {/* 3D Viewport Center */}
        <div className="relative flex-1 h-full overflow-hidden">
          <DualViewport
            ref={viewportRef}
            engineMode={engineMode}
            sliceData={sliceData}
            transectData={transectData}
            instruments={instruments}
            activeVariable={activeVariable}
            palette={palette}
            valMin={valMin}
            valMax={valMax}
            opacity={opacity}
            currentDepth={currentDepths[depthIdx] ?? 0}
            verticalExaggeration={verticalExaggeration}
            layers={layers}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
            onHoverPoint={(info) => setHoverInfo(info)}
          />

          {/* Colorbar Dock (Bottom Left of Canvas) */}
          <div className="absolute left-3 bottom-3 z-20 pointer-events-auto">
            <ColorbarDock
              palette={palette}
              onChangePalette={(p) => setPalette(p)}
              valMin={valMin}
              valMax={valMax}
              onChangeRange={(min, max) => {
                setValMin(min);
                setValMax(max);
              }}
              onResetRange={handleResetRange}
              opacity={opacity}
              onChangeOpacity={(op) => setOpacity(op)}
              units={currentUnits}
            />
          </div>
        </div>

        {/* Slide-out Right Inspection Drawer (non-blocking) */}
        {selectedPlatform && (
          <PlatformDrawer
            platform={selectedPlatform}
            currentTimeIdx={currentTimeIdx}
            onClose={() => setSelectedPlatform(null)}
          />
        )}
      </div>

      {/* 3. Flush Docked Bottom Timeline with integrated telemetry */}
      <DockedTimeline
        times={currentTimes}
        currentTimeIdx={currentTimeIdx}
        onSelectTimeIdx={(idx) => setCurrentTimeIdx(idx)}
        hoverInfo={hoverInfo}
        units={currentUnits}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
      {/* If in dedicated full-screen workstation mode, take over viewport */}
      {isFullscreenWorkstation ? (
        renderWorkstation(true)
      ) : (
        <>
          {/* 1. Institutional Navigation Bar */}
          <PortalNavbar
            onLaunchWorkstation={handleLaunchWorkstation}
            onOpenIngestion={() => setIsIngestionOpen(true)}
            onOpenTransect={() => setIsTransectOpen(true)}
            onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
            onOpenBrand={() => setIsBrandOpen(true)}
            isWorkstationFullscreen={isFullscreenWorkstation}
            onToggleFullscreenWorkstation={() => setIsFullscreenWorkstation(true)}
          />

          {/* 2. Atmospheric Deep Ocean Hero Section */}
          <HeroSection
            onLaunchWorkstation={handleLaunchWorkstation}
            onOpenBrand={() => setIsBrandOpen(true)}
            onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
            onOpenIngestion={() => setIsIngestionOpen(true)}
          />

          {/* 3. Dedicated Interactive Web 3D Oceanographic Workstation Section (Centerpiece) */}
          <section id="architecture" className="w-full py-12 px-3 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-200/80 scroll-mt-20">
            <div id="web3d" className="sr-only" />
            <div className="max-w-[1536px] mx-auto flex flex-col gap-3">
              {/* Institutional Workstation Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 mb-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>OPERATIONAL WORKSTATION // 3D OCEAN DIGITAL TWIN (CF-1.8 / WGS84)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Co-visualization of multi-level hydrodynamic numerical models and autonomous in-situ platforms across 13 vertical depth layers (0–2000 m).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 font-mono pr-3 border-r border-slate-200">
                    <span>Grid: 0.1° × 0.1°</span>
                    <span>•</span>
                    <span>14 In-Situ Platforms</span>
                    <span>•</span>
                    <span>EEZ 2.37M km²</span>
                  </div>

                  <button
                    onClick={() => setIsFullscreenWorkstation(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-600 text-xs font-semibold transition cursor-pointer shadow-xs"
                    title="Maximize to Fullscreen Workstation"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Fullscreen Workstation</span>
                  </button>
                </div>
              </div>

              {/* Embedded Workstation Container */}
              <div className="w-full h-[820px] lg:h-[880px] rounded-3xl border border-blue-100/90 bg-white overflow-hidden flex flex-col shadow-xl shadow-blue-500/5 relative">
                {renderWorkstation(false)}
              </div>
            </div>
          </section>

          {/* 4. Core Scientific Pillars & Architecture Section */}
          <CapabilitiesSection
            onOpenTransect={() => setIsTransectOpen(true)}
            onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
            onOpenIngestion={() => setIsIngestionOpen(true)}
            onLaunchWorkstation={handleLaunchWorkstation}
          />

          {/* 5. Live Autonomous Fleet Telemetry Section */}
          <FleetTelemetrySection
            instruments={instruments}
            onSelectPlatform={(p) => {
              setSelectedPlatform(p);
              handleLaunchWorkstation();
            }}
            onLaunchWorkstation={handleLaunchWorkstation}
          />

          {/* 6. Real-World Operational Impact & Strategic Maritime Mandates */}
          <section id="mandates" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-600 text-xs font-semibold shadow-xs mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>STRATEGIC MARITIME MANDATES</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight font-sans">
                  Real-World Operational Impact &amp;<br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400">
                    Decision Support
                  </span>
                </h2>
                <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
                  Delivering actionable hydrodynamic intelligence to maritime authorities, emergency response coordinators, and coastal communities across India's 2.37M km² Exclusive Economic Zone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Pillar 1: Search & Rescue */}
                <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm mb-6 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors mb-2">
                    Search &amp; Rescue (SAR)
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Equips the Indian Coast Guard and naval coordinators with 48-hour stochastic leeway drift simulations to locate distressed vessels and overboard personnel with high spatial precision.
                  </p>
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                    <span>SOLAS Emergency Response</span>
                  </div>
                </div>

                {/* Pillar 2: Sustainable Blue Economy */}
                <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm mb-6 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                    <Fish className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors mb-2">
                    Blue Economy &amp; Fisheries
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Delineates Potential Fishing Zones (PFZ) by identifying thermal upwelling fronts, directly reducing searching time, fuel costs, and carbon footprint for coastal fishing communities.
                  </p>
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span>Targeted Fishery Advisory</span>
                  </div>
                </div>

                {/* Pillar 3: Cyclone & Hazard Preparedness */}
                <div className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-sky-50/20 to-blue-50/30 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm mb-6 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors mb-2">
                    Cyclone &amp; Hazard Early Warning
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Quantifies upper-ocean Tropical Cyclone Heat Potential (TCHP &gt; 80 kJ/cm²) and Marine Heatwave anomalies, supporting disaster management authorities before landfall.
                  </p>
                  <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    <span>Rapid Intensification Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Comprehensive Institutional Footer */}
          <PortalFooter
            onOpenBrand={() => setIsBrandOpen(true)}
            onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
            onOpenIngestion={() => setIsIngestionOpen(true)}
          />
        </>
      )}

      {/* Operational Modal Dialogs (accessible in both modes) */}
      {isTransectOpen && (
        <TransectViewerModal
          transectData={transectData}
          onUpdateTransect={(td) => {
            setTransectData(td);
            setLayers((prev) => ({ ...prev, showTransectCurtain: true }));
            setEngineMode('three');
          }}
          currentTimeIdx={currentTimeIdx}
          onClose={() => setIsTransectOpen(false)}
        />
      )}

      {isAdvisoriesOpen && (
        <OperationalAdvisoryPanel
          currentTimeIdx={currentTimeIdx}
          onClose={() => setIsAdvisoriesOpen(false)}
        />
      )}

      {isIngestionOpen && (
        <DataIngestionModal
          onSuccessUpload={() => {
            fetchMetadata().then((m) => setMetadata(m));
            fetchInstruments().then((i) => setInstruments(i));
          }}
          onClose={() => setIsIngestionOpen(false)}
        />
      )}

      {isOutreachOpen && (
        <ScienceOutreachModal
          onNavigateChapter={handleOutreachNavigate}
          onClose={() => setIsOutreachOpen(false)}
        />
      )}

      {isBrandOpen && (
        <BrandModal
          onClose={() => setIsBrandOpen(false)}
        />
      )}
    </div>
  );
}
