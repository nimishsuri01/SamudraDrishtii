import React, { useState, useEffect, useRef } from 'react';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ColorbarEditor } from './components/ColorbarEditor';
import { TimelineControls } from './components/TimelineControls';
import { ProfileInspectionModal } from './components/ProfileInspectionModal';
import { TransectViewerModal } from './components/TransectViewerModal';
import { OperationalAdvisoryPanel } from './components/OperationalAdvisoryPanel';
import { DataIngestionModal } from './components/DataIngestionModal';
import { ScienceOutreachModal } from './components/ScienceOutreachModal';

import { 
  ModelMetadata, 
  SliceData, 
  TransectData, 
  InstrumentMarker, 
  ViewportLayers 
} from './types/ocean';
import { fetchMetadata, fetchSlice, fetchInstruments, fetchTransect } from './services/api';

export function App() {
  const viewportRef = useRef<Viewport3DHandle>(null);

  // App mode: 'forecaster' or 'outreach'
  const [appMode, setAppMode] = useState<'forecaster' | 'outreach'>('forecaster');

  // Backend state
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [sliceData, setSliceData] = useState<SliceData | null>(null);
  const [transectData, setTransectData] = useState<TransectData | null>(null);
  const [instruments, setInstruments] = useState<InstrumentMarker[]>([]);

  // Selection state
  const [activeVariable, setActiveVariable] = useState<string>('thetao');
  const [depthIdx, setDepthIdx] = useState<number>(0);
  const [currentTimeIdx, setCurrentTimeIdx] = useState<number>(0);

  // Colormap & Visuals state
  const [palette, setPalette] = useState<string>('thermal');
  const [valMin, setValMin] = useState<number>(2.0);
  const [valMax, setValMax] = useState<number>(31.0);
  const [opacity, setOpacity] = useState<number>(0.90);
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(12);

  // Hover & selection
  const [hoverInfo, setHoverInfo] = useState<{ lat: number; lon: number; depth: number; val: number | null } | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<InstrumentMarker | null>(null);

  // Layer visibility
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

  // Modal dialog states
  const [isTransectOpen, setIsTransectOpen] = useState<boolean>(false);
  const [isAdvisoriesOpen, setIsAdvisoriesOpen] = useState<boolean>(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [isOutreachOpen, setIsOutreachOpen] = useState<boolean>(false);

  // 1. Initial Load: Metadata & Instruments
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
      .catch((err) => console.error("Metadata fetch error:", err));

    fetchInstruments()
      .then((inst) => setInstruments(inst))
      .catch((err) => console.error("Instruments fetch error:", err));

    // Preload default Chennai to Port Blair transect
    fetchTransect(13.08, 80.27, 11.62, 92.72, 'thetao', 0)
      .then((trans) => setTransectData(trans))
      .catch(() => {});
  }, []);

  // 2. Fetch Slice when Variable, Depth, or Time changes
  useEffect(() => {
    fetchSlice(activeVariable, depthIdx, currentTimeIdx)
      .then((data) => {
        setSliceData(data);
      })
      .catch((err) => console.error("Slice fetch error:", err));
  }, [activeVariable, depthIdx, currentTimeIdx]);

  // Handle variable change
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

  // Auto-reset range to slice data min/max
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

  // Handler for Guided Science Outreach story selection
  const handleOutreachNavigate = (chapter: {
    variable: string;
    depthIdx: number;
    cameraPreset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez';
  }) => {
    handleSelectVariable(chapter.variable);
    setDepthIdx(chapter.depthIdx);
    handleCameraPreset(chapter.cameraPreset);
  };

  // Open outreach modal when switching mode
  useEffect(() => {
    if (appMode === 'outreach') {
      setIsOutreachOpen(true);
    }
  }, [appMode]);

  const currentUnits = metadata?.variables.find((v) => v.id === activeVariable)?.units || '';
  const currentDepths = metadata?.depths || [0, 10, 20, 50, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];
  const currentTimes = metadata?.times || ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <Viewport3D
        ref={viewportRef}
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

      {/* Top Application Header */}
      <Header
        appMode={appMode}
        setAppMode={(m) => {
          setAppMode(m);
          if (m === 'outreach') setIsOutreachOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenTransect={() => setIsTransectOpen(true)}
        onOpenAdvisories={() => setIsAdvisoriesOpen(true)}
        onSelectCameraPreset={handleCameraPreset}
      />

      {/* Left Control Panel (Ocean Variables, Depth Navigation, Layer Toggles) */}
      <div className="absolute left-5 top-20 z-10">
        <ControlPanel
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
        />
      </div>

      {/* Right HUD: Colorbar & Scale Editor */}
      <div className="absolute right-5 top-20 z-10">
        <ColorbarEditor
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

      {/* Bottom Center: 4D Temporal Animation Timeline */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <TimelineControls
          times={currentTimes}
          currentTimeIdx={currentTimeIdx}
          onSelectTimeIdx={(idx) => setCurrentTimeIdx(idx)}
        />
      </div>

      {/* Bottom-Right Coordinates & Depth Readout HUD */}
      <div className="absolute bottom-6 right-5 z-10 pointer-events-none">
        <div className="glass-panel rounded-xl px-3 py-1.5 text-[11px] font-mono text-cyan-300 flex items-center gap-3">
          {hoverInfo ? (
            <>
              <span>LAT: {hoverInfo.lat > 0 ? `${hoverInfo.lat}°N` : `${Math.abs(hoverInfo.lat)}°S`}</span>
              <span>LON: {hoverInfo.lon}°E</span>
              <span>DEPTH: {hoverInfo.depth}m</span>
            </>
          ) : (
            <span>NORTH INDIAN OCEAN (0°N - 26°N, 60°E - 100°E)</span>
          )}
        </div>
      </div>

      {/* Modals & Dialogs */}
      {selectedPlatform && (
        <ProfileInspectionModal
          platform={selectedPlatform}
          currentTimeIdx={currentTimeIdx}
          onClose={() => setSelectedPlatform(null)}
        />
      )}

      {isTransectOpen && (
        <TransectViewerModal
          transectData={transectData}
          onUpdateTransect={(td) => {
            setTransectData(td);
            setLayers((prev) => ({ ...prev, showTransectCurtain: true }));
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
    </div>
  );
}

export default App;
