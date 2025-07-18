#!/usr/bin/env python3
"""
FastAPI NSE Stock Analysis Server
Start script for the backend service
"""

import os
import sys
import subprocess
from pathlib import Path

def install_requirements():
    """Install Python requirements if needed"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if requirements_file.exists():
        print("Installing Python requirements...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
    else:
        print("No requirements.txt found, skipping installation")

def start_server():
    """Start the FastAPI server"""
    print("Starting FastAPI NSE Stock Analysis Server...")
    
    # Set environment variables
    os.environ.setdefault("PORT", "5000")
    
    # Import and run the FastAPI app
    import uvicorn
    from main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    try:
        install_requirements()
        start_server()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)