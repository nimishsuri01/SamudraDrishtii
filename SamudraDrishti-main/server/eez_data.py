"""
India Exclusive Economic Zone (EEZ) and Maritime Boundary Coordinates (200 NM limit).
Supplies GeoJSON line strings and polygons for 3D overlay.
"""

# Realistic simplified polygon approximation of India's EEZ (including Lakshadweep and Andaman & Nicobar)
INDIA_EEZ_COASTAL = [
    # Arabian Sea EEZ Western Boundary
    [23.5, 66.8], [22.2, 65.8], [20.5, 67.2], [18.5, 68.4], [16.5, 69.5], 
    [14.5, 70.8], [12.0, 71.5], [10.0, 72.0], [8.0, 73.5], [6.5, 75.2],
    # Southern Tip & Sri Lanka Maritime Border Gap
    [5.5, 77.5], [5.8, 79.2], [6.8, 80.2], [8.5, 82.5],
    # Bay of Bengal EEZ Eastern Boundary
    [10.5, 83.8], [12.5, 84.8], [14.5, 85.5], [16.5, 86.8], [18.2, 88.2], 
    [20.5, 89.2], [21.5, 88.5]
]

LAKSHADWEEP_EEZ = [
    [12.5, 70.0], [13.2, 72.5], [12.5, 74.5], [9.5, 74.8], 
    [7.8, 73.8], [7.8, 71.2], [9.5, 69.8], [12.5, 70.0]
]

ANDAMAN_NICOBAR_EEZ = [
    [14.5, 91.0], [14.5, 94.5], [12.0, 95.0], [9.0, 94.8], 
    [6.0, 94.5], [5.8, 93.0], [8.0, 91.5], [11.0, 91.2], [14.5, 91.0]
]

def get_eez_geojson():
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "India Mainland EEZ Boundary (200 NM)", "region": "Mainland"},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lon, lat] for lat, lon in INDIA_EEZ_COASTAL]
                }
            },
            {
                "type": "Feature",
                "properties": {"name": "Lakshadweep Islands EEZ", "region": "Lakshadweep"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[lon, lat] for lat, lon in LAKSHADWEEP_EEZ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"name": "Andaman & Nicobar Islands EEZ", "region": "Andaman"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[lon, lat] for lat, lon in ANDAMAN_NICOBAR_EEZ]]
                }
            }
        ]
    }
