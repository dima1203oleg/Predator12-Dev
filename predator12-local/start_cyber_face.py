#!/usr/bin/env python3
"""
Cyber Face AI Startup Script
============================

Main startup script for Cyber Face AI system.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'websockets',
        'numpy',
        'opencv-python',
        'pyyaml'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.info("Install missing packages with: pip install -r requirements.txt")
        return False
    
    return True

def setup_environment():
    """Setup environment variables"""
    # Set default environment variables if not present
    env_vars = {
        'CYBER_FACE_ENV': 'development',
        'CYBER_FACE_DEBUG': 'true',
        'CYBER_FACE_LOG_LEVEL': 'INFO',
        'CYBER_FACE_WS_HOST': '0.0.0.0',
        'CYBER_FACE_WS_PORT': '8002'
    }
    
    for key, default_value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = default_value
            logger.info(f"Set {key}={default_value}")

async def main():
    """Main startup function"""
    logger.info("🤖 Starting Cyber Face AI...")
    
    # Check dependencies
    if not check_dependencies():
        logger.error("Dependency check failed. Please install required packages.")
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    try:
        # Import and start the application
        from cyber_face.main import main as cyber_face_main
        await cyber_face_main()
        
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
    except Exception as e:
        logger.error(f"Failed to start Cyber Face AI: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutdown complete")
        sys.exit(0)
