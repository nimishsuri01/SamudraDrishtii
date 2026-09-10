"""
Generate realistic CF-compliant NetCDF model output and in-situ observational datasets
for the North Indian Ocean (Arabian Sea, Bay of Bengal, Equatorial Indian Ocean).
Operational Oceanographic Digital Twin Pipeline.
"""

import os
import json
import numpy as np
import netCDF4 as nc
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

def is_land_point(lat, lon):
    """
    Realistic land mask for North Indian Ocean basin.
    Uses accurate polygonal / elliptical bounds for the Indian subcontinent,
    Sri Lanka teardrop island, Arabian Peninsula, and SE Asia.
    """
    # Sri Lanka (teardrop / oval island centered at 7.65°N, 80.75°E)
    if 5.9 <= lat <= 9.85:
        lat_rel = (lat - 7.6) / 1.85
        # Sri Lanka is wider in south/central, narrower in north
        lon_half_width = 0.70 if lat < 8.3 else 0.42
        lon_rel = (lon - 80.75) / lon_half_width
        if (lat_rel**2 + lon_rel**2) <= 1.0:
            return True

    # Indian Subcontinent mainland
    if lat >= 8.1:
        if lat < 9.5:
            # Cape Comorin to 9.5N
            if 76.9 <= lon <= 78.2:
                return True
        elif lat < 12.0:
            # Kerala to Tamil Nadu
            if 75.8 <= lon <= 80.1:
                return True
        elif lat < 15.0:
            # Karnataka / Goa to Andhra / Chennai
            if 74.2 <= lon <= 80.5:
                return True
        elif lat < 18.0:
            # Maharashtra to Andhra
            if 73.2 <= lon <= 82.8:
                return True
        elif lat < 20.5:
            # Maharashtra to Odisha
            if 72.8 <= lon <= 86.8:
                return True
        elif lat < 23.0:
            # Gujarat / Kathiawar to West Bengal
            if (68.8 <= lon <= 73.2) or (72.6 <= lon <= 89.0):
                return True
        else:
            # North India mainland
            if 68.2 <= lon <= 89.5:
                return True

    # Arabian Peninsula / Oman / Iran
    if lon <= 65.5 and lat >= 22.5:
        return True
    if lon <= 61.5 and lat >= 17.5:
        return True
    if lon <= 58.5 and lat >= 14.0:
        return True

    # SE Asia / Myanmar / Malay Peninsula
    if lon >= 94.5 and lat >= 16.0:
        return True
    if lon >= 98.2 and lat >= 7.0:
        return True

    return False

