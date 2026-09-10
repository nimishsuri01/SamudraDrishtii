# SamudraDrishti

## 3D Ocean Digital Twin and In-Situ Observation Platform

SamudraDrishti is a web-based oceanographic decision-support platform for the North Indian Ocean. It combines numerical ocean-model fields with autonomous observations from Argo floats, underwater gliders, and moored buoys.

The application provides a Cesium globe for regional context and a Three.js water-column view for depth-aware exploration. Users can inspect model slices, compare model output with observations, explore vertical transects, and review operational advisories.

## Features

- Dual 3D visualization: CesiumJS WGS84 globe and Three.js subsurface water column.
- Horizontal model slices for temperature, salinity, velocity, chlorophyll, vertical velocity, and sea-surface height.
- Depth and time controls, color palettes, opacity, and vertical exaggeration.
- Fleet visualization for Argo floats, gliders, and moored buoys.
- Platform telemetry and deep-profile inspection.
- Model-versus-observation validation with RMSE, bias, MAE, Pearson correlation, and Willmott skill metrics.
- Vertical transect curtains between arbitrary geographic points.
- Operational advisories for:
  - Tropical Cyclone Heat Potential and D26 isotherm depth.
  - Potential Fishing Zones.
  - Marine heatwave alerts.
  - Search-and-rescue drift trajectories.
- Upload support for NetCDF model files and in-situ TXT, CSV, and DAT profiles.
- India EEZ GeoJSON overlay.
- Forecaster and science-outreach modes.

## Architecture

```text
Next.js / React client
        |
        | same-origin /api proxy or NEXT_PUBLIC_API_URL
        v
FastAPI backend
  |-- OceanDataManager       NetCDF metadata, slices, and transects
  |-- InSituManager          platform data and ASCII profile parsing
  |-- ValidationEngine       model/observation statistics
  |-- AdvisoryEngine         TCHP, PFZ, MHW, and SAR calculations
  `-- EEZ provider           India EEZ GeoJSON
        |
        `-- server/data       NetCDF and observation fixtures
```

The active frontend entry point is [`client/src/app/page.tsx`](client/src/app/page.tsx). The main workstation is assembled from [`DualViewport.tsx`](client/src/components/DualViewport.tsx), [`CesiumGlobe.tsx`](client/src/components/CesiumGlobe.tsx), and [`ThreeVolumetric.tsx`](client/src/components/ThreeVolumetric.tsx).

The repository also contains a Vite entry point in [`client/src/main.tsx`](client/src/main.tsx) and [`client/src/App.tsx`](client/src/App.tsx). The normal scripts use Next.js; the Vite scripts are retained for the legacy path.

## Requirements

- Python 3.10 or newer.
- Node.js 20 or newer and npm.
- A modern WebGL2-capable browser.
- Network access when loading CesiumJS from its external CDN.

## Local Setup

### 1. Install the backend

From the repository root:

```bash
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```bat
venv\Scripts\activate
```

Linux or macOS:

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r server/requirements.txt
```

The repository includes sample model and observation data. Regenerate sample data only when needed:

```bash
python server/generate_sample_data.py
```

### 2. Install the frontend

```bash
cd client
npm install
cd ..
```

### 3. Start the application

The single-command launcher starts both services and opens the frontend:

```bash
python run.py
```

`run.py` starts `npm run dev` when `client/.next` does not exist. After a production build exists, it starts `npm run start` instead.

To run the services separately:

```bash
# Terminal 1: backend
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000

# Terminal 2: frontend
cd client
npm run dev
```

Open:

- Application: <http://localhost:3000>
- Swagger UI: <http://localhost:8000/docs>
- OpenAPI JSON: <http://localhost:8000/openapi.json>
- Backend health: <http://localhost:8000/api/health>

## Configuration

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `PORT` | FastAPI container | `8000` | Listening port used by Docker, Render, and Railway. |
| `BACKEND_URL` | Next.js rewrites | `http://127.0.0.1:8000` | Backend origin for `/api`, `/docs`, and `/openapi.json` proxying. |
| `NEXT_PUBLIC_API_URL` | Browser API client | Same-origin | Optional public backend origin. The client appends `/api`. |

The Next.js proxy is configured in [`client/next.config.mjs`](client/next.config.mjs). Docker Compose sets `BACKEND_URL=http://backend:8000` for the frontend container.

## Backend API

