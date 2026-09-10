'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { CesiumGlobe, CesiumGlobeHandle } from './CesiumGlobe';
import { ThreeVolumetric, ThreeVolumetricHandle } from './ThreeVolumetric';
import { SliceData, TransectData, InstrumentMarker, ViewportLayers } from '../types/ocean';

export type EngineMode = 'cesium' | 'three';

interface DualViewportProps {
  engineMode: EngineMode;
  sliceData: SliceData | null;
  transectData: TransectData | null;
  instruments: InstrumentMarker[];
  activeVariable: string;
  palette: string;
  valMin: number;
  valMax: number;
  opacity: number;
  currentDepth: number;
  verticalExaggeration: number;
  layers: ViewportLayers;
  onSelectPlatform: (platform: InstrumentMarker) => void;
  onHoverPoint?: (info: { lat: number; lon: number; depth: number; val: number | null } | null) => void;
}

export interface DualViewportHandle {
  setCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
}

export const DualViewport = forwardRef<DualViewportHandle, DualViewportProps>(({
  engineMode,
  sliceData,
  transectData,
  instruments,
  activeVariable,
  palette,
  valMin,
  valMax,
  opacity,
  currentDepth,
  verticalExaggeration,
  layers,
  onSelectPlatform,
  onHoverPoint
}, ref) => {
  const cesiumRef = useRef<CesiumGlobeHandle>(null);
  const threeRef = useRef<ThreeVolumetricHandle>(null);

  useImperativeHandle(ref, () => ({
    setCameraPreset(preset) {
      if (engineMode === 'cesium' && cesiumRef.current) {
        cesiumRef.current.setCameraPreset(preset);
      } else if (engineMode === 'three' && threeRef.current) {
        threeRef.current.setCameraPreset(preset);
      }
    }
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050811]">
      {/* Cesium Globe Viewport */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${engineMode === 'cesium' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
        <CesiumGlobe
          ref={cesiumRef}
          sliceData={sliceData}
          instruments={instruments}
          activeVariable={activeVariable}
          palette={palette}
          valMin={valMin}
          valMax={valMax}
          opacity={opacity}
          layers={layers}
          onSelectPlatform={onSelectPlatform}
          onHoverPoint={onHoverPoint}
        />
      </div>

      {/* Three.js 4D Volumetric Viewport */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${engineMode === 'three' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
        <ThreeVolumetric
          ref={threeRef}
          sliceData={sliceData}
          transectData={transectData}
          instruments={instruments}
          activeVariable={activeVariable}
          palette={palette}
          valMin={valMin}
          valMax={valMax}
          opacity={opacity}
          currentDepth={currentDepth}
          verticalExaggeration={verticalExaggeration}
          layers={layers}
          onSelectPlatform={onSelectPlatform}
          onHoverPoint={onHoverPoint}
        />
      </div>
    </div>
  );
});
