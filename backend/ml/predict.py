"""
Prediction utility for standalone use outside the API.

Usage:
    python ml/predict.py --study-hours 5 --attendance 80 --previous-score 70
"""
import argparse
import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"


def load_and_predict(study_hours: float, attendance: float, previous_score: float) -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model not found. Run 'python ml/train.py' first.")

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    import numpy as np
    features = np.array([[study_hours, attendance, previous_score]])
    raw = float(model.predict(features)[0])
    clamped = max(0.0, min(100.0, raw))

    return {
        "predicted_score": clamped,
        "raw_predicted_score": raw,
        "model_version": artifact.get("version", "1.0.0"),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict student final score")
    parser.add_argument("--study-hours", type=float, required=True, help="Study hours per day (0-24)")
    parser.add_argument("--attendance", type=float, required=True, help="Attendance percentage (0-100)")
    parser.add_argument("--previous-score", type=float, required=True, help="Previous score (0-100)")
    args = parser.parse_args()

    result = load_and_predict(args.study_hours, args.attendance, args.previous_score)
    print(f"Predicted Score: {result['predicted_score']:.2f} (raw: {result['raw_predicted_score']:.2f})")
    print(f"Model Version: {result['model_version']}")
