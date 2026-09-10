import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SliceData, TransectData, InstrumentMarker, ViewportLayers } from '../types/ocean';
import { interpolateColor, RGB } from '../utils/colormaps';

interface Viewport3DProps {
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

export interface Viewport3DHandle {
  setCameraPreset: (preset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez') => void;
}

// Geospatial bounds
const MIN_LON = 60.0;
const MAX_LON = 100.0;
const MIN_LAT = 0.0;
const MAX_LAT = 26.0;

// Three.js world size
const WORLD_W = 40; // X axis (-20 to 20)
const WORLD_H = 26; // Z axis (13 to -13)
const MAX_DEPTH_Y = 10; // Y axis (0 to -10)

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

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({
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

  // Scene object groups
  const depthPlaneRef = useRef<THREE.Mesh | null>(null);
  const bathymetryGroupRef = useRef<THREE.Group | null>(null);
  const eezGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const transectMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleVelocitiesRef = useRef<{ u: number; v: number }[]>([]);

  // Canvas for dynamic scalar texture
  const sliceCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const sliceTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Transect canvas & texture
  const transectCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const transectTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Platform hit test mapping
  const markerMeshMap = useRef<Map<THREE.Object3D, InstrumentMarker>>(new Map());

  // Camera animation
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

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.012);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 26, 30);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 85;
    controls.target.set(0, -2, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueGlowLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    blueGlowLight.position.set(-20, -10, -20);
    scene.add(blueGlowLight);

    // Coordinate Bounding Box / Water Column Grid Frame
    const boxGeo = new THREE.BoxGeometry(WORLD_W, MAX_DEPTH_Y, WORLD_H);
    const boxWire = new THREE.WireframeGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(boxWire, new THREE.LineBasicMaterial({ color: 0x1e3a8a, opacity: 0.35, transparent: true }));
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

    // Build Bathymetry & Coastlines
    buildBathymetry(bathyGroup);
    buildEez(eezGroup);

    // Create Depth-Slice Plane
    const planeGeo = new THREE.PlaneGeometry(WORLD_W, WORLD_H, 120, 80);
    planeGeo.rotateX(-Math.PI / 2);
    const texture = new THREE.CanvasTexture(sliceCanvasRef.current);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    sliceTextureRef.current = texture;

    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const depthPlane = new THREE.Mesh(planeGeo, planeMat);
    depthPlane.position.y = 0;
    scene.add(depthPlane);
    depthPlaneRef.current = depthPlane;

    // Create Particle System for Current Vectors
    initParticleSystem(scene);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();

      // Smooth camera interpolation if target preset active
      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.05);
        controls.target.lerp(targetLookAt.current, 0.05);
        if (camera.position.distanceTo(targetCamPos.current) < 0.1) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      // Update flow particles
      updateParticles(delta);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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

  // Build 3D Bathymetry & Coastlines
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

      // Realistic bathymetric elevation calculation
      let depthM = 3500; // Deep ocean base

      // Continental Shelf & Land Detection
      const isLand = checkIsLand(lat, lon);
      if (isLand) {
        // Land elevation (above sea level)
        depthM = -200 - Math.sin(lat * 0.4) * 800;
      } else {
        // Ocean Bathymetry features
        // Continental shelf (shallow < 200m near coasts)
        if (lat >= 18 && lon >= 68 && lon <= 72.8) {
          depthM = 80; // Mumbai High shelf
        } else if (lat <= 15 && lon >= 74 && lon <= 76) {
          depthM = 150; // Malabar shelf
        } else if (lat >= 16 && lon >= 82 && lon <= 86) {
          depthM = 120; // Godavari/Krishna/Mahanadi delta shelf
        } else if (lat <= 10 && lon >= 79 && lon <= 81) {
          depthM = 90; // Palk Strait / Gulf of Mannar
        } else {
          // Mid-ocean ridges
          // Carlsberg Ridge (Arabian Sea)
          const distCarlsberg = Math.abs((lat - 8) - (lon - 62) * 0.6);
          if (distCarlsberg < 2.5) depthM = 2100;

          // Ninety East Ridge (Lon ~90)
          if (Math.abs(lon - 90) < 1.2 && lat <= 18) {
            depthM = 1900;
          }

          // Chagos-Laccadive Ridge
          if (Math.abs(lon - 73) < 1.5 && lat <= 13) {
            depthM = 1600;
          }
        }
      }

