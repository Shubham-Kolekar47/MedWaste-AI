"""
MedWaste AI - Full Stack Launcher
Starts Flask Backend (Port 5000) and Frontend HTTP Server (Port 5173).
"""

import os
import sys
import subprocess
import time
import webbrowser

WORKSPACE = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(WORKSPACE, "venv", "Scripts", "python.exe")
PYTHON_EXE = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable

def main():
    print("=" * 60)
    print("   MEDWASTE AI - STARTING FULL STACK SYSTEM")
    print("=" * 60)
    print(f"[*] Python Interpreter : {PYTHON_EXE}")
    print(f"[*] Workspace Root      : {WORKSPACE}")

    # 1. Start Backend
    backend_script = os.path.join(WORKSPACE, "backend", "app.py")
    print("\n[+] Launching Flask Backend on http://127.0.0.1:5000 ...")
    backend_proc = subprocess.Popen(
        [PYTHON_EXE, backend_script],
        cwd=WORKSPACE
    )

    # Give backend a moment to start
    time.sleep(1.5)

    # 2. Start Frontend Server
    frontend_dir = os.path.join(WORKSPACE, "frontend")
    print(f"[+] Launching Frontend HTTP Server on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        [PYTHON_EXE, "-m", "http.server", "5173", "--directory", frontend_dir],
        cwd=WORKSPACE
    )

    time.sleep(1)
    print("\n" + "=" * 60)
    print("   [SUCCESS] Both Backend and Frontend are running!")
    print("   - Frontend URL : http://localhost:5173")
    print("   - Backend API  : http://127.0.0.1:5000/api")
    print("   - Health Check : http://127.0.0.1:5000/api/health")
    print("   - Demo Login   : admin@medwaste.ai / admin123")
    print("=" * 60)
    print("\nPress Ctrl+C to stop both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
