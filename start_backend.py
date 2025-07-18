#!/usr/bin/env python3
"""
Startup script for the FastAPI backend
"""

import os
import sys
import subprocess
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory
os.chdir(backend_dir)

if __name__ == "__main__":
    try:
        print("Starting FastAPI NSE Stock Analysis Server...")
        
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
        
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)