def generate_netcdf_model_file():
    nc_path = os.path.join(DATA_DIR, "incois_ocean_model.nc")
    print(f"Generating CF-compliant NetCDF model file: {nc_path}")

    # Grid definition: North Indian Ocean
    # Lat: 0.0 to 26.0 (step 0.5 deg = 53 points)
    # Lon: 60.0 to 100.0 (step 0.5 deg = 81 points)
    # Depth: 13 levels
    # Time: 5 daily steps
    lats = np.arange(0.0, 26.5, 0.5)
    lons = np.arange(60.0, 100.5, 0.5)
    depths = np.array([0, 10, 20, 50, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000], dtype=np.float32)
    n_times = 5
    n_depths = len(depths)
    n_lats = len(lats)
    n_lons = len(lons)

    # Base dates
    base_date = datetime(2026, 9, 1, 0, 0, 0)
    time_units = "days since 2026-09-01 00:00:00"
    times = np.array([0.0, 1.0, 2.0, 3.0, 4.0], dtype=np.float32)

    # Pre-calculate land-sea mask
    land_mask = np.zeros((n_lats, n_lons), dtype=bool)
    for j, lat in enumerate(lats):
        for i, lon in enumerate(lons):
            land_mask[j, i] = is_land_point(lat, lon)

    # Create NetCDF file
    if os.path.exists(nc_path):
        os.remove(nc_path)

    ds = nc.Dataset(nc_path, "w", format="NETCDF4")

    # Global attributes (CF-1.8 compliance)
    ds.title = "INCOIS High-Resolution North Indian Ocean 3D Hydrodynamic & Bio-Physical Model"
    ds.institution = "Indian National Centre for Ocean Information Services (INCOIS)"
    ds.source = "MOM-5 / ROMS Coupled Ocean Ecosystem Simulation (INCOIS Ocean Valley)"
    ds.Conventions = "CF-1.8"
    ds.contact = "incois.las@incois.gov.in"
    ds.project = "National Ocean Information & 3D Digital Twin System"
    ds.references = "https://las.incois.gov.in/"
    ds.history = f"Created on {datetime.now().isoformat()} by SamudraDrishti Ingestion Pipeline"

    # Dimensions
    ds.createDimension("time", n_times)
    ds.createDimension("depth", n_depths)
    ds.createDimension("lat", n_lats)
    ds.createDimension("lon", n_lons)

    # Coordinate variables
    v_time = ds.createVariable("time", "f4", ("time",))
    v_time.units = time_units
    v_time.calendar = "standard"
    v_time.long_name = "Simulation Forecast Time"
    v_time.axis = "T"
    v_time[:] = times

    v_depth = ds.createVariable("depth", "f4", ("depth",))
    v_depth.units = "m"
    v_depth.positive = "down"
    v_depth.standard_name = "depth"
    v_depth.long_name = "Water Column Depth Below Surface"
    v_depth.axis = "Z"
    v_depth[:] = depths

    v_lat = ds.createVariable("lat", "f4", ("lat",))
    v_lat.units = "degrees_north"
    v_lat.standard_name = "latitude"
    v_lat.long_name = "Latitude"
    v_lat.axis = "Y"
    v_lat[:] = lats

    v_lon = ds.createVariable("lon", "f4", ("lon",))
    v_lon.units = "degrees_east"
    v_lon.standard_name = "longitude"
    v_lon.long_name = "Longitude"
    v_lon.axis = "X"
    v_lon[:] = lons

    # Data variables
    v_temp = ds.createVariable("thetao", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_temp.standard_name = "sea_water_potential_temperature"
    v_temp.long_name = "Sea Water Potential Temperature"
    v_temp.units = "degrees_C"

    v_sal = ds.createVariable("so", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_sal.standard_name = "sea_water_practical_salinity"
    v_sal.long_name = "Sea Water Practical Salinity"
    v_sal.units = "PSU"

    v_u = ds.createVariable("uo", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_u.standard_name = "eastward_sea_water_velocity"
    v_u.long_name = "Zonal Surface & Subsurface Velocity (Eastward)"
    v_u.units = "m s-1"

    v_v = ds.createVariable("vo", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_v.standard_name = "northward_sea_water_velocity"
    v_v.long_name = "Meridional Surface & Subsurface Velocity (Northward)"
    v_v.units = "m s-1"

    v_w = ds.createVariable("wo", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_w.standard_name = "upward_sea_water_velocity"
    v_w.long_name = "Vertical Upwelling/Downwelling Velocity"
    v_w.units = "m s-1"

    v_chl = ds.createVariable("chl", "f4", ("time", "depth", "lat", "lon"), fill_value=1e20)
    v_chl.standard_name = "mass_concentration_of_chlorophyll_a_in_sea_water"
    v_chl.long_name = "Chlorophyll-a Concentration"
    v_chl.units = "mg m-3"

    v_zos = ds.createVariable("zos", "f4", ("time", "lat", "lon"), fill_value=1e20)
    v_zos.standard_name = "sea_surface_height_above_geoid"
    v_zos.long_name = "Sea Surface Height (Dynamic Topography)"
    v_zos.units = "m"

    # Fill data with high-fidelity realistic oceanography
    for t_idx in range(n_times):
        t_phase = t_idx * 0.15

        # 2D SSH field
        ssh_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
        for j, lat in enumerate(lats):
            for i, lon in enumerate(lons):
                if land_mask[j, i]:
                    ssh_grid[j, i] = 1e20
                else:
                    # Anticyclonic gyre in BoB, cyclonic eddies
                    ssh = 0.12 * np.sin((lon - 85) * 0.15) * np.cos((lat - 12) * 0.2)
                    # Somali current elevation
                    ssh += 0.08 * np.exp(-((lon - 62)**2 + (lat - 10)**2) / 30.0)
                    ssh += 0.02 * np.sin(t_phase)
                    ssh_grid[j, i] = ssh
        v_zos[t_idx, :, :] = ssh_grid

        # 3D fields
        for d_idx, depth in enumerate(depths):
            temp_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
            sal_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
            u_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
            v_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
            w_grid = np.zeros((n_lats, n_lons), dtype=np.float32)
            chl_grid = np.zeros((n_lats, n_lons), dtype=np.float32)

            # Thermocline exponential profile
            # Warm surface (28-30 C), sharp drop at 50-150m, 3-4 C deep
            z_scale = 180.0
            t_decay = np.exp(-depth / z_scale)
            t_deep = 2.5 + 4.5 * np.exp(-depth / 750.0)

            for j, lat in enumerate(lats):
                for i, lon in enumerate(lons):
                    if land_mask[j, i]:
                        temp_grid[j, i] = 1e20
                        sal_grid[j, i] = 1e20
                        u_grid[j, i] = 1e20
                        v_grid[j, i] = 1e20
                        w_grid[j, i] = 1e20
                        chl_grid[j, i] = 1e20
                    else:
                        # Spatial modulation
                        # Arabian Sea (lon 60-77): higher salinity (36.2), coastal upwelling off Oman/Somalia
                        # Bay of Bengal (lon 80-95): fresh river plume in north (31.0 - 33.0), warm pool (29.5 C)
                        is_arabian_sea = (lon < 77.5)
                        is_bob = (lon >= 78.5)

                        # Surface temperature base
                        if is_bob:
                            # Bay of Bengal Warm Pool
                            t_surf = 29.2 + 0.8 * np.sin(lat * 0.1) + 0.3 * np.cos(t_phase)
                        elif is_arabian_sea:
                            # Upwelling off western boundary cools the surface
                            cool_upwelling = 3.5 * np.exp(-((lon - 61)**2 + (lat - 15)**2) / 45.0)
                            t_surf = 28.5 - cool_upwelling + 0.2 * np.sin(t_phase)
                        else:
                            t_surf = 28.8

                        # 3D temperature
                        # Thermocline depth varies: shallower in west AS (upwelling ~60m), deeper in BoB (~110m)
                        z_therm = 85.0 if is_arabian_sea else 115.0
                        temp_val = t_deep + (t_surf - t_deep) / (1.0 + np.exp((depth - z_therm) / 45.0))
                        # Small eddy perturbations
                        temp_val += 0.35 * np.sin(lon * 0.3) * np.cos(lat * 0.35) * np.exp(-depth / 300.0)
                        temp_grid[j, i] = max(1.8, temp_val)

                        # 3D Salinity
                        if is_arabian_sea:
                            s_surf = 36.2 + 0.5 * ((lat - 10) / 15.0) # Increases northwards due to evaporation
                            s_sub = 35.6 + 0.4 * np.exp(-((depth - 150)**2) / 8000.0) # Arabian Sea High Salinity Water (ASHSW)
                        elif is_bob:
                            # Low salinity river plume in northern BoB
                            river_freshening = 4.8 * np.exp(-((lat - 22)**2) / 18.0) * ((lon - 80) / 15.0)
                            s_surf = 33.2 - river_freshening
                            s_sub = 34.8
                        else:
                            s_surf = 34.6
                            s_sub = 34.7

                        sal_val = s_surf if depth < 30 else s_surf + (s_sub - s_surf) * (1.0 - np.exp(-(depth - 30) / 120.0))
                        # Deep salinity approaches 34.7
                        if depth > 500:
                            sal_val = 34.7 + (sal_val - 34.7) * np.exp(-(depth - 500) / 600.0)
                        sal_grid[j, i] = max(28.0, min(37.5, sal_val))

                        # 3D Velocity (Summer Monsoon System)
                        # Decays with depth
                        v_decay = np.exp(-depth / 160.0)
                        # Somali Current: strong northward flow in western Arabian Sea
                        u_somali = 0.4 * np.exp(-((lon - 62)**2) / 20.0) * np.exp(-((lat - 10)**2) / 50.0)
                        v_somali = 1.4 * np.exp(-((lon - 61)**2) / 16.0) * np.exp(-((lat - 11)**2) / 60.0)

                        # Summer Monsoon Drift: Eastward across 5-10 N
                        u_smd = 0.55 * np.exp(-((lat - 6.5)**2) / 12.0)
                        # West India Coastal Current (WICC): southward along west coast of India in summer
                        v_wicc = -0.35 * np.exp(-((lon - 73.5)**2) / 4.0) * (1.0 if (9 <= lat <= 19) else 0.0)
                        # East India Coastal Current (EICC): northward/cyclonic in western BoB
                        v_eicc = 0.45 * np.exp(-((lon - 81.5)**2) / 5.0) * (1.0 if (11 <= lat <= 18) else 0.0)

                        u_tot = (u_somali + u_smd) * v_decay + 0.08 * np.sin(lon * 0.2 + t_phase)
                        v_tot = (v_somali + v_wicc + v_eicc) * v_decay + 0.06 * np.cos(lat * 0.25 + t_phase)
                        u_grid[j, i] = u_tot
                        v_grid[j, i] = v_tot

                        # Vertical velocity (Upwelling along coasts)
                        # Strong upwelling along Oman / Somalia and Kerala coasts
                        w_up = 0.00015 * np.exp(-((lon - 62)**2 + (lat - 14)**2) / 30.0)
                        w_kerala = 0.00009 * np.exp(-((lon - 75.5)**2 + (lat - 9.5)**2) / 8.0)
                        w_grid[j, i] = (w_up + w_kerala) * np.sin(np.pi * depth / 400.0) if depth <= 400 else 0.0

                        # Chlorophyll-a
                        # High in upwelling zones, and DCM (deep chlorophyll max) at 50-70m
                        chl_base = 0.12
                        upw_chl = 2.8 * np.exp(-((lon - 62)**2 + (lat - 14)**2) / 40.0) * np.exp(-depth / 40.0)
                        coast_chl = 1.4 * np.exp(-((lon - 75.5)**2 + (lat - 10)**2) / 12.0) * np.exp(-depth / 35.0)
                        bob_chl = 0.8 * np.exp(-((lat - 21)**2) / 10.0) * np.exp(-depth / 30.0) # Ganges plume
                        dcm = 0.45 * np.exp(-((depth - 60)**2) / 450.0) if (depth <= 150) else 0.0
                        chl_tot = (chl_base + upw_chl + coast_chl + bob_chl + dcm) * (1.0 if depth <= 200 else np.exp(-(depth - 200) / 100.0))
                        chl_grid[j, i] = max(0.01, chl_tot)

            v_temp[t_idx, d_idx, :, :] = temp_grid
            v_sal[t_idx, d_idx, :, :] = sal_grid
            v_u[t_idx, d_idx, :, :] = u_grid
            v_v[t_idx, d_idx, :, :] = v_grid
            v_w[t_idx, d_idx, :, :] = w_grid
            v_chl[t_idx, d_idx, :, :] = chl_grid

    ds.close()
    print("NetCDF generation complete!")

def generate_insitu_datasets():
    print("Generating in-situ Argo, Glider, and Buoy observational datasets...")

    # Argo Floats (Real WMO format styling)
    argo_platforms = [
        {
            "id": "ARGO-2902214",
            "wmo": "2902214",
            "type": "Argo Float (Core)",
            "sensor": "SBE 41CP CTD",
            "country": "India (INCOIS)",
            "lat": 14.50,
            "lon": 66.20,
            "basin": "Central Arabian Sea",
            "cycle_number": 84,
            "date": "2026-09-04T06:30:00Z",
            "status": "Active (Transmitting via Iridium)",
            "trajectory": [
                {"lat": 13.8, "lon": 65.4, "date": "2026-08-05", "cycle": 80},
                {"lat": 13.9, "lon": 65.6, "date": "2026-08-15", "cycle": 81},
                {"lat": 14.1, "lon": 65.8, "date": "2026-08-25", "cycle": 82},
                {"lat": 14.3, "lon": 66.0, "date": "2026-08-30", "cycle": 83},
                {"lat": 14.5, "lon": 66.2, "date": "2026-09-04", "cycle": 84},
            ]
        },
        {
            "id": "ARGO-2902215",
            "wmo": "2902215",
            "type": "BGC-Argo Float",
            "sensor": "SBE 41CP CTD + WetLabs ECO FLBBCD + Aanderaa Optode",
            "country": "India (INCOIS)",
            "lat": 11.80,
            "lon": 84.60,
            "basin": "Southwestern Bay of Bengal",
            "cycle_number": 112,
            "date": "2026-09-03T18:15:00Z",
            "status": "Active (BGC Optical Data Validated)",
            "trajectory": [
                {"lat": 11.0, "lon": 83.8, "date": "2026-08-04", "cycle": 108},
                {"lat": 11.2, "lon": 84.0, "date": "2026-08-14", "cycle": 109},
                {"lat": 11.4, "lon": 84.2, "date": "2026-08-24", "cycle": 110},
                {"lat": 11.6, "lon": 84.4, "date": "2026-08-29", "cycle": 111},
                {"lat": 11.8, "lon": 84.6, "date": "2026-09-03", "cycle": 112},
            ]
        },
        {
            "id": "ARGO-2902216",
            "wmo": "2902216",
            "type": "Argo Float (Core)",
            "sensor": "SBE 41CP CTD",
            "country": "India (INCOIS)",
            "lat": 18.20,
            "lon": 64.10,
            "basin": "Northwestern Arabian Sea",
            "cycle_number": 62,
            "date": "2026-09-02T12:00:00Z",
            "status": "Active",
            "trajectory": [
                {"lat": 17.5, "lon": 63.4, "date": "2026-08-13", "cycle": 59},
                {"lat": 17.7, "lon": 63.6, "date": "2026-08-23", "cycle": 60},
                {"lat": 18.0, "lon": 63.9, "date": "2026-08-28", "cycle": 61},
                {"lat": 18.2, "lon": 64.1, "date": "2026-09-02", "cycle": 62},
            ]
        },
        {
            "id": "ARGO-2902217",
            "wmo": "2902217",
            "type": "BGC-Argo Float",
            "sensor": "SBE 41CP CTD + ECO Triplet (Chl/CDOM/Backscatter)",
            "country": "India (INCOIS)",
            "lat": 15.10,
            "lon": 89.30,
            "basin": "Central Bay of Bengal",
            "cycle_number": 95,
            "date": "2026-09-04T09:45:00Z",
            "status": "Active",
            "trajectory": [
                {"lat": 14.5, "lon": 88.5, "date": "2026-08-15", "cycle": 92},
                {"lat": 14.7, "lon": 88.8, "date": "2026-08-25", "cycle": 93},
                {"lat": 14.9, "lon": 89.0, "date": "2026-08-30", "cycle": 94},
                {"lat": 15.1, "lon": 89.3, "date": "2026-09-04", "cycle": 95},
            ]
        },
        {
            "id": "ARGO-2902218",
            "wmo": "2902218",
            "type": "Deep Argo Float (6000m rated)",
            "sensor": "SBE 61 Deep CTD",
            "country": "India (INCOIS)",
            "lat": 3.20,
            "lon": 78.40,
            "basin": "Equatorial Indian Ocean",
            "cycle_number": 48,
            "date": "2026-09-04T02:00:00Z",
            "status": "Active (Deep Profile)",
            "trajectory": [
                {"lat": 2.8, "lon": 77.8, "date": "2026-08-15", "cycle": 45},
                {"lat": 3.0, "lon": 78.0, "date": "2026-08-25", "cycle": 46},
                {"lat": 3.1, "lon": 78.2, "date": "2026-08-30", "cycle": 47},
                {"lat": 3.2, "lon": 78.4, "date": "2026-09-04", "cycle": 48},
            ]
        },
        {
            "id": "ARGO-2902219",
            "wmo": "2902219",
            "type": "Argo Float",
            "sensor": "SBE 41CP CTD",
            "country": "India (INCOIS)",
            "lat": 10.50,
            "lon": 72.80,
            "basin": "Lakshadweep Sea",
            "cycle_number": 73,
            "date": "2026-09-03T22:30:00Z",
            "status": "Active",
            "trajectory": [
                {"lat": 10.1, "lon": 72.2, "date": "2026-08-24", "cycle": 71},
                {"lat": 10.3, "lon": 72.5, "date": "2026-08-29", "cycle": 72},
                {"lat": 10.5, "lon": 72.8, "date": "2026-09-03", "cycle": 73},
            ]
        },
        {
            "id": "ARGO-2902220",
            "wmo": "2902220",
            "type": "Argo Float",
            "sensor": "SBE 41CP CTD",
            "country": "India (INCOIS)",
            "lat": 11.20,
            "lon": 93.80,
            "basin": "Andaman Sea",
            "cycle_number": 51,
            "date": "2026-09-04T04:10:00Z",
            "status": "Active",
            "trajectory": [
                {"lat": 10.8, "lon": 93.4, "date": "2026-08-25", "cycle": 49},
                {"lat": 11.0, "lon": 93.6, "date": "2026-08-30", "cycle": 50},
                {"lat": 11.2, "lon": 93.8, "date": "2026-09-04", "cycle": 51},
            ]
        },
        {
            "id": "ARGO-2902221",
            "wmo": "2902221",
            "type": "Argo Float",
            "sensor": "SBE 41CP CTD",
            "country": "India (INCOIS)",
            "lat": 18.80,
            "lon": 70.50,
            "basin": "Eastern Arabian Sea (Off Mumbai Shelf)",
            "cycle_number": 39,
            "date": "2026-09-04T14:20:00Z",
            "status": "Active",
            "trajectory": [
                {"lat": 18.2, "lon": 69.9, "date": "2026-08-25", "cycle": 37},
                {"lat": 18.5, "lon": 70.2, "date": "2026-08-30", "cycle": 38},
                {"lat": 18.8, "lon": 70.5, "date": "2026-09-04", "cycle": 39},
            ]
        }
    ]

    # Generate high-resolution vertical profile measurements for each float
    # Standard depth levels down to 2000m
    meas_depths = [
        0, 5, 10, 15, 20, 30, 40, 50, 60, 75, 90, 100, 125, 150, 175, 200,
        250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200,
        1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000
    ]

    for p in argo_platforms:
        p_lat = p["lat"]
        p_lon = p["lon"]
        is_as = (p_lon < 77.5)
        
        # Profile generation with realistic sensor noise and small real-world discrepancy from model
        profile = []
        for d in meas_depths:
            # Physical profile
            z_therm = 85.0 if is_as else 115.0
            t_surf = 28.5 if is_as else 29.3
            t_deep = 2.4 + 4.2 * np.exp(-d / 700.0)
            temp = t_deep + (t_surf - t_deep) / (1.0 + np.exp((d - z_therm) / 42.0))
            # In-situ sensor micro-features (inversion, fine structure)
            sensor_noise = np.random.normal(0, 0.05)
            temp = float(np.round(temp + sensor_noise, 3))

            # Salinity
            if is_as:
                sal_surf = 36.4
                sal_sub = 36.1
            else:
                sal_surf = 32.8 if p_lat > 14 else 33.6
                sal_sub = 34.85
            sal = sal_surf if d < 25 else sal_surf + (sal_sub - sal_surf) * (1.0 - np.exp(-(d - 25) / 110.0))
            if d > 500:
                sal = 34.7 + (sal - 34.7) * np.exp(-(d - 500) / 550.0)
            sal = float(np.round(sal + np.random.normal(0, 0.02), 3))

            # Chlorophyll
            if "BGC" in p["type"]:
                dcm = 0.52 * np.exp(-((d - 65)**2) / 380.0)
                chl = float(np.round(max(0.02, 0.12 + dcm + np.random.normal(0, 0.02)), 3))
            else:
                chl = None

            # Dissolved oxygen (ml/l)
            oxy = float(np.round(4.8 - 3.8 / (1.0 + np.exp((d - 120) / 50.0)) + np.random.normal(0, 0.08), 2))
            
            # QC flags: 1 = Good, 2 = Probably Good
            qc = 1 if d != 500 else 2

            profile.append({
                "depth": d,
                "temperature": temp,
                "salinity": sal,
                "chlorophyll": chl,
                "dissolved_oxygen": oxy,
                "pressure_dbar": int(d * 1.01),
                "qc_flag": qc
            })
        p["profile"] = profile

    with open(os.path.join(DATA_DIR, "insitu_argo.json"), "w") as f:
        json.dump(argo_platforms, f, indent=2)

    # Underwater Glider Missions (Sawtooth dive paths)
    glider_missions = [
        {
            "id": "GLIDER-INCOIS-BOB-01",
            "name": "Slocum Glider Mission: Chennai to Port Blair Transect",
            "platform_type": "Underwater Ocean Glider (Teledyne Webb Slocum G3)",
            "organization": "INCOIS Coastal & Ocean Observation Network",
            "deployment_date": "2026-08-20",
            "status": "In Mission - Submerged Sawtooth Profile",
            "battery_level": 78,
            "max_depth_rated": 1000,
            "current_lat": 13.65,
            "current_lon": 82.80,
            "current_depth": 340,
            "dive_direction": "ascending",
            "dive_number": 142,
            "waypoints": [
                {"lat": 13.1, "lon": 80.8},
                {"lat": 13.4, "lon": 81.8},
                {"lat": 13.65, "lon": 82.8},
                {"lat": 13.9, "lon": 84.0},
                {"lat": 14.2, "lon": 85.5},
            ],
            "sawtooth_track": [
                {"lat": 13.10, "lon": 80.80, "depth": 0, "time": "2026-08-20T08:00:00Z"},
                {"lat": 13.18, "lon": 81.05, "depth": 500, "time": "2026-08-21T02:00:00Z"},
                {"lat": 13.25, "lon": 81.30, "depth": 1000, "time": "2026-08-22T14:00:00Z"},
                {"lat": 13.32, "lon": 81.55, "depth": 0, "time": "2026-08-23T20:00:00Z"},
                {"lat": 13.40, "lon": 81.80, "depth": 500, "time": "2026-08-25T06:00:00Z"},
                {"lat": 13.48, "lon": 82.10, "depth": 1000, "time": "2026-08-27T18:00:00Z"},
                {"lat": 13.56, "lon": 82.45, "depth": 0, "time": "2026-08-30T04:00:00Z"},
                {"lat": 13.65, "lon": 82.80, "depth": 340, "time": "2026-09-04T11:00:00Z"},
            ],
            "profile": [
                {"depth": 0, "temperature": 29.4, "salinity": 33.1, "chlorophyll": 0.45, "turbidity_ntu": 0.3},
                {"depth": 20, "temperature": 29.2, "salinity": 33.3, "chlorophyll": 0.58, "turbidity_ntu": 0.3},
                {"depth": 50, "temperature": 28.1, "salinity": 34.2, "chlorophyll": 0.95, "turbidity_ntu": 0.4},
                {"depth": 75, "temperature": 24.6, "salinity": 34.7, "chlorophyll": 1.25, "turbidity_ntu": 0.5},
                {"depth": 100, "temperature": 21.3, "salinity": 34.8, "chlorophyll": 0.72, "turbidity_ntu": 0.3},
                {"depth": 150, "temperature": 16.5, "salinity": 34.9, "chlorophyll": 0.15, "turbidity_ntu": 0.2},
                {"depth": 200, "temperature": 13.8, "salinity": 35.0, "chlorophyll": 0.05, "turbidity_ntu": 0.1},
                {"depth": 300, "temperature": 11.2, "salinity": 35.1, "chlorophyll": 0.02, "turbidity_ntu": 0.1},
                {"depth": 500, "temperature": 8.7, "salinity": 35.0, "chlorophyll": 0.01, "turbidity_ntu": 0.1},
                {"depth": 750, "temperature": 6.4, "salinity": 34.9, "chlorophyll": 0.0, "turbidity_ntu": 0.1},
                {"depth": 1000, "temperature": 5.2, "salinity": 34.8, "chlorophyll": 0.0, "turbidity_ntu": 0.1},
            ]
        },
        {
            "id": "GLIDER-INCOIS-AS-02",
            "name": "Seaglider Mission: Eastern Arabian Sea Upwelling Study",
            "platform_type": "Underwater Ocean Glider (Kongsberg Seaglider M1)",
            "organization": "INCOIS / NIO Joint Expedition",
            "deployment_date": "2026-08-25",
            "status": "In Mission - Descending",
            "battery_level": 84,
            "max_depth_rated": 1000,
            "current_lat": 16.10,
            "current_lon": 71.15,
            "current_depth": 620,
            "dive_direction": "descending",
            "dive_number": 88,
            "waypoints": [
                {"lat": 15.2, "lon": 71.8},
                {"lat": 16.1, "lon": 71.15},
                {"lat": 16.8, "lon": 70.2},
            ],
            "sawtooth_track": [
                {"lat": 15.20, "lon": 71.80, "depth": 0, "time": "2026-08-25T10:00:00Z"},
                {"lat": 15.50, "lon": 71.60, "depth": 500, "time": "2026-08-27T04:00:00Z"},
                {"lat": 15.75, "lon": 71.40, "depth": 1000, "time": "2026-08-29T16:00:00Z"},
                {"lat": 15.95, "lon": 71.25, "depth": 0, "time": "2026-09-01T22:00:00Z"},
                {"lat": 16.10, "lon": 71.15, "depth": 620, "time": "2026-09-04T12:00:00Z"},
            ],
            "profile": [
                {"depth": 0, "temperature": 27.9, "salinity": 36.3, "chlorophyll": 1.45, "turbidity_ntu": 0.6},
                {"depth": 20, "temperature": 27.2, "salinity": 36.3, "chlorophyll": 1.82, "turbidity_ntu": 0.7},
                {"depth": 50, "temperature": 24.1, "salinity": 36.2, "chlorophyll": 1.95, "turbidity_ntu": 0.5},
                {"depth": 75, "temperature": 19.8, "salinity": 35.9, "chlorophyll": 0.85, "turbidity_ntu": 0.3},
                {"depth": 100, "temperature": 17.1, "salinity": 35.8, "chlorophyll": 0.25, "turbidity_ntu": 0.2},
                {"depth": 200, "temperature": 13.9, "salinity": 35.6, "chlorophyll": 0.05, "turbidity_ntu": 0.1},
                {"depth": 500, "temperature": 9.4, "salinity": 35.1, "chlorophyll": 0.0, "turbidity_ntu": 0.1},
                {"depth": 1000, "temperature": 5.8, "salinity": 34.8, "chlorophyll": 0.0, "turbidity_ntu": 0.1},
            ]
        }
    ]

    with open(os.path.join(DATA_DIR, "insitu_gliders.json"), "w") as f:
        json.dump(glider_missions, f, indent=2)

    # Moored Buoy Network (OMNI & RAMA)
    buoys = [
        {
            "id": "BUOY-AD01",
            "name": "OMNI Deep Buoy AD01",
            "type": "Moored Ocean Buoy (OMNI)",
            "network": "INCOIS OMNI (Ocean Moored Buoy Network for Northern Indian Ocean)",
            "lat": 15.00,
            "lon": 69.00,
            "sea_state": "Slight (Wave height 1.2m)",
            "sst": 28.6,
            "sss": 36.2,
            "wind_speed_ms": 7.5,
            "wind_dir_deg": 230,
            "air_temp": 28.1,
            "air_pressure_hpa": 1010.4,
            "thermistor_chain": [
                {"depth": 1, "temperature": 28.6},
                {"depth": 10, "temperature": 28.5},
                {"depth": 20, "temperature": 28.4},
                {"depth": 50, "temperature": 27.2},
                {"depth": 75, "temperature": 23.8},
                {"depth": 100, "temperature": 19.5},
                {"depth": 150, "temperature": 16.2},
                {"depth": 200, "temperature": 14.1},
                {"depth": 300, "temperature": 11.5},
                {"depth": 500, "temperature": 9.2},
            ]
        },
        {
            "id": "BUOY-BD08",
            "name": "OMNI Deep Buoy BD08",
            "type": "Moored Ocean Buoy (OMNI)",
            "network": "INCOIS OMNI",
            "lat": 18.20,
            "lon": 89.70,
            "sea_state": "Moderate (Wave height 1.8m)",
            "sst": 29.8,
            "sss": 31.4,
            "wind_speed_ms": 9.2,
            "wind_dir_deg": 195,
            "air_temp": 29.2,
            "air_pressure_hpa": 1007.8,
            "thermistor_chain": [
                {"depth": 1, "temperature": 29.8},
                {"depth": 10, "temperature": 29.7},
                {"depth": 20, "temperature": 29.5},
                {"depth": 50, "temperature": 28.8},
                {"depth": 75, "temperature": 25.1},
                {"depth": 100, "temperature": 22.0},
                {"depth": 150, "temperature": 17.6},
                {"depth": 200, "temperature": 14.5},
                {"depth": 300, "temperature": 11.8},
                {"depth": 500, "temperature": 8.9},
            ]
        },
        {
            "id": "BUOY-BD10",
            "name": "OMNI Deep Buoy BD10",
            "type": "Moored Ocean Buoy (OMNI)",
            "network": "INCOIS OMNI",
            "lat": 14.00,
            "lon": 86.50,
            "sea_state": "Slight (Wave height 1.4m)",
            "sst": 29.3,
            "sss": 33.5,
            "wind_speed_ms": 6.8,
            "wind_dir_deg": 210,
            "air_temp": 28.9,
            "air_pressure_hpa": 1009.2,
            "thermistor_chain": [
                {"depth": 1, "temperature": 29.3},
                {"depth": 10, "temperature": 29.2},
                {"depth": 20, "temperature": 29.0},
                {"depth": 50, "temperature": 28.4},
                {"depth": 75, "temperature": 24.2},
                {"depth": 100, "temperature": 20.8},
                {"depth": 150, "temperature": 16.9},
                {"depth": 200, "temperature": 14.0},
                {"depth": 300, "temperature": 11.4},
                {"depth": 500, "temperature": 8.8},
            ]
        },
        {
            "id": "BUOY-CB02",
            "name": "Coastal Buoy CB02 (Off Chennai)",
            "type": "Coastal Buoy",
            "network": "INCOIS Coastal Network",
            "lat": 13.10,
            "lon": 80.40,
            "sea_state": "Calm (Wave height 0.8m)",
            "sst": 29.5,
            "sss": 33.2,
            "wind_speed_ms": 5.2,
            "wind_dir_deg": 180,
            "air_temp": 29.4,
            "air_pressure_hpa": 1011.0,
            "thermistor_chain": [
                {"depth": 1, "temperature": 29.5},
                {"depth": 10, "temperature": 29.3},
                {"depth": 20, "temperature": 28.8},
                {"depth": 35, "temperature": 27.5},
                {"depth": 50, "temperature": 26.2},
            ]
        }
    ]

    with open(os.path.join(DATA_DIR, "insitu_buoys.json"), "w") as f:
        json.dump(buoys, f, indent=2)

    # Sample Raw ASCII Argo profile file
    ascii_file_path = os.path.join(DATA_DIR, "sample_argo_wmo_2902214.txt")
    with open(ascii_file_path, "w") as f:
        f.write("# INCOIS / CORIOLIS ARGO OBSERVATION DATA TABLE\n")
        f.write("# PLATFORM: 2902214\n")
        f.write("# DATE: 2026-09-04T06:30:00Z\n")
        f.write("# LATITUDE: 14.500 N\n")
        f.write("# LONGITUDE: 66.200 E\n")
        f.write("# CYCLE_NUMBER: 84\n")
        f.write("# COLUMNS: PRES(dbar) TEMP(degC) PSAL(psu) DOXY(ml/l) QC_FLAG\n")
        for pt in argo_platforms[0]["profile"]:
            f.write(f"{pt['pressure_dbar']:6d}  {pt['temperature']:8.3f}  {pt['salinity']:8.3f}  {pt['dissolved_oxygen']:8.2f}  {pt['qc_flag']:2d}\n")

    print("In-situ datasets successfully written!")

if __name__ == "__main__":
    generate_netcdf_model_file()
    generate_insitu_datasets()
