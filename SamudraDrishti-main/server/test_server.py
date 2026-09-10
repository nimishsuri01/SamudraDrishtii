"""
Unit tests for SamudraDrishti FastAPI Server endpoints.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print("[PASS] Health check passed")

def test_metadata():
    res = client.get("/api/metadata")
    assert res.status_code == 200
    data = res.json()
    assert "bounds" in data
    assert "depths" in data
    assert len(data["depths"]) == 13
    assert "variables" in data
    print(f"[PASS] Metadata passed: {len(data['variables'])} variables, {len(data['depths'])} depth levels")

def test_slice_thetao():
    res = client.get("/api/slice?variable=thetao&depth_idx=0&time_idx=0")
    assert res.status_code == 200
    data = res.json()
    assert data["variable"] == "thetao"
    assert "grid" in data
    assert data["min"] >= 1.0
    print(f"[PASS] Surface Temp Slice passed: min={data['min']} C, max={data['max']} C")

def test_slice_velocity():
    res = client.get("/api/slice?variable=velocity&depth_idx=0&time_idx=0")
    assert res.status_code == 200
    data = res.json()
    assert data["variable"] == "velocity"
    assert "vector_u" in data
    assert "vector_v" in data
    print(f"[PASS] Velocity Slice passed: max speed={data['max']} m/s")

def test_transect():
    res = client.get("/api/transect?lat1=13.0&lon1=80.2&lat2=11.6&lon2=92.7&variable=thetao")
    assert res.status_code == 200
    data = res.json()
    assert "curtain" in data
    assert "total_distance_km" in data
    print(f"[PASS] Transect passed: {data['total_distance_km']} km, {len(data['curtain'])} depth layers")

def test_instruments():
    res = client.get("/api/instruments")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 8
    print(f"[PASS] Instruments passed: {len(items)} active platforms")

def test_validation():
    res = client.get("/api/validate/ARGO-2902214")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    temp_metrics = data["metrics"]["temperature"]
    assert "rmse" in temp_metrics
    assert "pearson_r" in temp_metrics
    print(f"[PASS] Validation passed for ARGO-2902214: Temp RMSE={temp_metrics['rmse']} C, r={temp_metrics['pearson_r']}")

def test_advisories():
    res_tchp = client.get("/api/advisories/tchp")
    assert res_tchp.status_code == 200
    print("[PASS] TCHP advisory passed")

    res_pfz = client.get("/api/advisories/pfz")
    assert res_pfz.status_code == 200
    assert len(res_pfz.json()) > 0
    print(f"[PASS] PFZ advisory passed: {len(res_pfz.json())} zones")

    res_sar = client.post("/api/advisories/sar-drift", json={"start_lat": 15.0, "start_lon": 70.0, "hours": 24})
    assert res_sar.status_code == 200
    sar_data = res_sar.json()
    assert len(sar_data["trajectory"]) > 0
    print(f"[PASS] SAR drift simulation passed: {len(sar_data['trajectory'])} drift steps")

if __name__ == "__main__":
    test_health()
    test_metadata()
    test_slice_thetao()
    test_slice_velocity()
    test_transect()
    test_instruments()
    test_validation()
    test_advisories()
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
