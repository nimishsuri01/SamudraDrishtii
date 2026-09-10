"""
Data Manager for NetCDF-4 and xarray model outputs.
Supports CF-compliant coordinate detection, 2D horizontal slice extraction,
3D-to-2D vertical transect curtain slicing, and 1D profile interpolation.
"""

import os
import glob
import numpy as np
import xarray as xr
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DEFAULT_NC_PATH = os.path.join(DATA_DIR, "incois_ocean_model.nc")

class OceanDataManager:
    def __init__(self, nc_path: str = DEFAULT_NC_PATH):
        self.nc_path = nc_path
        self.ds: Optional[xr.Dataset] = None
        self.coord_map: Dict[str, str] = {}
        self.var_info: Dict[str, Any] = {}
        self.load_dataset(nc_path)

    def load_dataset(self, path: str):
        if not os.path.exists(path):
            raise FileNotFoundError(f"NetCDF file not found: {path}")

        self.nc_path = path
        # Open with xarray (using netcdf4 engine)
        self.ds = xr.open_dataset(path, decode_times=False)
        self._detect_coordinates()
        self._analyze_variables()

    def _detect_coordinates(self):
        """Auto-detect standard coordinate names matching CF conventions."""
        self.coord_map = {}
        # Lat
        for name in ["lat", "latitude", "nav_lat", "y"]:
            if name in self.ds.coords or name in self.ds.dims:
                self.coord_map["lat"] = name
                break
        # Lon
        for name in ["lon", "longitude", "nav_lon", "x"]:
            if name in self.ds.coords or name in self.ds.dims:
                self.coord_map["lon"] = name
                break
        # Depth
        for name in ["depth", "lev", "level", "z", "deptht"]:
            if name in self.ds.coords or name in self.ds.dims:
                self.coord_map["depth"] = name
                break
        # Time
        for name in ["time", "t", "time_counter"]:
            if name in self.ds.coords or name in self.ds.dims:
                self.coord_map["time"] = name
                break

    def _analyze_variables(self):
        """Extract variable metadata, units, and ranges."""
        self.var_info = {}
        for var_name, da in self.ds.data_vars.items():
            # Skip coordinate variables
            if var_name in self.coord_map.values():
                continue
            
            units = da.attrs.get("units", "dimensionless")
            long_name = da.attrs.get("long_name", var_name)
            standard_name = da.attrs.get("standard_name", var_name)
            
            # Identify variable category
            is_3d = "depth" in [self.coord_map.get(k) for k in ["depth"]] and self.coord_map.get("depth") in da.dims
            
            self.var_info[var_name] = {
                "name": var_name,
                "long_name": long_name,
                "standard_name": standard_name,
                "units": units,
                "dims": list(da.dims),
                "shape": list(da.shape),
                "is_3d": is_3d
            }

    def get_metadata(self) -> Dict[str, Any]:
        """Return dataset metadata for client consumption."""
        lat_coord = self.ds[self.coord_map["lat"]].values
        lon_coord = self.ds[self.coord_map["lon"]].values
        
        depths = []
        if "depth" in self.coord_map and self.coord_map["depth"] in self.ds:
            depths = [float(d) for d in self.ds[self.coord_map["depth"]].values]

        times = []
        if "time" in self.coord_map and self.coord_map["time"] in self.ds:
            t_vals = self.ds[self.coord_map["time"]].values
            # Return string representations
            times = [f"Step {int(t)} (2026-09-0{int(t)+1})" for t in t_vals]

        # Friendly variable definitions
        friendly_vars = [
            {
                "id": "thetao",
                "label": "Potential Temperature",
                "units": "°C",
                "palette": "thermal",
                "min": 2.0,
                "max": 31.0,
                "description": "3D sea water potential temperature throughout the water column."
            },
            {
                "id": "so",
                "label": "Practical Salinity",
                "units": "PSU",
                "palette": "haline",
                "min": 28.0,
                "max": 37.0,
                "description": "3D salinity capturing Arabian Sea high salinity vs Bay of Bengal river runoff."
            },
            {
                "id": "velocity",
                "label": "Current Velocity (Magnitude)",
                "units": "m/s",
                "palette": "speed",
                "min": 0.0,
                "max": 1.6,
                "description": "Horizontal current speed derived from zonal (u) and meridional (v) velocity."
            },
            {
                "id": "chl",
                "label": "Chlorophyll-a",
                "units": "mg/m³",
                "palette": "algae",
                "min": 0.01,
                "max": 3.5,
                "description": "Biogeochemical chlorophyll-a indicator for primary productivity."
            },
            {
                "id": "wo",
                "label": "Vertical Velocity (Upwelling)",
                "units": "10⁻⁴ m/s",
                "palette": "balance",
                "min": -1.0,
                "max": 1.5,
                "description": "Upward / downward vertical motion marking coastal upwelling cells."
            },
            {
                "id": "zos",
                "label": "Sea Surface Height",
                "units": "m",
                "palette": "deep",
                "min": -0.3,
                "max": 0.3,
                "description": "Dynamic sea surface height above geoid."
            }
        ]

        return {
            "title": getattr(self.ds, "title", "Ocean Model Output"),
            "institution": getattr(self.ds, "institution", "INCOIS"),
            "source": getattr(self.ds, "source", "Numerical Ocean Model"),
            "bounds": {
                "minLat": float(np.min(lat_coord)),
                "maxLat": float(np.max(lat_coord)),
                "minLon": float(np.min(lon_coord)),
                "maxLon": float(np.max(lon_coord)),
            },
            "latitudes": [float(x) for x in lat_coord],
            "longitudes": [float(x) for x in lon_coord],
            "depths": depths,
            "times": times,
            "variables": friendly_vars,
            "raw_variables": self.var_info
        }

    def get_slice(self, variable: str, depth_idx: int = 0, time_idx: int = 0) -> Dict[str, Any]:
        """
        Extract a 2D horizontal slice of a variable at given depth and time index.
        Returns a 2D array with nulls for land, plus vector components if requested.
        """
        lat_coord = self.ds[self.coord_map["lat"]].values
        lon_coord = self.ds[self.coord_map["lon"]].values
        depth_val = float(self.ds[self.coord_map["depth"]].values[depth_idx]) if "depth" in self.coord_map else 0.0

        if variable == "velocity":
            # Compute speed = sqrt(u^2 + v^2)
            u_arr = self.ds["uo"].isel({self.coord_map["time"]: time_idx, self.coord_map["depth"]: depth_idx}).values
            v_arr = self.ds["vo"].isel({self.coord_map["time"]: time_idx, self.coord_map["depth"]: depth_idx}).values
            
            mask = (u_arr > 1e10) | np.isnan(u_arr)
            speed = np.sqrt(u_arr**2 + v_arr**2)
            speed[mask] = np.nan

            # Downsample vector field for client particle rendering
            step = 2
            u_down = u_arr[::step, ::step].copy()
            v_down = v_arr[::step, ::step].copy()
            u_down[u_down > 1e10] = np.nan
            v_down[v_down > 1e10] = np.nan

            grid_clean = np.where(np.isnan(speed), None, np.round(speed, 3)).tolist()
            u_clean = np.where(np.isnan(u_down), None, np.round(u_down, 3)).tolist()
            v_clean = np.where(np.isnan(v_down), None, np.round(v_down, 3)).tolist()

            valid_vals = speed[~mask]
            min_val = float(np.min(valid_vals)) if len(valid_vals) > 0 else 0.0
            max_val = float(np.max(valid_vals)) if len(valid_vals) > 0 else 1.0

            return {
                "variable": "velocity",
                "depth": depth_val,
                "depth_idx": depth_idx,
                "time_idx": time_idx,
                "min": min_val,
                "max": max_val,
                "grid": grid_clean,
                "vector_u": u_clean,
                "vector_v": v_clean,
                "vector_step": step,
                "n_lats": len(lat_coord),
                "n_lons": len(lon_coord)
            }
        
        elif variable == "zos":
            # 2D surface field
            arr = self.ds["zos"].isel({self.coord_map["time"]: time_idx}).values
            mask = (arr > 1e10) | np.isnan(arr)
            arr_masked = arr.copy()
            arr_masked[mask] = np.nan

            valid_vals = arr_masked[~mask]
            min_val = float(np.min(valid_vals)) if len(valid_vals) > 0 else -0.3
            max_val = float(np.max(valid_vals)) if len(valid_vals) > 0 else 0.3

            return {
                "variable": "zos",
                "depth": 0.0,
                "depth_idx": 0,
                "time_idx": time_idx,
                "min": min_val,
                "max": max_val,
                "grid": np.where(np.isnan(arr_masked), None, np.round(arr_masked, 3)).tolist(),
                "n_lats": len(lat_coord),
                "n_lons": len(lon_coord)
            }
        
        else:
            # Standard 3D scalar variable (thetao, so, chl, wo)
            var_name = variable
            if var_name not in self.ds:
                var_name = "thetao"
            
            da = self.ds[var_name].isel({self.coord_map["time"]: time_idx, self.coord_map["depth"]: depth_idx})
            arr = da.values
            mask = (arr > 1e10) | np.isnan(arr)
            arr_masked = arr.copy()
            arr_masked[mask] = np.nan

            # For vertical velocity wo, scale to 10^-4 m/s for display
            if var_name == "wo":
                arr_masked = arr_masked * 1e4

            valid_vals = arr_masked[~mask]
            min_val = float(np.min(valid_vals)) if len(valid_vals) > 0 else 0.0
            max_val = float(np.max(valid_vals)) if len(valid_vals) > 0 else 1.0

            return {
                "variable": variable,
                "depth": depth_val,
                "depth_idx": depth_idx,
                "time_idx": time_idx,
                "min": float(np.round(min_val, 2)),
                "max": float(np.round(max_val, 2)),
                "grid": np.where(np.isnan(arr_masked), None, np.round(arr_masked, 3)).tolist(),
                "n_lats": len(lat_coord),
                "n_lons": len(lon_coord)
            }

    def get_transect(self, lat1: float, lon1: float, lat2: float, lon2: float, 
                     variable: str = "thetao", time_idx: int = 0, n_points: int = 40) -> Dict[str, Any]:
        """
        Sample the 3D field along a great-circle / straight transect path across all depths
        to construct a 2D vertical cross-section curtain.
        """
        lats_line = np.linspace(lat1, lat2, n_points)
        lons_line = np.linspace(lon1, lon2, n_points)
        depths = self.ds[self.coord_map["depth"]].values
        
        # Calculate cumulative distance in kilometers
        # Haversine distance
        R = 6371.0 # Earth radius km
        dlat = np.radians(np.diff(lats_line))
        dlon = np.radians(np.diff(lons_line))
        lat_m = np.radians((lats_line[:-1] + lats_line[1:]) / 2.0)
        seg_dists = R * np.sqrt(dlat**2 + (np.cos(lat_m) * dlon)**2)
        cum_dist = np.concatenate([[0.0], np.cumsum(seg_dists)])

        # Vectorized interpolation along transect path in a single xarray call
        var_name = "thetao" if variable not in self.ds else variable
        da = self.ds[var_name].isel({self.coord_map["time"]: time_idx})

        lat_da = xr.DataArray(lats_line, dims="points")
        lon_da = xr.DataArray(lons_line, dims="points")
        sampled = da.interp({
            self.coord_map["lat"]: lat_da,
            self.coord_map["lon"]: lon_da
        }).values # shape: (n_depths, n_points)

        if variable == "wo":
            sampled = sampled * 1e4

        curtain = []
        for d_idx in range(len(depths)):
            row = []
            for pt_idx in range(n_points):
                val = sampled[d_idx, pt_idx]
                if np.isnan(val) or val > 1e10:
                    row.append(None)
                else:
                    row.append(round(float(val), 2))
            curtain.append(row)

        return {
            "start": {"lat": lat1, "lon": lon1},
            "end": {"lat": lat2, "lon": lon2},
            "total_distance_km": float(np.round(cum_dist[-1], 1)),
            "distances": [float(np.round(d, 1)) for d in cum_dist],
            "depths": [float(d) for d in depths],
            "variable": variable,
            "curtain": curtain,
            "waypoints": [{"lat": round(lats_line[i], 2), "lon": round(lons_line[i], 2)} for i in range(n_points)]
        }

    def extract_point_profile(self, lat: float, lon: float, time_idx: int = 0) -> Dict[str, Any]:
        """
        Extract 1D vertical water-column profile at exact lat/lon for validation.
        """
        depths = self.ds[self.coord_map["depth"]].values
        profile_data = []

        for d_idx, d in enumerate(depths):
            t_val = float(self.ds["thetao"].isel({
                self.coord_map["time"]: time_idx,
                self.coord_map["depth"]: d_idx
            }).interp({
                self.coord_map["lat"]: lat,
                self.coord_map["lon"]: lon
            }).values)

            s_val = float(self.ds["so"].isel({
                self.coord_map["time"]: time_idx,
                self.coord_map["depth"]: d_idx
            }).interp({
                self.coord_map["lat"]: lat,
                self.coord_map["lon"]: lon
            }).values)

            c_val = float(self.ds["chl"].isel({
                self.coord_map["time"]: time_idx,
                self.coord_map["depth"]: d_idx
            }).interp({
                self.coord_map["lat"]: lat,
                self.coord_map["lon"]: lon
            }).values)

            if not np.isnan(t_val) and t_val < 1e10:
                profile_data.append({
                    "depth": float(d),
                    "model_temperature": round(t_val, 3),
                    "model_salinity": round(s_val, 3),
                    "model_chlorophyll": round(c_val, 3)
                })

        return {
            "lat": lat,
            "lon": lon,
            "time_idx": time_idx,
            "profile": profile_data
        }

# Singleton instance
data_manager = OceanDataManager()
