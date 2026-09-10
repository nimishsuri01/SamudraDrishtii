"""
In-situ Observation Manager for Argo Floats, Underwater Gliders, and Moored Buoys.
Handles tabular ASCII parsing, JSON ingestion, and platform spatial queries.
"""

import os
import json
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class InSituManager:
    def __init__(self):
        self.argo_floats: List[Dict[str, Any]] = []
        self.gliders: List[Dict[str, Any]] = []
        self.buoys: List[Dict[str, Any]] = []
        self.load_all()

    def load_all(self):
        argo_path = os.path.join(DATA_DIR, "insitu_argo.json")
        if os.path.exists(argo_path):
            with open(argo_path, "r") as f:
                self.argo_floats = json.load(f)

        glider_path = os.path.join(DATA_DIR, "insitu_gliders.json")
        if os.path.exists(glider_path):
            with open(glider_path, "r") as f:
                self.gliders = json.load(f)

        buoy_path = os.path.join(DATA_DIR, "insitu_buoys.json")
        if os.path.exists(buoy_path):
            with open(buoy_path, "r") as f:
                self.buoys = json.load(f)

    def get_all_platforms(self) -> List[Dict[str, Any]]:
        """Return summary of all active in-situ platforms for 3D map markers."""
        markers = []
        # Argo
        for a in self.argo_floats:
            markers.append({
                "id": a["id"],
                "wmo": a["wmo"],
                "category": "argo",
                "name": f"Argo Float {a['wmo']}",
                "type": a["type"],
                "lat": a["lat"],
                "lon": a["lon"],
                "basin": a["basin"],
                "status": a["status"],
                "sensor": a.get("sensor", "CTD"),
                "date": a.get("date", "2026-09-04"),
                "cycle": a.get("cycle_number", 1),
                "has_bgc": "BGC" in a["type"],
                "trajectory": a.get("trajectory", [])
            })

        # Gliders
        for g in self.gliders:
            markers.append({
                "id": g["id"],
                "category": "glider",
                "name": g["name"],
                "type": g["platform_type"],
                "lat": g["current_lat"],
                "lon": g["current_lon"],
                "depth": g["current_depth"],
                "status": g["status"],
                "dive_number": g["dive_number"],
                "battery": g["battery_level"],
                "sawtooth_track": g.get("sawtooth_track", []),
                "waypoints": g.get("waypoints", [])
            })

        # Buoys
        for b in self.buoys:
            markers.append({
                "id": b["id"],
                "category": "buoy",
                "name": b["name"],
                "type": b["type"],
                "network": b["network"],
                "lat": b["lat"],
                "lon": b["lon"],
                "sst": b["sst"],
                "sss": b["sss"],
                "wind_speed": b["wind_speed_ms"],
                "sea_state": b["sea_state"]
            })

        return markers

    def get_platform_by_id(self, platform_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full details of an in-situ platform by ID."""
        for a in self.argo_floats:
            if a["id"] == platform_id:
                return a
        for g in self.gliders:
            if g["id"] == platform_id:
                return g
        for b in self.buoys:
            if b["id"] == platform_id:
                return b
        return None

    def parse_ascii_profile(self, content: str) -> Dict[str, Any]:
        """
        Parse raw WMO Argo or CTD ASCII text format into structured profile.
        Format typically contains header comments '#' followed by numeric columns:
        PRES TEMP PSAL DOXY QC
        """
        lines = content.strip().split("\n")
        metadata = {}
        data_rows = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            if line_str.startswith("#"):
                # Header comment line
                parts = line_str[1:].strip().split(":", 1)
                if len(parts) == 2:
                    key = parts[0].strip().lower().replace(" ", "_")
                    val = parts[1].strip()
                    metadata[key] = val
            else:
                # Numerical row
                tokens = line_str.split()
                if len(tokens) >= 3:
                    try:
                        pres = float(tokens[0])
                        temp = float(tokens[1])
                        sal = float(tokens[2])
                        doxy = float(tokens[3]) if len(tokens) > 3 else None
                        qc = int(tokens[4]) if len(tokens) > 4 else 1

                        # Approximate depth in meters from dbar: depth ~ pres / 1.01
                        depth = int(pres / 1.01)

                        data_rows.append({
                            "depth": depth,
                            "pressure_dbar": int(pres),
                            "temperature": temp,
                            "salinity": sal,
                            "dissolved_oxygen": doxy,
                            "qc_flag": qc
                        })
                    except ValueError:
                        continue

        return {
            "metadata": metadata,
            "profile": data_rows,
            "count": len(data_rows)
        }

insitu_manager = InSituManager()
