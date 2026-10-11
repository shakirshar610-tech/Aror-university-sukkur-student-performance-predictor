"""Dataset validation service."""
import pandas as pd
import numpy as np
import io


REQUIRED_COLUMNS = ["study_hours", "attendance", "previous_score", "final_score"]
VALID_RANGES = {
    "study_hours": (0, 24),
    "attendance": (0, 100),
    "previous_score": (0, 100),
    "final_score": (0, 100),
}


def validate_csv(content: bytes) -> dict:
    """Validate a CSV file content and return statistics."""
    errors = []
    warnings = []
    missing_values = 0
    invalid_ranges = 0
    duplicates = 0

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        return {
            "valid": False,
            "row_count": 0,
            "errors": [f"Failed to parse CSV: {str(e)}"],
            "warnings": [],
            "missing_values": 0,
            "invalid_ranges": 0,
            "duplicates": 0,
            "descriptive_stats": [],
        }

    # Check required columns
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            errors.append(f"Missing required column: {col}")

    if errors:
        return {
            "valid": False,
            "row_count": len(df),
            "errors": errors,
            "warnings": warnings,
            "missing_values": 0,
            "invalid_ranges": 0,
            "duplicates": 0,
            "descriptive_stats": [],
        }

    # Convert to numeric
    for col in REQUIRED_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Missing values
    missing_values = int(df[REQUIRED_COLUMNS].isna().sum().sum())

    # Invalid ranges
    for col, (min_val, max_val) in VALID_RANGES.items():
        if col in df.columns:
            invalid = df[col].notna() & ((df[col] < min_val) | (df[col] > max_val))
            invalid_ranges += int(invalid.sum())

    # Duplicates
    duplicates = int(df.duplicated().sum())

    # Warnings
    if len(df) < 10:
        warnings.append("Dataset is very small for reliable model training")

    # Descriptive stats
    stats = []
    for col in REQUIRED_COLUMNS:
        if col in df.columns:
            series = df[col].dropna()
            stats.append({
                "column": col,
                "count": int(len(series)),
                "mean": float(series.mean()) if len(series) > 0 else 0,
                "median": float(series.median()) if len(series) > 0 else 0,
                "std": float(series.std()) if len(series) > 1 else 0,
                "min": float(series.min()) if len(series) > 0 else 0,
                "max": float(series.max()) if len(series) > 0 else 0,
            })

    return {
        "valid": len(errors) == 0,
        "row_count": len(df),
        "errors": errors,
        "warnings": warnings,
        "missing_values": missing_values,
        "invalid_ranges": invalid_ranges,
        "duplicates": duplicates,
        "descriptive_stats": stats,
    }
