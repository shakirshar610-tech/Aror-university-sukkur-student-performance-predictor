"""
Evaluation utility — prints detailed model performance metrics.

Usage:
    python ml/evaluate.py
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "model.joblib"
DATA_PATH = BASE_DIR / "data" / "student_data.csv"

FEATURES = ["study_hours", "attendance", "previous_score"]
TARGET = "final_score"
RANDOM_STATE = 42
TEST_SIZE = 0.2


def main():
    if not MODEL_PATH.exists():
        print("Model not found. Run 'python ml/train.py' first.")
        return

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]

    df = pd.read_csv(DATA_PATH)
    from sklearn.model_selection import train_test_split
    X = df[FEATURES].values
    y = df[TARGET].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    y_pred = model.predict(X_test)

    print("=" * 50)
    print("Model Evaluation Report")
    print("=" * 50)
    print(f"Algorithm:     {artifact['algorithm']}")
    print(f"Version:       {artifact['version']}")
    print(f"Train size:    {len(X_train)}")
    print(f"Test size:     {len(X_test)}")
    print()
    print(f"MAE:           {mean_absolute_error(y_test, y_pred):.4f}")
    print(f"RMSE:          {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
    print(f"R²:            {r2_score(y_test, y_pred):.4f}")
    print()
    print("Coefficients:")
    for name, val in artifact["coefficients"].items():
        print(f"  {name:20s}: {val:+.6f}")
    print()

    # Residuals
    residuals = y_test - y_pred
    print(f"Residual stats:")
    print(f"  Mean:    {residuals.mean():.4f}")
    print(f"  Std:     {residuals.std():.4f}")
    print(f"  Min:     {residuals.min():.4f}")
    print(f"  Max:     {residuals.max():.4f}")
    print("=" * 50)


if __name__ == "__main__":
    main()
