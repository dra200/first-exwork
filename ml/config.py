"""
Configuration for the exWork.eu machine learning services.
"""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# Database configuration (using the same connection as the Node.js app)
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "database": os.environ.get("DB_NAME", "postgres"),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", "postgres"),
}

# API configuration
API_HOST = os.environ.get("ML_API_HOST", "0.0.0.0")
API_PORT = int(os.environ.get("ML_API_PORT", 5001))

# ML model parameters
MODEL_CONFIG = {
    "project_recommendation": {
        "embedding_size": 128,
        "learning_rate": 0.001,
        "batch_size": 32,
        "epochs": 10,
        "min_word_freq": 5,
    },
    "skill_matching": {
        "min_similarity_score": 0.7,
        "max_recommendations": 5,
    },
    "price_prediction": {
        "features": [
            "category", 
            "complexity", 
            "duration", 
            "required_skills"
        ],
        "model_type": "random_forest",
    }
}

# Create necessary directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)