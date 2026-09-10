'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { SliceData, InstrumentMarker, ViewportLayers } from '../types/ocean';
import { interpolateColor } from '../utils/colormaps';

declare global {
  interface Window {
    Cesium?: any;
  }
}

interface CesiumGlobeProps {
  sliceData: SliceData | null;
  instruments: InstrumentMarker[];
  activeVariable: string;
  palette: string;
  valMin: number;
  valMax: number;
  opacity: number;
  layers: ViewportLayers;
  onSelectPlatform: (platform: InstrumentMarker) => void;
  onHoverPoint?: (info: { lat: number; lon: number; depth: number; val: number | null } | null) => void;
}

export interface CesiumGlobeHandle {
  setCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
}

export const CesiumGlobe = forwardRef<CesiumGlobeHandle, CesiumGlobeProps>(({
  sliceData,
  instruments,
  palette,
  valMin,
  valMax,
  opacity,
  layers,
  onSelectPlatform,
  onHoverPoint
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const modelLayerRef = useRef<any>(null);
  const entitiesMapRef = useRef<Map<any, InstrumentMarker>>(new Map());

  // Expose camera presets
  useImperativeHandle(ref, () => ({
    setCameraPreset(preset) {
      if (!viewerRef.current || !window.Cesium) return;
      const Cesium = window.Cesium;
      const camera = viewerRef.current.camera;

      if (preset === 'overview') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(80.0, 13.0, 4800000),
          orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-85.0), roll: 0.0 },
          duration: 1.5
        });
      } else if (preset === 'oblique') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(80.0, 0.0, 3200000),
          orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-50.0), roll: 0.0 },
          duration: 1.5
        });
      } else if (preset === 'arabian') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(66.5, 16.0, 2600000),
          orientation: { heading: Cesium.Math.toRadians(15.0), pitch: Cesium.Math.toRadians(-60.0), roll: 0.0 },
          duration: 1.5
        });
      } else if (preset === 'bob') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(88.0, 14.5, 2600000),
          orientation: { heading: Cesium.Math.toRadians(-15.0), pitch: Cesium.Math.toRadians(-60.0), roll: 0.0 },
          duration: 1.5
        });
      } else if (preset === 'eez') {
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(78.5, 14.0, 3100000),
          orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-75.0), roll: 0.0 },
          duration: 1.5
        });
      }
    }
  }));

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const initCesium = () => {
      if (!window.Cesium) {
        setTimeout(initCesium, 100);
        return;
      }

      const Cesium = window.Cesium;

      // Explicitly disable Cesium Ion token requests
      if (Cesium.Ion) {
        Cesium.Ion.defaultAccessToken = '';
      }

      // Professional dark oceanographic basemap (Esri World Dark Gray Base - 100% open, zero API keys required, no watermarks)
      const imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 16,
        credit: 'Esri, DeLorme, NAVTEQ'
      });

      const viewer = new Cesium.Viewer(containerRef.current, {
        baseLayer: new Cesium.ImageryLayer(imageryProvider),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        animation: false,
        scene3DOnly: true,
        terrainProvider: new Cesium.EllipsoidTerrainProvider()
      });

      viewerRef.current = viewer;

      // Restrained globe lighting & atmosphere
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#070b14');
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#040710');

      // Initial View: Oblique 3D Perspective Centered on North Indian Ocean
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(78.5, 4.0, 4800000),
        orientation: {
          heading: 0.0,
          pitch: Cesium.Math.toRadians(-52.0),
          roll: 0.0
        }
      });

      // Add India EEZ Boundaries
      addEezBoundaries(viewer);

      // Add Click Handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id) {
          const inst = entitiesMapRef.current.get(picked.id);
          if (inst) {
            onSelectPlatform(inst);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Add Mouse Move for Coordinate HUD
      handler.setInputAction((movement: any) => {
        if (!onHoverPoint) return;
        const ray = viewer.camera.getPickRay(movement.endPosition);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (Cesium.defined(cartesian)) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(2));
          const lat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(2));
          onHoverPoint({ lat, lon, depth: 0, val: null });
        } else {
          onHoverPoint(null);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    initCesium();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Add India EEZ Boundary Lines in Cesium
  const addEezBoundaries = (viewer: any) => {
    const Cesium = window.Cesium;
    if (!Cesium) return;

    const eezCoordsMainland = [
      66.8, 23.5, 65.8, 22.2, 67.2, 20.5, 68.4, 18.5, 69.5, 16.5, 
      70.8, 14.5, 71.5, 12.0, 72.0, 10.0, 73.5, 8.0, 75.2, 6.5,
      77.5, 5.5, 79.2, 5.8, 80.2, 6.8, 82.5, 8.5,
      83.8, 10.5, 84.8, 12.5, 85.5, 14.5, 86.8, 16.5, 88.2, 18.2, 
      89.2, 20.5, 88.5, 21.5
    ];

    // Mainland line
    viewer.entities.add({
      name: 'India Mainland EEZ (200 NM)',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(eezCoordsMainland),
        width: 2.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.15,
          color: Cesium.Color.fromCssColorString('#0284c7')
        }),
        clampToGround: true
      }
    });

    // Lakshadweep EEZ polygon
    const lakCoords = [
      70.0, 12.5, 72.5, 13.2, 74.5, 12.5, 74.8, 9.5, 
      73.8, 7.8, 71.2, 7.8, 69.8, 9.5, 70.0, 12.5
    ];
    viewer.entities.add({
      name: 'Lakshadweep EEZ',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(lakCoords),
        width: 1.2,
        material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.75),
        clampToGround: true
      }
    });

    // Andaman EEZ polygon
    const andCoords = [
      91.0, 14.5, 94.5, 14.5, 95.0, 12.0, 94.8, 9.0, 
      94.5, 6.0, 93.0, 5.8, 91.5, 8.0, 91.2, 11.0, 91.0, 14.5
    ];
    viewer.entities.add({
      name: 'Andaman & Nicobar EEZ',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(andCoords),
        width: 1.2,
        material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.75),
        clampToGround: true
      }
    });
  };

  // Update In-Situ Platforms (Argo, Gliders, Buoys)
  useEffect(() => {
    if (!viewerRef.current || !window.Cesium) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Clear previous instrument entities
    entitiesMapRef.current.forEach((_, entity) => {
      viewer.entities.remove(entity);
    });
    entitiesMapRef.current.clear();

    instruments.forEach((inst) => {
      const isArgo = inst.category === 'argo';
      const isGlider = inst.category === 'glider';
      const isBuoy = inst.category === 'buoy';

      if (isArgo && !layers.showArgo) return;
      if (isGlider && !layers.showGliders) return;
      if (isBuoy && !layers.showBuoys) return;

      let pinColor = '#0284c7';
      let pinSize = 6;

      if (isArgo) {
        pinColor = inst.has_bgc ? '#059669' : '#0284c7';
      } else if (isGlider) {
        pinColor = '#d97706';
        pinSize = 6;
      } else if (isBuoy) {
        pinColor = '#b45309';
        pinSize = 6;
      }

      // Platform Marker Point
      const entity = viewer.entities.add({
        name: inst.name,
        position: Cesium.Cartesian3.fromDegrees(inst.lon, inst.lat, 500),
        point: {
          pixelSize: pinSize,
          color: Cesium.Color.fromCssColorString(pinColor),
          outlineColor: Cesium.Color.fromCssColorString('#ffffff'),
          outlineWidth: 1.0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: isArgo ? `${inst.wmo}` : isGlider ? `GLD-${inst.id.slice(-4)}` : inst.name.split(' ')[0],
          font: '9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#cbd5e1'),
          outlineColor: Cesium.Color.fromCssColorString('#090d16'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 3200000.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });

      entitiesMapRef.current.set(entity, inst);

      // Trajectory Polyline
      if (inst.trajectory && inst.trajectory.length > 1) {
        const flatPts: number[] = [];
        inst.trajectory.forEach((t) => {
          flatPts.push(t.lon, t.lat);
        });

        viewer.entities.add({
          name: `${inst.name} Trajectory`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatPts),
            width: 1.2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString(pinColor).withAlpha(0.55),
              dashLength: 8.0
            }),
            clampToGround: true
          }
        });
      }
    });
  }, [instruments, layers.showArgo, layers.showGliders, layers.showBuoys]);

  // Update Numerical Model Field Surface Draped Layer
  useEffect(() => {
    if (!viewerRef.current || !window.Cesium || !sliceData) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Remove old model layer
    if (modelLayerRef.current) {
      viewer.imageryLayers.remove(modelLayerRef.current, true);
      modelLayerRef.current = null;
    }

    if (!layers.showModelSlice) return;

    // Draw high-resolution upsampled canvas texture (6x grid resolution for smooth gradients)
    const canvas = canvasRef.current;
    const nLats = sliceData.n_lats;
    const nLons = sliceData.n_lons;
    const scale = 6;
    const targetW = (nLons - 1) * scale + 1; // 481 px
    const targetH = (nLats - 1) * scale + 1; // 313 px

    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(targetW, targetH);
    const data = imgData.data;
    const grid = sliceData.grid;

    // Outer boundary feather margin (outer 5% smoothly fades to 0)
    const featherFrac = 0.05;

    for (let py = 0; py < targetH; py++) {
      // py = 0 is North (Lat 26.0), py = targetH - 1 is South (Lat 0.0)
      const v = 1.0 - py / (targetH - 1);
      const gridY = v * (nLats - 1);
      const y0 = Math.floor(gridY);
      const y1 = Math.min(y0 + 1, nLats - 1);
      const dy = gridY - y0;

      // Latitude edge distance factor (0 at boundary to 1 at interior)
      const distLat = Math.min(v, 1.0 - v);
      const rawFadeY = Math.min(1.0, distLat / featherFrac);
      const fadeY = rawFadeY * rawFadeY * (3 - 2 * rawFadeY);

      for (let px = 0; px < targetW; px++) {
        const u = px / (targetW - 1); // 0 (West, 60E) to 1 (East, 100E)
        const gridX = u * (nLons - 1);
        const x0 = Math.floor(gridX);
        const x1 = Math.min(x0 + 1, nLons - 1);
        const dx = gridX - x0;

        // Longitude edge distance factor
        const distLon = Math.min(u, 1.0 - u);
        const rawFadeX = Math.min(1.0, distLon / featherFrac);
        const fadeX = rawFadeX * rawFadeX * (3 - 2 * rawFadeX);

        const borderFactor = fadeX * fadeY;

        // Bilinear interpolation weights
        const w00 = (1 - dx) * (1 - dy);
        const w10 = dx * (1 - dy);
        const w01 = (1 - dx) * dy;
        const w11 = dx * dy;

        const val00 = grid[y0]?.[x0];
        const val10 = grid[y0]?.[x1];
        const val01 = grid[y1]?.[x0];
        const val11 = grid[y1]?.[x1];

        let sumVal = 0;
        let sumW = 0;

        if (val00 !== null && val00 !== undefined && !isNaN(val00)) { sumVal += val00 * w00; sumW += w00; }
        if (val10 !== null && val10 !== undefined && !isNaN(val10)) { sumVal += val10 * w10; sumW += w10; }
        if (val01 !== null && val01 !== undefined && !isNaN(val01)) { sumVal += val01 * w01; sumW += w01; }
        if (val11 !== null && val11 !== undefined && !isNaN(val11)) { sumVal += val11 * w11; sumW += w11; }

        const pixelIdx = (py * targetW + px) * 4;

        if (sumW <= 0.05) {
          // Pure land point -> transparent
          data[pixelIdx + 3] = 0;
        } else {
          // Ocean point (or coastal boundary)
          const interpVal = sumVal / sumW;
          const coastFactor = Math.min(1.0, sumW * 1.25); // smooth coastal anti-aliasing

          const norm = valMax > valMin ? (interpVal - valMin) / (valMax - valMin) : 0.5;
          const rgb = interpolateColor(norm, palette);

          data[pixelIdx] = rgb.r;
          data[pixelIdx + 1] = rgb.g;
          data[pixelIdx + 2] = rgb.b;
          data[pixelIdx + 3] = Math.round(opacity * 245 * coastFactor * borderFactor);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Create Cesium SingleTileImageryProvider
    const imageryProvider = new Cesium.SingleTileImageryProvider({
      url: canvas.toDataURL('image/png'),
      rectangle: Cesium.Rectangle.fromDegrees(60.0, 0.0, 100.0, 26.0)
    });

    const newLayer = viewer.imageryLayers.addImageryProvider(imageryProvider);
    newLayer.alpha = opacity;
    modelLayerRef.current = newLayer;

  }, [sliceData, palette, valMin, valMax, opacity, layers.showModelSlice]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});
