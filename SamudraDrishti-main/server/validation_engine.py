"""
Model vs In-Situ Observation Validation Engine.
Co-locates numerical model fields with in-situ Argo, Glider, and Buoy measurements,
aligns depth layers, and computes oceanographic statistical validation metrics (RMSE, Bias, Pearson r).
"""

import numpy as np
from typing import Dict, Any, List
from data_manager import data_manager
from insitu_manager import insitu_manager

class ValidationEngine:
    def validate_platform(self, platform_id: str, time_idx: int = 0) -> Dict[str, Any]:
        platform = insitu_manager.get_platform_by_id(platform_id)
        if not platform:
            raise ValueError(f"Platform {platform_id} not found.")

        # Lat/Lon extraction
        lat = platform.get("lat") or platform.get("current_lat")
        lon = platform.get("lon") or platform.get("current_lon")

        # In-situ observed profile
        obs_profile = platform.get("profile", [])
        if not obs_profile and "thermistor_chain" in platform:
            obs_profile = platform["thermistor_chain"]

        if not obs_profile:
            return {"error": "No profile measurements found for platform."}

        # Model profile extraction at exact coordinates
        model_result = data_manager.extract_point_profile(lat, lon, time_idx=time_idx)
        model_profile = model_result["profile"]

        if not model_profile:
            return {"error": "Could not interpolate model profile at platform coordinates."}

        # Interpolate and co-locate at observation depths
        model_depths = np.array([p["depth"] for p in model_profile])
        model_temps = np.array([p["model_temperature"] for p in model_profile])
        model_sals = np.array([p["model_salinity"] for p in model_profile])
        model_chls = np.array([p["model_chlorophyll"] for p in model_profile])

        # Filter observation points within model depth range
        max_depth = float(np.max(model_depths))
        aligned_data = []

        obs_t_list, mod_t_list = [], []
        obs_s_list, mod_s_list = [], []
        obs_c_list, mod_c_list = [], []

        for pt in obs_profile:
            z = float(pt["depth"])
            if z > max_depth:
                continue

            t_obs = pt.get("temperature")
            s_obs = pt.get("salinity")
            c_obs = pt.get("chlorophyll")

            # Interpolate model values at exact depth z
            t_mod = float(np.interp(z, model_depths, model_temps))
            s_mod = float(np.interp(z, model_depths, model_sals))
            c_mod = float(np.interp(z, model_depths, model_chls))

            row = {
                "depth": z,
                "obs_temperature": t_obs,
                "model_temperature": round(t_mod, 3),
                "temp_difference": round(t_mod - t_obs, 3) if t_obs is not None else None,
                "obs_salinity": s_obs,
                "model_salinity": round(s_mod, 3),
                "sal_difference": round(s_mod - s_obs, 3) if s_obs is not None else None,
                "obs_chlorophyll": c_obs,
                "model_chlorophyll": round(c_mod, 3) if c_obs is not None else None
            }
            aligned_data.append(row)

            if t_obs is not None:
                obs_t_list.append(t_obs)
                mod_t_list.append(t_mod)
            if s_obs is not None:
                obs_s_list.append(s_obs)
                mod_s_list.append(s_mod)
            if c_obs is not None:
                obs_c_list.append(c_obs)
                mod_c_list.append(c_mod)

        # Compute statistics for Temperature
        stats_temp = self._calculate_metrics(np.array(mod_t_list), np.array(obs_t_list)) if obs_t_list else {}
        # Compute statistics for Salinity
        stats_sal = self._calculate_metrics(np.array(mod_s_list), np.array(obs_s_list)) if obs_s_list else {}
        # Compute statistics for Chlorophyll
        stats_chl = self._calculate_metrics(np.array(mod_c_list), np.array(obs_c_list)) if obs_c_list else {}

        return {
            "platform_id": platform_id,
            "platform_name": platform.get("name") or platform.get("id"),
            "category": platform.get("category") or platform.get("type"),
            "coordinates": {"lat": lat, "lon": lon},
            "timestamp": platform.get("date", "2026-09-04"),
            "aligned_profile": aligned_data,
            "metrics": {
                "temperature": stats_temp,
                "salinity": stats_sal,
                "chlorophyll": stats_chl
            }
        }

    def _calculate_metrics(self, mod: np.ndarray, obs: np.ndarray) -> Dict[str, Any]:
        if len(mod) == 0 or len(obs) == 0:
            return {}

        diff = mod - obs
        rmse = float(np.sqrt(np.mean(diff ** 2)))
        bias = float(np.mean(diff))
        mae = float(np.mean(np.abs(diff)))

        # Pearson correlation
        if len(mod) > 2 and np.std(mod) > 1e-6 and np.std(obs) > 1e-6:
            r = float(np.corrcoef(mod, obs)[0, 1])
        else:
            r = 1.0

        # Skill score (Willmott index of agreement d: 0 to 1)
        denom = np.sum((np.abs(mod - np.mean(obs)) + np.abs(obs - np.mean(obs))) ** 2)
        if denom > 1e-6:
            willmott = float(1.0 - (np.sum(diff ** 2) / denom))
        else:
            willmott = 1.0

        return {
            "n_samples": len(mod),
            "rmse": round(rmse, 3),
            "mean_bias": round(bias, 3),
            "mae": round(mae, 3),
            "pearson_r": round(r, 4),
            "willmott_skill": round(max(0.0, willmott), 3),
            "model_mean": round(float(np.mean(mod)), 2),
            "obs_mean": round(float(np.mean(obs)), 2)
        }

validation_engine = ValidationEngine()
