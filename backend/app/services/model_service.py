"""ML model loading and prediction service."""
import joblib
import numpy as np
from pathlib import Path
from datetime import datetime
from app.core.config import settings

_model_cache = None
_model_info_cache = None


def load_model():
    """Load the trained model from disk. Returns (model, model_info) or (None, None)."""
    global _model_cache, _model_info_cache

    if _model_cache is not None:
        return _model_cache, _model_info_cache

    model_path = Path(settings.model_path)
    if not model_path.exists():
        return None, None

    artifact = joblib.load(model_path)
    _model_cache = artifact["model"]
    _model_info_cache = {
        "algorithm": artifact.get("algorithm", "LinearRegression"),
        "version": artifact.get("version", "1.0.0"),
        "feature_names": artifact.get("feature_names", ["study_hours", "attendance", "previous_score"]),
        "training_date": artifact.get("training_date", ""),
        "metrics": artifact.get("metrics", {}),
        "coefficients": artifact.get("coefficients", {}),
        "train_size": artifact.get("train_size", 0),
        "test_size": artifact.get("test_size", 0),
    }
    return _model_cache, _model_info_cache


def predict(study_hours: float, attendance: float, previous_score: float) -> dict:
    """Generate a prediction using the loaded model."""
    model, info = load_model()
    if model is None:
        raise RuntimeError("Model not loaded. Run ml/train.py first.")

    features = np.array([[study_hours, attendance, previous_score]])
    raw_prediction = float(model.predict(features)[0])
    clamped = max(0.0, min(100.0, raw_prediction))

    coefficients = info.get("coefficients", {})
    contributions = {
        "bias": coefficients.get("bias", 0.0),
        "study_hours": coefficients.get("study_hours", 0.0) * study_hours,
        "attendance": coefficients.get("attendance", 0.0) * attendance,
        "previous_score": coefficients.get("previous_score", 0.0) * previous_score,
    }

    return {
        "predicted_score": clamped,
        "raw_predicted_score": raw_prediction,
        "model_version": info["version"],
        "timestamp": datetime.utcnow().isoformat(),
        "contributions": contributions,
    }


def get_model_info() -> dict | None:
    """Return model metadata or None if not loaded."""
    _, info = load_model()
    if info is None:
        return None
    return info