      // Convert depth to Y coordinate (sea surface is 0, deep ocean is negative)
      let wy = 0;
      if (isLand) {
        wy = 0.5 + Math.min(2.5, Math.abs(depthM) / 500);
      } else {
        wy = -(depthM / 4000) * MAX_DEPTH_Y;
      }
      pos.setY(i, wy);

      // Bathymetry Color
      if (isLand) {
        // Coastal / Land earthy tone
        colors.push(0.18, 0.28, 0.18);
      } else {
        // Deep ocean blue-cyan ramp
        const normD = Math.min(1, Math.max(0, depthM / 4000));
        const rgb = interpolateColor(1 - normD, 'deep');
        colors.push(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1,
      wireframe: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    group.add(mesh);

    // Subtle bathymetric wireframe grid
    const wireGeo = new THREE.WireframeGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0369a1, transparent: true, opacity: 0.08 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.y += 0.02;
    group.add(wire);
  };

  // Build India EEZ Boundary Lines
  const buildEez = (group: THREE.Group) => {
    group.clear();

    const eezPoints = [
      [23.5, 66.8], [22.2, 65.8], [20.5, 67.2], [18.5, 68.4], [16.5, 69.5], 
      [14.5, 70.8], [12.0, 71.5], [10.0, 72.0], [8.0, 73.5], [6.5, 75.2],
      [5.5, 77.5], [5.8, 79.2], [6.8, 80.2], [8.5, 82.5],
      [10.5, 83.8], [12.5, 84.8], [14.5, 85.5], [16.5, 86.8], [18.2, 88.2], 
      [20.5, 89.2], [21.5, 88.5]
    ];

    const pts3d: THREE.Vector3[] = [];
    eezPoints.forEach(([lat, lon]) => {
      const { x, z } = lonLatToWorld(lon, lat);
      pts3d.push(new THREE.Vector3(x, 0.15, z));
    });

    const curve = new THREE.CatmullRomCurve3(pts3d);
    const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.08, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false
    });
    const eezLine = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(eezLine);

    // Lakshadweep EEZ ring
    const lakRing = [
      [12.5, 70.0], [13.2, 72.5], [12.5, 74.5], [9.5, 74.8], 
      [7.8, 73.8], [7.8, 71.2], [9.5, 69.8], [12.5, 70.0]
    ];
    const lakPts = lakRing.map(([lat, lon]) => {
      const { x, z } = lonLatToWorld(lon, lat);
      return new THREE.Vector3(x, 0.15, z);
    });
    const lakCurve = new THREE.CatmullRomCurve3(lakPts, true);
    const lakMesh = new THREE.Mesh(new THREE.TubeGeometry(lakCurve, 60, 0.06, 6, true), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
    group.add(lakMesh);

    // Andaman EEZ ring
    const andRing = [
      [14.5, 91.0], [14.5, 94.5], [12.0, 95.0], [9.0, 94.8], 
      [6.0, 94.5], [5.8, 93.0], [8.0, 91.5], [11.0, 91.2], [14.5, 91.0]
    ];
    const andPts = andRing.map(([lat, lon]) => {
      const { x, z } = lonLatToWorld(lon, lat);
      return new THREE.Vector3(x, 0.15, z);
    });
    const andCurve = new THREE.CatmullRomCurve3(andPts, true);
    const andMesh = new THREE.Mesh(new THREE.TubeGeometry(andCurve, 70, 0.06, 6, true), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    group.add(andMesh);
  };

  // Helper check for land
  const checkIsLand = (lat: number, lon: number): boolean => {
    if (lat >= 8.2 && lat <= 26 && lon >= 68 && lon <= 89) {
      if (lat <= 13 && (lon < 75.5 || lon > 80.3)) return false;
      if (lat > 13 && lat <= 20.5) {
        const west = 72.8 + (lat - 13.0) * (-0.05);
        const east = 80.0 + (lat - 13.0) * 0.9;
        if (lon < west || lon > east) return false;
      }
      return true;
    }
    // Sri Lanka
    if (lat >= 5.8 && lat <= 9.8 && lon >= 79.5 && lon <= 82.0) return true;
    // Arabian peninsula
    if (lon <= 63 && lat >= 20) return true;
    // Myanmar
    if (lon >= 94 && lat >= 16) return true;
    return false;
  };

  // Initialize Particle Flow
  const initParticleSystem = (scene: THREE.Scene) => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    particleVelocitiesRef.current = [];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * WORLD_W;
      const rz = (Math.random() - 0.5) * WORLD_H;
      positions[i * 3] = rx;
      positions[i * 3 + 1] = 0.05; // just above slice
      positions[i * 3 + 2] = rz;

      colors[i * 3] = 0.2;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1.0;

      particleVelocitiesRef.current.push({ u: 0.1, v: 0.05 });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geo, mat);
    scene.add(pSystem);
    particleSystemRef.current = pSystem;
    particlePositionsRef.current = positions;
  };

