"""
SamudraDrishti - Single-Command Launch Script
Starts the FastAPI backend on port 8000 and the Next.js production server on port 3000.
"""

import os
import sys
import time
import subprocess
import webbrowser
import uvicorn

if __name__ == "__main__":
    server_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server")
    client_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "client")
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)

    print("======================================================================")
    print("  SamudraDrishti | 3D Ocean Digital Twin Platform")
    print("  National Oceanographic Digital Twin & In-Situ Observation Platform")
    print("======================================================================")
    print("  * Next.js Dual 3D Console: http://localhost:3000")
    print("  * FastAPI Ocean Engine:    http://localhost:8000")
    print("  * OpenAPI Documentation:   http://localhost:8000/docs")
    print("======================================================================\n")

    # Use the dev server until a production build exists; `next start` otherwise
    # stays on its loading screen when `.next` has not been generated yet.
    next_proc = None
    try:
        next_script = "start" if os.path.isdir(os.path.join(client_dir, ".next")) else "dev"
        next_cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", next_script]
        next_proc = subprocess.Popen(next_cmd, cwd=client_dir)
        time.sleep(1.5)
    except Exception as e:
        print(f"Note: Could not spawn Next.js process automatically: {e}")

    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=False)
    finally:
        if next_proc:
            next_proc.terminate()
