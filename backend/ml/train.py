"""
ML Training Pipeline — Linear Regression on student performance data.

Usage:
    python ml/train.py

This script:
1. Loads the dataset from data/student_data.csv
2. Validates required columns and ranges
3. Splits into train/test (80/20, random_state=42)
4. Trains sklearn LinearRegression
5. Evaluates on the test set (MAE, RMSE, R2)
6. Saves the model + metadata to ml/model.joblib
"""
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "student_data.csv"
MODEL_PATH = BASE_DIR / "ml" / "model.joblib"

FEATURES = ["study_hours", "attendance", "previous_score"]
TARGET = "final_score"
RANDOM_STATE = 42
TEST_SIZE = 0.2
VERSION = "1.0.0"


def load_and_validate_data(path: Path = DATA_PATH) -> pd.DataFrame:
    """Load CSV and validate structure."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)

    # Check required columns
    required = FEATURES + [TARGET]
    for col in required:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Convert to numeric
    for col in required:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows with missing values
    initial_count = len(df)
    df = df.dropna(subset=required)
    dropped = initial_count - len(df)
    if dropped > 0:
        print(f"  Dropped {dropped} rows with missing values")

    # Validate ranges
    ranges = {
        "study_hours": (0, 24),
        "attendance": (0, 100),
        "previous_score": (0, 100),
        "final_score": (0, 100),
    }
    for col, (lo, hi) in ranges.items():
        invalid = df[(df[col] < lo) | (df[col] > hi)]
        if len(invalid) > 0:
            print(f"  WARNING: {len(invalid)} rows with {col} outside [{lo}, {hi}]")

    return df


def train_and_evaluate(df: pd.DataFrame) -> dict:
    """Train the model and return the artifact dictionary."""
    X = df[FEATURES].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    # Predictions (raw, no rounding)
    y_pred = model.predict(X_test)

    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)

    coefficients = {
        "bias": float(model.intercept_),
        "study_hours": float(model.coef_[0]),
        "attendance": float(model.coef_[1]),
        "previous_score": float(model.coef_[2]),
    }

    metrics = {"mae": float(mae), "rmse": rmse, "r2": float(r2)}

    artifact = {
        "model": model,
        "algorithm": "LinearRegression",
        "version": VERSION,
        "feature_names": FEATURES,
        "training_date": pd.Timestamp.now().isoformat(),
        "metrics": metrics,
        "coefficients": coefficients,
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

    return artifact


def main():
    print("=" * 60)
    print("Student Performance Predictor — Model Training Pipeline")
    print("=" * 60)

    print("\n1. Loading and validating data...")
    df = load_and_validate_data()
    print(f"   Loaded {len(df)} valid records")

    print("\n2. Training model...")
    artifact = train_and_evaluate(df)

    print(f"\n3. Evaluation results (test set, n={artifact['test_size']}):")
    print(f"   MAE:  {artifact['metrics']['mae']:.4f}")
    print(f"   RMSE: {artifact['metrics']['rmse']:.4f}")
    print(f"   R²:   {artifact['metrics']['r2']:.4f}")

    print(f"\n4. Coefficients:")
    for name, val in artifact["coefficients"].items():
        print(f"   {name}: {val:+.4f}")

    print(f"\n5. Saving model to {MODEL_PATH}...")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print("   Model saved successfully.")

    print("\n" + "=" * 60)
    print("Training complete. Start the API with:")
    print("  uvicorn app.main:app --reload --port 8000")
    print("=" * 60)


if __name__ == "__main__":
    main()