  // Update Particle System based on current velocity field
  const updateParticles = (delta: number) => {
    if (!particleSystemRef.current || !particlePositionsRef.current || !layers.showVectorParticles) {
      if (particleSystemRef.current) particleSystemRef.current.visible = false;
      return;
    }
    particleSystemRef.current.visible = true;

    const positions = particlePositionsRef.current;
    const count = positions.length / 3;

    // Current depth height
    const currentY = depthPlaneRef.current ? depthPlaneRef.current.position.y + 0.05 : 0.05;

    for (let i = 0; i < count; i++) {
      let x = positions[i * 3];
      let z = positions[i * 3 + 2];

      const { lon, lat } = worldToLonLat(x, z);

      // Default drift (Somali Jet / Monsoon flow)
      let u = 0.4;
      let v = 0.2;

      // Somali current jet
      if (lon <= 65 && lat <= 15) {
        u = 0.3;
        v = 1.4;
      } else if (lat <= 8) {
        // Equatorial eastward drift
        u = 0.9;
        v = -0.1;
      } else if (lon >= 80 && lat <= 18) {
        // BoB cyclonic
        u = -0.3;
        v = 0.4;
      }

      x += u * delta * 2.5;
      z -= v * delta * 2.5; // Z is negative North

      // Reset particle if out of boundary
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

  // Render Scalar Slice Data to Canvas Texture
  useEffect(() => {
    if (!sliceData || !sliceTextureRef.current) return;

    const canvas = sliceCanvasRef.current;
    const nLats = sliceData.n_lats;
    const nLons = sliceData.n_lons;

    canvas.width = nLons;
    canvas.height = nLats;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(nLons, nLats);
    const data = imgData.data;

    const grid = sliceData.grid;
    for (let j = 0; j < nLats; j++) {
      // NetCDF lats go from 0 (South) to 26 (North). In 2D image, row 0 is top (North).
      const latIdx = nLats - 1 - j;
      const row = grid[latIdx] || [];

      for (let i = 0; i < nLons; i++) {
        const val = row[i];
        const pixelIdx = (j * nLons + i) * 4;

        if (val === null || val === undefined) {
          // Masked / Land
          data[pixelIdx] = 0;
          data[pixelIdx + 1] = 0;
          data[pixelIdx + 2] = 0;
          data[pixelIdx + 3] = 0;
        } else {
          const norm = valMax > valMin ? (val - valMin) / (valMax - valMin) : 0.5;
          const rgb: RGB = interpolateColor(norm, palette);
          data[pixelIdx] = rgb.r;
          data[pixelIdx + 1] = rgb.g;
          data[pixelIdx + 2] = rgb.b;
          data[pixelIdx + 3] = Math.round(opacity * 255);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    sliceTextureRef.current.needsUpdate = true;
  }, [sliceData, palette, valMin, valMax, opacity]);

  // Update Depth Plane Y Position & Exaggeration
  useEffect(() => {
    if (!depthPlaneRef.current) return;
    // Map currentDepth (0 to 2000m) to Y (0 to -10) scaled by verticalExaggeration
    const normDepth = Math.min(1.0, currentDepth / 2000.0);
    const scaledExagg = (verticalExaggeration / 10.0);
    const yPos = -normDepth * MAX_DEPTH_Y * scaledExagg;

    depthPlaneRef.current.position.y = yPos;
    if (depthPlaneRef.current.material instanceof THREE.MeshStandardMaterial) {
      depthPlaneRef.current.material.opacity = opacity;
    }
  }, [currentDepth, verticalExaggeration, opacity]);

  // Update 3D Transect Curtain
  useEffect(() => {
    if (!sceneRef.current) return;

    if (!transectData || !layers.showTransectCurtain) {
      if (transectMeshRef.current) {
        transectMeshRef.current.visible = false;
      }
      return;
    }

    // Render transect curtain texture
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
            data[pixelIdx] = 0;
            data[pixelIdx + 1] = 0;
            data[pixelIdx + 2] = 0;
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

    // Reconstruct vertical curtain ribbon geometry
    if (transectMeshRef.current) {
      sceneRef.current.remove(transectMeshRef.current);
      transectMeshRef.current.geometry.dispose();
    }

    const waypoints = transectData.waypoints;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const exaggScale = verticalExaggeration / 10.0;
    const bottomY = -MAX_DEPTH_Y * exaggScale;

    // Top and bottom vertices for each waypoint
    waypoints.forEach((wp, idx) => {
      const { x, z } = lonLatToWorld(wp.lon, wp.lat);
      const u = idx / (waypoints.length - 1);

      // Top vertex (Y = 0)
      vertices.push(x, 0, z);
      uvs.push(u, 0);

      // Bottom vertex (Y = bottomY)
      vertices.push(x, bottomY, z);
      uvs.push(u, 1);
    });

    for (let i = 0; i < waypoints.length - 1; i++) {
      const top1 = i * 2;
      const bot1 = i * 2 + 1;
      const top2 = (i + 1) * 2;
      const bot2 = (i + 1) * 2 + 1;

      // Two triangles per quad
      indices.push(top1, bot1, top2);
      indices.push(top2, bot1, bot2);
      // Double side
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

  // Render 3D In-Situ Markers
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
        // Argo Buoy 3D Model: Cylinder hull + Antenna + Subsurface Tether Cable + Sensor Node
        const hullGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.6, 16);
        const hullMat = new THREE.MeshStandardMaterial({
          color: inst.has_bgc ? 0x10b981 : 0x0284c7,
          roughness: 0.3,
          metalness: 0.5
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0.25;
        markerRoot.add(hull);

        // Antenna
        const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const antMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ant = new THREE.Mesh(antGeo, antMat);
        ant.position.y = 0.75;
        markerRoot.add(ant);

        // Surface Ripple Ring
        const ringGeo = new THREE.RingGeometry(0.35, 0.45, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: inst.has_bgc ? 0x34d399 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.05;
        markerRoot.add(ring);

        // Subsurface Profiling Tether Cable down to 2000m
        const cableLength = MAX_DEPTH_Y * exaggScale;
        const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, cableLength, 6);
        const cableMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.y = -cableLength / 2;
        markerRoot.add(cable);

        // Deep CTD Sensor pod at bottom of tether
        const ctdGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const ctdMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const ctd = new THREE.Mesh(ctdGeo, ctdMat);
        ctd.position.y = -cableLength;
        markerRoot.add(ctd);

        // Trajectory line if available
        if (inst.trajectory && inst.trajectory.length > 1) {
          const trajPts = inst.trajectory.map(t => {
            const p = lonLatToWorld(t.lon, t.lat);
            return new THREE.Vector3(p.x, 0.08, p.z);
          });
          const trajGeo = new THREE.BufferGeometry().setFromPoints(trajPts);
          const trajLine = new THREE.Line(trajGeo, new THREE.LineDashedMaterial({ color: 0x06b6d4, dashSize: 0.3, gapSize: 0.15 }));
          trajLine.computeLineDistances();
          group.add(trajLine);
        }

      } else if (isGlider) {
        // Underwater Glider: Winged Fuselage + Sawtooth Path
        const bodyGeo = new THREE.ConeGeometry(0.18, 0.9, 12);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);

        // Wings
        const wingGeo = new THREE.BoxGeometry(0.9, 0.02, 0.2);
        const wing = new THREE.Mesh(wingGeo, bodyMat);
        body.add(wing);

        // Position glider at current depth
        const gliderDepthM = inst.depth || 340;
        const gliderY = -(gliderDepthM / 2000) * MAX_DEPTH_Y * exaggScale;
        body.position.y = gliderY;
        markerRoot.add(body);

        // Surface beacon float
        const beaconGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = 0.2;
        markerRoot.add(beacon);

        // 3D Sawtooth dive track ribbon
        if (inst.sawtooth_track && inst.sawtooth_track.length > 1) {
          const trackPts = inst.sawtooth_track.map(st => {
            const p = lonLatToWorld(st.lon, st.lat);
            const y = -( (st.depth || 0) / 2000) * MAX_DEPTH_Y * exaggScale;
            return new THREE.Vector3(p.x, y, p.z);
          });
          const trackCurve = new THREE.CatmullRomCurve3(trackPts);
          const trackTube = new THREE.TubeGeometry(trackCurve, 80, 0.04, 6, false);
          const trackMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 });
          const trackMesh = new THREE.Mesh(trackTube, trackMat);
          group.add(trackMesh);
        }

      } else if (isBuoy) {
        // Moored OMNI Buoy: Toroid hull + Met Mast + Mooring Anchor line
        const buoyGeo = new THREE.TorusGeometry(0.35, 0.14, 12, 24);
        buoyGeo.rotateX(Math.PI / 2);
        const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
        const buoy = new THREE.Mesh(buoyGeo, buoyMat);
        buoy.position.y = 0.15;
        markerRoot.add(buoy);

        // Met mast
        const mastGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.8, 8);
        const mastMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.y = 0.55;
        markerRoot.add(mast);

        // Mooring line to seafloor
        const mooringLength = MAX_DEPTH_Y * exaggScale * 0.9;
        const moorGeo = new THREE.CylinderGeometry(0.01, 0.01, mooringLength, 4);
        const moorMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 });
        const moor = new THREE.Mesh(moorGeo, moorMat);
        moor.position.y = -mooringLength / 2;
        markerRoot.add(moor);
      }

      // Invisible hit sphere for easy clicking
      const hitGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 0.2;
      markerRoot.add(hitMesh);

      markerMeshMap.current.set(hitMesh, inst);
      group.add(markerRoot);
    });
  }, [instruments, layers.showArgo, layers.showGliders, layers.showBuoys, verticalExaggeration]);

  // Update Layer Visibility
  useEffect(() => {
    if (depthPlaneRef.current) depthPlaneRef.current.visible = layers.showModelSlice;
    if (bathymetryGroupRef.current) bathymetryGroupRef.current.visible = layers.showBathymetry;
    if (eezGroupRef.current) eezGroupRef.current.visible = layers.showEez;
    if (transectMeshRef.current) transectMeshRef.current.visible = layers.showTransectCurtain;
  }, [layers]);

  // Raycasting for Clicks and Hovers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Check platform markers
    const hitMeshes = Array.from(markerMeshMap.current.keys());
    const intersects = raycaster.intersectObjects(hitMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const platform = markerMeshMap.current.get(hit);
      if (platform) {
        onSelectPlatform(platform);
      }
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
      const pt = intersects[0].point;
      const { lon, lat } = worldToLonLat(pt.x, pt.z);
      onHoverPoint({
        lat: Number(lat.toFixed(2)),
        lon: Number(lon.toFixed(2)),
        depth: currentDepth,
        val: null
      });
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
