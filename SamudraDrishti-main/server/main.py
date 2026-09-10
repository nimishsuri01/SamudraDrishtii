"""
FastAPI Server for SamudraDrishti 3D Ocean Visualization Platform.
Operational Oceanographic Digital Twin & In-Situ Observation Service.
"""

import os
import sys
import shutil

# Ensure server package directory is on path
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from data_manager import data_manager
from insitu_manager import insitu_manager
from validation_engine import validation_engine
from advisory_engine import advisory_engine
from eez_data import get_eez_geojson

app = FastAPI(
    title="SamudraDrishti API",
    description="3D Ocean Digital Twin & In-Situ Observation Service",
    version="2.4.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SarRequest(BaseModel):
    start_lat: float
    start_lon: float
    hours: int = 48

@app.get("/api/info")
def root_info():
    return {
        "system": "SamudraDrishti",
        "domain": "Oceanographic Digital Twin & Observation System",
        "version": "2.4.0",
        "status": "Operational",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "SamudraDrishti Backend Engine"}

@app.get("/api/metadata")
def get_metadata():
    """Returns grid dimensions, coordinate ranges, variable inventory."""
    return data_manager.get_metadata()

@app.get("/api/slice")
def get_slice(
    variable: str = Query("thetao", description="Variable ID (thetao, so, velocity, chl, wo, zos)"),
    depth_idx: int = Query(0, ge=0, description="Vertical depth level index"),
    time_idx: int = Query(0, ge=0, description="Temporal time step index")
):
    """Returns 2D grid slice of ocean model field at requested depth and time."""
    try:
        return data_manager.get_slice(variable, depth_idx=depth_idx, time_idx=time_idx)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transect")
def get_transect(
    lat1: float = Query(13.0, description="Start latitude"),
    lon1: float = Query(80.2, description="Start longitude"),
    lat2: float = Query(11.6, description="End latitude"),
    lon2: float = Query(92.7, description="End longitude"),
    variable: str = Query("thetao", description="Variable to slice"),
    time_idx: int = Query(0, ge=0)
):
    """Returns 2D vertical depth cross-section curtain between two coordinates."""
    try:
        return data_manager.get_transect(lat1, lon1, lat2, lon2, variable=variable, time_idx=time_idx)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/instruments")
def get_instruments():
    """Returns all active in-situ observation platforms (Argo, Gliders, Moored Buoys)."""
    return insitu_manager.get_all_platforms()

@app.get("/api/instruments/{platform_id}")
def get_instrument_detail(platform_id: str):
    """Returns full platform specifications, cycle trajectory, and deep profile."""
    item = insitu_manager.get_platform_by_id(platform_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Platform {platform_id} not found.")
    return item

@app.get("/api/validate/{platform_id}")
def validate_platform(
    platform_id: str,
    time_idx: int = Query(0, ge=0)
):
    """Co-locates numerical model with in-situ observation and calculates RMSE, Bias, and Pearson r."""
    try:
        return validation_engine.validate_platform(platform_id, time_idx=time_idx)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/advisories/tchp")
def get_tchp(time_idx: int = Query(0, ge=0)):
    """Tropical Cyclone Heat Potential (TCHP) & D26 isotherm depth."""
    return advisory_engine.compute_tchp(time_idx=time_idx)

@app.get("/api/advisories/pfz")
def get_pfz(time_idx: int = Query(0, ge=0)):
    """Potential Fishing Zones (PFZ) advisory thermal fronts."""
    return advisory_engine.compute_pfz_advisory(time_idx=time_idx)

@app.get("/api/advisories/mhw")
def get_mhw():
    """Marine Heatwave (MHW) thermal stress warning regions."""
    return advisory_engine.compute_mhw_alerts()

@app.post("/api/advisories/sar-drift")
def simulate_sar(req: SarRequest):
    """Search & Rescue (SAR) maritime drift simulation."""
    return advisory_engine.simulate_sar_drift(req.start_lat, req.start_lon, hours=req.hours)

@app.get("/api/eez")
def get_eez():
    """GeoJSON for India's 200 Nautical Mile Exclusive Economic Zone."""
    return get_eez_geojson()

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Ingest user-provided NetCDF (.nc, .nc4) or in-situ ASCII/CSV tabular files.
    Validates CF conventions and adds to active platform memory.
    """
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    dest_path = os.path.join(upload_dir, file.filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext in [".nc", ".nc4"]:
        try:
            # Test opening with NetCDF data manager
            data_manager.load_dataset(dest_path)
            meta = data_manager.get_metadata()
            return {
                "status": "success",
                "message": f"Successfully loaded NetCDF dataset: {file.filename}",
                "file_type": "NetCDF",
                "metadata": meta
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse NetCDF: {str(e)}")
            
    elif ext in [".txt", ".csv", ".dat"]:
        try:
            with open(dest_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            parsed = insitu_manager.parse_ascii_profile(content)
            return {
                "status": "success",
                "message": f"Successfully parsed in-situ ASCII file: {file.filename}",
                "file_type": "In-Situ Tabular ASCII",
                "data": parsed
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse ASCII file: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Upload .nc or .txt/.csv.")

# Mount built frontend static files if client/dist exists
from fastapi.staticfiles import StaticFiles
CLIENT_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "dist"))
if os.path.exists(CLIENT_DIST):
    app.mount("/", StaticFiles(directory=CLIENT_DIST, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