All application routes are implemented in [`server/main.py`](server/main.py).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/info` | Service name, version, and status. |
| `GET` | `/api/health` | Health check. |
| `GET` | `/api/metadata` | Grid dimensions, ranges, depths, times, and variables. |
| `GET` | `/api/slice` | 2D model slice by variable, depth index, and time index. |
| `GET` | `/api/transect` | Vertical cross-section between two coordinates. |
| `GET` | `/api/instruments` | Active platform summaries. |
| `GET` | `/api/instruments/{platform_id}` | Full platform details and profile. |
| `GET` | `/api/validate/{platform_id}` | Model-versus-observation validation metrics. |
| `GET` | `/api/advisories/tchp` | TCHP and D26 advisory data. |
| `GET` | `/api/advisories/pfz` | Potential Fishing Zone advisory zones. |
| `GET` | `/api/advisories/mhw` | Marine heatwave alert regions. |
| `POST` | `/api/advisories/sar-drift` | SAR drift simulation. |
| `GET` | `/api/eez` | India EEZ GeoJSON. |
| `POST` | `/api/upload` | NetCDF or in-situ tabular file ingestion. |

Typical query parameters include:

- `/api/slice`: `variable`, `depth_idx`, `time_idx`.
- `/api/transect`: `lat1`, `lon1`, `lat2`, `lon2`, `variable`, `time_idx`.
- `/api/validate/{platform_id}`: `time_idx`.
- Advisory endpoints: `time_idx` where supported.
- SAR request body: `{ "start_lat": 15.0, "start_lon": 70.0, "hours": 48 }`.

## Data

Sample data is stored in [`server/data`](server/data):

- `incois_ocean_model.nc`: sample CF-style NetCDF ocean model grid.
- `insitu_argo.json`: Argo platform metadata and profiles.
- `insitu_gliders.json`: glider missions and tracks.
- `insitu_buoys.json`: moored buoy observations.
- `sample_argo_wmo_2902214.txt`: sample ASCII profile.

Core backend modules:

- [`data_manager.py`](server/data_manager.py): NetCDF loading, coordinate detection, slices, and transects.
- [`insitu_manager.py`](server/insitu_manager.py): platform data and ASCII profile parsing.
- [`validation_engine.py`](server/validation_engine.py): statistical comparison.
- [`advisory_engine.py`](server/advisory_engine.py): TCHP, PFZ, MHW, and SAR logic.
- [`eez_data.py`](server/eez_data.py): EEZ GeoJSON data.

Uploaded files are written to `server/uploads` at runtime and are not committed to the repository.

## Frontend Commands

Commands are defined in [`client/package.json`](client/package.json):

```bash
npm run dev          # Next.js development server on port 3000
npm run build        # Next.js production build
npm run start        # Next.js production server on port 3000
npm run dev:vite     # Legacy Vite development server
npm run build:vite   # Legacy Vite typecheck and Vite build
npm run preview      # Preview the Vite build
```

## Testing

Backend endpoint tests are in [`server/test_server.py`](server/test_server.py). Run them from the server directory because the tests use the server modules as top-level imports:

```bash
cd server
pytest test_server.py
```

From the repository root, set the module path explicitly:

```powershell
$env:PYTHONPATH = "server"
pytest server/test_server.py
```

The tests cover health, metadata, model slices, transects, instruments, validation, TCHP, PFZ, and SAR drift. No frontend test script is currently configured.

## Docker

Run both services with Docker Compose:

```bash
docker compose up --build
```

The services are available at:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>

The root [`Dockerfile`](Dockerfile) builds the FastAPI backend. [`client/Dockerfile`](client/Dockerfile) builds and runs the Next.js frontend. The backend image accepts a cloud-provided `PORT` value.

## Deployment

### Render

[`render.yaml`](render.yaml) deploys the root backend Dockerfile as a web service and uses `/api/health` as its health check.

### Railway

[`railway.json`](railway.json) configures Railway to build the root Dockerfile and use `/api/health` for deployment health checks.

### Hybrid hosting

Deploy the backend to Render, Railway, or another Docker host. Deploy the `client` directory as the Vercel project root and set:

```text
BACKEND_URL=https://your-backend-host.example.com
```

The Next.js rewrites then proxy API and OpenAPI requests to the backend. There is no checked-in Vercel configuration file; the client root directory and environment variable must be selected in the hosting provider.

## Current Limitations

- CesiumJS and its stylesheet are loaded from an external CDN, so the globe requires network access.
- `typescript.ignoreBuildErrors` is enabled in the Next.js config; a successful Next build does not replace a separate typecheck.
- PFZ and MHW advisory data currently come from the advisory engine's built-in data rather than a live external feed.
- The EEZ geometry is a simplified application overlay, not a certified legal boundary.
- CORS is currently open to all origins for development and demonstration use.
- The Vite entry point is retained for compatibility, but Next.js is the primary frontend runtime.

## License

This project is distributed under the Apache-2.0 License. Oceanographic coordinates use the WGS84 geodetic datum.
