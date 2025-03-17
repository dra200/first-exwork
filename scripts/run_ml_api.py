#!/usr/bin/env python3
"""
Run the exWork.eu Machine Learning API server.
"""
import os
import sys
import logging

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Run the ML API server."""
    logging.info("Starting exWork.eu ML API server")
    
    try:
        # Import here to ensure paths are set up correctly
        from ml.api.server import run_server
        
        # Run the server
        run_server()
    except Exception as e:
        logging.error(f"Failed to start ML API server: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()