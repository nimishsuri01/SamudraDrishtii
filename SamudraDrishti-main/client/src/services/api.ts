import { ModelMetadata, SliceData, TransectData, InstrumentMarker, ValidationResult, PfzZone, MhwAlert, SarDriftResult } from '../types/ocean';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '') : '') + '/api';

export async function fetchMetadata(): Promise<ModelMetadata> {
  const res = await fetch(`${API_BASE}/metadata`);
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`);
  return res.json();
}

export async function fetchSlice(variable: string = 'thetao', depthIdx: number = 0, timeIdx: number = 0): Promise<SliceData> {
  const res = await fetch(`${API_BASE}/slice?variable=${encodeURIComponent(variable)}&depth_idx=${depthIdx}&time_idx=${timeIdx}`);
  if (!res.ok) throw new Error(`Failed to fetch slice: ${res.statusText}`);
  return res.json();
}

export async function fetchTransect(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  variable: string = 'thetao',
  timeIdx: number = 0
): Promise<TransectData> {
  const res = await fetch(
    `${API_BASE}/transect?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&variable=${encodeURIComponent(variable)}&time_idx=${timeIdx}`
  );
  if (!res.ok) throw new Error(`Failed to fetch transect: ${res.statusText}`);
  return res.json();
}

export async function fetchInstruments(): Promise<InstrumentMarker[]> {
  const res = await fetch(`${API_BASE}/instruments`);
  if (!res.ok) throw new Error(`Failed to fetch instruments: ${res.statusText}`);
  return res.json();
}

export async function fetchInstrumentDetail(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/instruments/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch platform details: ${res.statusText}`);
  return res.json();
}

export async function validatePlatform(id: string, timeIdx: number = 0): Promise<ValidationResult> {
  const res = await fetch(`${API_BASE}/validate/${encodeURIComponent(id)}?time_idx=${timeIdx}`);
  if (!res.ok) throw new Error(`Failed to validate platform: ${res.statusText}`);
  return res.json();
}

export async function fetchTchp(timeIdx: number = 0): Promise<any> {
  const res = await fetch(`${API_BASE}/advisories/tchp?time_idx=${timeIdx}`);
  if (!res.ok) throw new Error(`Failed to fetch TCHP advisory: ${res.statusText}`);
  return res.json();
}

export async function fetchPfz(timeIdx: number = 0): Promise<PfzZone[]> {
  const res = await fetch(`${API_BASE}/advisories/pfz?time_idx=${timeIdx}`);
  if (!res.ok) throw new Error(`Failed to fetch PFZ zones: ${res.statusText}`);
  return res.json();
}

export async function fetchMhw(): Promise<MhwAlert[]> {
  const res = await fetch(`${API_BASE}/advisories/mhw`);
  if (!res.ok) throw new Error(`Failed to fetch MHW alerts: ${res.statusText}`);
  return res.json();
}

export async function simulateSarDrift(lat: number, lon: number, hours: number = 48): Promise<SarDriftResult> {
  const res = await fetch(`${API_BASE}/advisories/sar-drift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_lat: lat, start_lon: lon, hours })
  });
  if (!res.ok) throw new Error(`Failed to simulate SAR drift: ${res.statusText}`);
  return res.json();
}

export async function uploadDatasetFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}
