export interface VariableMeta {
  id: string;
  label: string;
  units: string;
  palette: string;
  min: number;
  max: number;
  description: string;
}

export interface ModelMetadata {
  title: string;
  institution: string;
  source: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  latitudes: number[];
  longitudes: number[];
  depths: number[];
  times: string[];
  variables: VariableMeta[];
}

export interface SliceData {
  variable: string;
  depth: number;
  depth_idx: number;
  time_idx: number;
  min: number;
  max: number;
  grid: (number | null)[][];
  vector_u?: (number | null)[][];
  vector_v?: (number | null)[][];
  vector_step?: number;
  n_lats: number;
  n_lons: number;
}

export interface TransectData {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  total_distance_km: number;
  distances: number[];
  depths: number[];
  variable: string;
  curtain: (number | null)[][];
  waypoints: { lat: number; lon: number }[];
}

export interface TrajectoryPoint {
  lat: number;
  lon: number;
  date?: string;
  time?: string;
  depth?: number;
  cycle?: number;
}

export interface ProfileMeasurement {
  depth: number;
  temperature?: number | null;
  salinity?: number | null;
  chlorophyll?: number | null;
  dissolved_oxygen?: number | null;
  pressure_dbar?: number;
  qc_flag?: number;
}

export interface InstrumentMarker {
  id: string;
  wmo?: string;
  category: "argo" | "glider" | "buoy";
  name: string;
  type: string;
  lat: number;
  lon: number;
  depth?: number;
  basin?: string;
  status: string;
  sensor?: string;
  date?: string;
  cycle?: number;
  has_bgc?: boolean;
  battery?: number;
  dive_number?: number;
  network?: string;
  sst?: number;
  sss?: number;
  wind_speed?: number;
  sea_state?: string;
  trajectory?: TrajectoryPoint[];
  sawtooth_track?: TrajectoryPoint[];
  waypoints?: { lat: number; lon: number }[];
}

export interface AlignedProfilePoint {
  depth: number;
  obs_temperature?: number | null;
  model_temperature?: number | null;
  temp_difference?: number | null;
  obs_salinity?: number | null;
  model_salinity?: number | null;
  sal_difference?: number | null;
  obs_chlorophyll?: number | null;
  model_chlorophyll?: number | null;
}

export interface ValidationMetricSet {
  n_samples?: number;
  rmse?: number;
  mean_bias?: number;
  mae?: number;
  pearson_r?: number;
  willmott_skill?: number;
  model_mean?: number;
  obs_mean?: number;
}

export interface ValidationResult {
  platform_id: string;
  platform_name: string;
  category: string;
  coordinates: { lat: number; lon: number };
  timestamp: string;
  aligned_profile: AlignedProfilePoint[];
  metrics: {
    temperature: ValidationMetricSet;
    salinity: ValidationMetricSet;
    chlorophyll: ValidationMetricSet;
  };
}

export interface PfzZone {
  zone_id: string;
  sector: string;
  lat: number;
  lon: number;
  sst_gradient: string;
  chlorophyll_mg_m3: number;
  confidence: string;
  target_species: string;
  valid_till: string;
  depth_range: string;
  coordinates: { lat: number; lon: number }[];
}

export interface MhwAlert {
  region: string;
  lat: number;
  lon: number;
  category: string;
  sst_anomaly_c: string;
  duration_days: number;
  coral_bleaching_alert: string;
  severity_index: number;
}

export interface SarDriftResult {
  origin: { lat: number; lon: number };
  duration_hours: number;
  final_datum: { hour: number; lat: number; lon: number; radius_nm: number };
  trajectory: { hour: number; lat: number; lon: number; radius_nm: number }[];
  recommended_search_pattern: string;
}

export interface ViewportLayers {
  showModelSlice: boolean;
  showBathymetry: boolean;
  showEez: boolean;
  showVectorParticles: boolean;
  showArgo: boolean;
  showGliders: boolean;
  showBuoys: boolean;
  showTransectCurtain: boolean;
  showPfzFronts: boolean;
  showTchpLayer: boolean;
}
