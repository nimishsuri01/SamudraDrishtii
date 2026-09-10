'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SliceData, TransectData, InstrumentMarker, ViewportLayers } from '../types/ocean';
import { interpolateColor, RGB } from '../utils/colormaps';

interface ThreeVolumetricProps {
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

export interface ThreeVolumetricHandle {
  setCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
}

const MIN_LON = 60.0;
const MAX_LON = 100.0;
const MIN_LAT = 0.0;
const MAX_LAT = 26.0;

const WORLD_W = 40;
const WORLD_H = 26;
const MAX_DEPTH_Y = 10;

function lonLatToWorld(lon: number, lat: number): { x: number; z: number } {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON) - 0.5) * WORLD_W;
  const z = -((lat - MIN_LAT) / (MAX_LAT - MIN_LAT) - 0.5) * WORLD_H;
  return { x, z };
}

function worldToLonLat(x: number, z: number): { lon: number; lat: number } {
  const lon = ((x / WORLD_W) + 0.5) * (MAX_LON - MIN_LON) + MIN_LON;
  const lat = ((-z / WORLD_H) + 0.5) * (MAX_LAT - MIN_LAT) + MIN_LAT;
  return { lon, lat };
}

export const ThreeVolumetric = forwardRef<ThreeVolumetricHandle, ThreeVolumetricProps>(({
  sliceData,
  transectData,
  instruments,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const depthPlaneRef = useRef<THREE.Mesh | null>(null);
  const bathymetryGroupRef = useRef<THREE.Group | null>(null);
  const eezGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const transectMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);

  const sliceCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const sliceTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const transectCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const transectTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const markerMeshMap = useRef<Map<THREE.Object3D, InstrumentMarker>>(new Map());
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  useImperativeHandle(ref, () => ({
    setCameraPreset(preset) {
      if (!controlsRef.current || !cameraRef.current) return;
      if (preset === 'overview') {
        targetCamPos.current = new THREE.Vector3(0, 36, 0.1);
        targetLookAt.current = new THREE.Vector3(0, 0, 0);
      } else if (preset === 'oblique') {
        targetCamPos.current = new THREE.Vector3(0, 24, 28);
        targetLookAt.current = new THREE.Vector3(0, -3, 0);
      } else if (preset === 'arabian') {
        targetCamPos.current = new THREE.Vector3(-10, 18, 14);
        targetLookAt.current = new THREE.Vector3(-8, -2, -2);
      } else if (preset === 'bob') {
        targetCamPos.current = new THREE.Vector3(12, 18, 14);
        targetLookAt.current = new THREE.Vector3(10, -2, -2);
      } else if (preset === 'eez') {
        targetCamPos.current = new THREE.Vector3(2, 22, 18);
        targetLookAt.current = new THREE.Vector3(2, -1, 0);
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.011);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 26, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 85;
    controls.target.set(0, -2, 0);
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xdbeafe, 1.1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Grid Frame
    const boxGeo = new THREE.BoxGeometry(WORLD_W, MAX_DEPTH_Y, WORLD_H);
    const boxWire = new THREE.WireframeGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(boxWire, new THREE.LineBasicMaterial({ color: 0x1e293b, opacity: 0.4, transparent: true }));
    boxLine.position.set(0, -MAX_DEPTH_Y / 2, 0);
    scene.add(boxLine);

    // Groups
    const bathyGroup = new THREE.Group();
    scene.add(bathyGroup);
    bathymetryGroupRef.current = bathyGroup;

    const eezGroup = new THREE.Group();
    scene.add(eezGroup);
    eezGroupRef.current = eezGroup;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    buildBathymetry(bathyGroup);
    buildEez(eezGroup);

    // Depth Slice Plane
    const planeGeo = new THREE.PlaneGeometry(WORLD_W, WORLD_H, 120, 80);
    planeGeo.rotateX(-Math.PI / 2);
    const texture = new THREE.CanvasTexture(sliceCanvasRef.current);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    sliceTextureRef.current = texture;

    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.88,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const depthPlane = new THREE.Mesh(planeGeo, planeMat);
    depthPlane.position.y = 0;
    scene.add(depthPlane);
    depthPlaneRef.current = depthPlane;

    initParticleSystem(scene);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetLookAt.current, 0.06);
        if (camera.position.distanceTo(targetCamPos.current) < 0.1) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      updateParticles(delta);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const buildBathymetry = (group: THREE.Group) => {
    group.clear();
    const segX = 80;
    const segZ = 60;
    const geo = new THREE.PlaneGeometry(WORLD_W, WORLD_H, segX, segZ);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const wx = pos.getX(i);
      const wz = pos.getZ(i);
      const { lon, lat } = worldToLonLat(wx, wz);

      let depthM = 3500;
      const isLand = checkIsLand(lat, lon);
      if (isLand) {
        depthM = -200 - Math.sin(lat * 0.4) * 800;
      } else {
        if (lat >= 18 && lon >= 68 && lon <= 72.8) depthM = 80;
        else if (lat <= 15 && lon >= 74 && lon <= 76) depthM = 150;
        else if (lat >= 16 && lon >= 82 && lon <= 86) depthM = 120;
        else if (lat <= 10 && lon >= 79 && lon <= 81) depthM = 90;
        else {
          const distCarlsberg = Math.abs((lat - 8) - (lon - 62) * 0.6);
          if (distCarlsberg < 2.5) depthM = 2100;
          if (Math.abs(lon - 90) < 1.2 && lat <= 18) depthM = 1900;
          if (Math.abs(lon - 73) < 1.5 && lat <= 13) depthM = 1600;
        }
      }

      let wy = isLand ? 0.4 + Math.min(2.0, Math.abs(depthM) / 600) : -(depthM / 4000) * MAX_DEPTH_Y;
      pos.setY(i, wy);

      if (isLand) {
        colors.push(0.12, 0.16, 0.14);
      } else {
        const normD = Math.min(1, Math.max(0, depthM / 4000));
        const rgb = interpolateColor(1 - normD, 'deep');
        colors.push(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
  };

  const buildEez = (group: THREE.Group) => {
    group.clear();
    const eezPoints = [
      [23.5, 66.8], [22.2, 65.8], [20.5, 67.2], [18.5, 68.4], [16.5, 69.5], 
      [14.5, 70.8], [12.0, 71.5], [10.0, 72.0], [8.0, 73.5], [6.5, 75.2],
      [5.5, 77.5], [5.8, 79.2], [6.8, 80.2], [8.5, 82.5],
      [10.5, 83.8], [12.5, 84.8], [14.5, 85.5], [16.5, 86.8], [18.2, 88.2], 
      [20.5, 89.2], [21.5, 88.5]
    ];
    const pts3d = eezPoints.map(([lat, lon]) => {
      const { x, z } = lonLatToWorld(lon, lat);
      return new THREE.Vector3(x, 0.1, z);
    });

    const curve = new THREE.CatmullRomCurve3(pts3d);
    const tubeMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.06, 6, false), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    group.add(tubeMesh);
  };

  const checkIsLand = (lat: number, lon: number): boolean => {
    // Sri Lanka (teardrop island)
    if (lat >= 5.9 && lat <= 9.85) {
      const latRel = (lat - 7.6) / 1.85;
      const lonHalfWidth = lat < 8.3 ? 0.70 : 0.40;
      const lonRel = (lon - 80.75) / lonHalfWidth;
      if (latRel * latRel + lonRel * lonRel <= 1.0) {
        return true;
      }
    }

    // Indian Subcontinent mainland
    if (lat >= 8.1) {
      if (lat < 9.5) {
        if (lon >= 76.9 && lon <= 78.2) return true;
      } else if (lat < 12.0) {
        if (lon >= 75.8 && lon <= 80.1) return true;
      } else if (lat < 15.0) {
        if (lon >= 74.2 && lon <= 80.5) return true;
      } else if (lat < 18.0) {
        if (lon >= 73.2 && lon <= 82.8) return true;
      } else if (lat < 20.5) {
        if (lon >= 72.8 && lon <= 86.8) return true;
      } else if (lat < 23.0) {
        if ((lon >= 68.8 && lon <= 73.2) || (lon >= 72.6 && lon <= 89.0)) return true;
      } else {
        if (lon >= 68.2 && lon <= 89.5) return true;
      }
    }

    if (lon <= 65.5 && lat >= 22.5) return true;
    if (lon <= 61.5 && lat >= 17.5) return true;
    if (lon <= 58.5 && lat >= 14.0) return true;
    if (lon >= 94.5 && lat >= 16.0) return true;
    if (lon >= 98.2 && lat >= 7.0) return true;

    return false;
  };

  const initParticleSystem = (scene: THREE.Scene) => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * WORLD_W;
      positions[i * 3 + 1] = 0.05;
      positions[i * 3 + 2] = (Math.random() - 0.5) * WORLD_H;

      colors[i * 3] = 0.15;
      colors[i * 3 + 1] = 0.65;
      colors[i * 3 + 2] = 0.9;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geo, mat);
    scene.add(pSystem);
    particleSystemRef.current = pSystem;
    particlePositionsRef.current = positions;
  };

  const updateParticles = (delta: number) => {
    if (!particleSystemRef.current || !particlePositionsRef.current || !layers.showVectorParticles) {
      if (particleSystemRef.current) particleSystemRef.current.visible = false;
      return;
    }
    particleSystemRef.current.visible = true;

    const positions = particlePositionsRef.current;
    const count = positions.length / 3;
    const currentY = depthPlaneRef.current ? depthPlaneRef.current.position.y + 0.05 : 0.05;

    for (let i = 0; i < count; i++) {
      let x = positions[i * 3];
      let z = positions[i * 3 + 2];
      const { lon, lat } = worldToLonLat(x, z);

      let u = 0.35;
      let v = 0.15;
      if (lon <= 65 && lat <= 15) {
        u = 0.3;
        v = 1.3;
      } else if (lat <= 8) {
        u = 0.85;
        v = -0.1;
      }

      x += u * delta * 2.2;
      z -= v * delta * 2.2;

      if (x > WORLD_W / 2 || x < -WORLD_W / 2 || z > WORLD_H / 2 || z < -WORLD_H / 2 || checkIsLand(lat, lon)) {
        x = (Math.random() - 0.5) * (WORLD_W * 0.9);
        z = (Math.random() - 0.5) * (WORLD_H * 0.9);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = currentY;
      positions[i * 3 + 2] = z;
    }

    particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
  };

  useEffect(() => {
    if (!sliceData || !sliceTextureRef.current) return;
    const canvas = sliceCanvasRef.current;
    const nLats = sliceData.n_lats;
    const nLons = sliceData.n_lons;
    const scale = 6;
    const targetW = (nLons - 1) * scale + 1;
    const targetH = (nLats - 1) * scale + 1;

    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.createImageData(targetW, targetH);
    const data = imgData.data;
    const grid = sliceData.grid;

    for (let py = 0; py < targetH; py++) {
      const v = 1.0 - py / (targetH - 1);
      const gridY = v * (nLats - 1);
      const y0 = Math.floor(gridY);
      const y1 = Math.min(y0 + 1, nLats - 1);
      const dy = gridY - y0;

      for (let px = 0; px < targetW; px++) {
        const u = px / (targetW - 1);
        const gridX = u * (nLons - 1);
        const x0 = Math.floor(gridX);
        const x1 = Math.min(x0 + 1, nLons - 1);
        const dx = gridX - x0;

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
          data[pixelIdx + 3] = 0;
        } else {
          const interpVal = sumVal / sumW;
          const coastFactor = Math.min(1.0, sumW * 1.25);
          const norm = valMax > valMin ? (interpVal - valMin) / (valMax - valMin) : 0.5;
          const rgb: RGB = interpolateColor(norm, palette);
          data[pixelIdx] = rgb.r;
          data[pixelIdx + 1] = rgb.g;
          data[pixelIdx + 2] = rgb.b;
          data[pixelIdx + 3] = Math.round(opacity * 240 * coastFactor);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    sliceTextureRef.current.needsUpdate = true;
  }, [sliceData, palette, valMin, valMax, opacity]);

  useEffect(() => {
    if (!depthPlaneRef.current) return;
    const normDepth = Math.min(1.0, currentDepth / 2000.0);
    const scaledExagg = verticalExaggeration / 10.0;
    const yPos = -normDepth * MAX_DEPTH_Y * scaledExagg;

    depthPlaneRef.current.position.y = yPos;
    if (depthPlaneRef.current.material instanceof THREE.MeshStandardMaterial) {
      depthPlaneRef.current.material.opacity = opacity;
    }
  }, [currentDepth, verticalExaggeration, opacity]);

  useEffect(() => {
    if (!sceneRef.current) return;
    if (!transectData || !layers.showTransectCurtain) {
      if (transectMeshRef.current) transectMeshRef.current.visible = false;
      return;
    }

    const canvas = transectCanvasRef.current;
    const nWaypoints = transectData.waypoints.length;
    const nDepths = transectData.depths.length;
    canvas.width = nWaypoints;
    canvas.height = nDepths;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(nWaypoints, nDepths);
      const data = imgData.data;

      for (let d = 0; d < nDepths; d++) {
        const row = transectData.curtain[d] || [];
        for (let w = 0; w < nWaypoints; w++) {
          const val = row[w];
          const pixelIdx = (d * nWaypoints + w) * 4;
          if (val === null) {
            data[pixelIdx + 3] = 0;
          } else {
            const norm = valMax > valMin ? (val - valMin) / (valMax - valMin) : 0.5;
            const rgb = interpolateColor(norm, palette);
            data[pixelIdx] = rgb.r;
            data[pixelIdx + 1] = rgb.g;
            data[pixelIdx + 2] = rgb.b;
            data[pixelIdx + 3] = 235;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    if (!transectTextureRef.current) {
      transectTextureRef.current = new THREE.CanvasTexture(canvas);
      transectTextureRef.current.minFilter = THREE.LinearFilter;
    } else {
      transectTextureRef.current.needsUpdate = true;
    }

    if (transectMeshRef.current) {
      sceneRef.current.remove(transectMeshRef.current);
      transectMeshRef.current.geometry.dispose();
    }

    const waypoints = transectData.waypoints;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const bottomY = -MAX_DEPTH_Y * (verticalExaggeration / 10.0);

    waypoints.forEach((wp, idx) => {
      const { x, z } = lonLatToWorld(wp.lon, wp.lat);
      const u = idx / (waypoints.length - 1);
      vertices.push(x, 0, z);
      uvs.push(u, 0);
      vertices.push(x, bottomY, z);
      uvs.push(u, 1);
    });

    for (let i = 0; i < waypoints.length - 1; i++) {
      const top1 = i * 2;
      const bot1 = i * 2 + 1;
      const top2 = (i + 1) * 2;
      const bot2 = (i + 1) * 2 + 1;
      indices.push(top1, bot1, top2);
      indices.push(top2, bot1, bot2);
      indices.push(top2, bot1, top1);
      indices.push(bot2, bot1, top2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      map: transectTextureRef.current,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    const transectMesh = new THREE.Mesh(geo, mat);
    sceneRef.current.add(transectMesh);
    transectMeshRef.current = transectMesh;
    transectMesh.visible = layers.showTransectCurtain;
  }, [transectData, layers.showTransectCurtain, palette, valMin, valMax, verticalExaggeration]);

  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;
    group.clear();
    markerMeshMap.current.clear();
    const exaggScale = verticalExaggeration / 10.0;

    instruments.forEach((inst) => {
      const isArgo = inst.category === 'argo';
      const isGlider = inst.category === 'glider';
      const isBuoy = inst.category === 'buoy';

      if (isArgo && !layers.showArgo) return;
      if (isGlider && !layers.showGliders) return;
      if (isBuoy && !layers.showBuoys) return;

      const { x, z } = lonLatToWorld(inst.lon, inst.lat);
      const markerRoot = new THREE.Group();
      markerRoot.position.set(x, 0, z);

      if (isArgo) {
        const hullGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.5, 12);
        const hullMat = new THREE.MeshStandardMaterial({
          color: inst.has_bgc ? 0x10b981 : 0x0284c7,
          roughness: 0.4
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0.2;
        markerRoot.add(hull);

        const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
        const ant = new THREE.Mesh(antGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        ant.position.y = 0.65;
        markerRoot.add(ant);

        const cableLen = MAX_DEPTH_Y * exaggScale;
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, cableLen, 4),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })
        );
        cable.position.y = -cableLen / 2;
        markerRoot.add(cable);

      } else if (isGlider) {
        const bodyGeo = new THREE.ConeGeometry(0.16, 0.8, 8);
        bodyGeo.rotateX(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        const gliderY = -((inst.depth || 340) / 2000) * MAX_DEPTH_Y * exaggScale;
        body.position.y = gliderY;
        markerRoot.add(body);

      } else if (isBuoy) {
        const buoy = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.12, 8, 16),
          new THREE.MeshStandardMaterial({ color: 0xd97706 })
        );
        buoy.rotateX(Math.PI / 2);
        buoy.position.y = 0.1;
        markerRoot.add(buoy);
      }

      const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 6, 6), new THREE.MeshBasicMaterial({ visible: false }));
      markerRoot.add(hitMesh);
      markerMeshMap.current.set(hitMesh, inst);
      group.add(markerRoot);
    });
  }, [instruments, layers.showArgo, layers.showGliders, layers.showBuoys, verticalExaggeration]);

  useEffect(() => {
    if (depthPlaneRef.current) depthPlaneRef.current.visible = layers.showModelSlice;
    if (bathymetryGroupRef.current) bathymetryGroupRef.current.visible = layers.showBathymetry;
    if (eezGroupRef.current) eezGroupRef.current.visible = layers.showEez;
    if (transectMeshRef.current) transectMeshRef.current.visible = layers.showTransectCurtain;
  }, [layers]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const hitMeshes = Array.from(markerMeshMap.current.keys());
    const intersects = raycaster.intersectObjects(hitMeshes, true);

    if (intersects.length > 0) {
      const platform = markerMeshMap.current.get(intersects[0].object);
      if (platform) onSelectPlatform(platform);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !onHoverPoint || !depthPlaneRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObject(depthPlaneRef.current);

    if (intersects.length > 0) {
      const { lon, lat } = worldToLonLat(intersects[0].point.x, intersects[0].point.z);
      onHoverPoint({ lat: Number(lat.toFixed(2)), lon: Number(lon.toFixed(2)), depth: currentDepth, val: null });
    } else {
      onHoverPoint(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    />
  );
});
