# API Documentation

## Base URL

```
http://localhost:8000
```

When running locally. Swagger UI available at `/docs`.

## Endpoints

### GET /api/health

Returns API status and model availability.

**Response:**
```json
{
  "status": "ok",
  "model_available": true,
  "version": "1.0.0"
}
```

### GET /api/model/info

Returns model metadata, feature schema, and evaluation metrics.

**Response:**
```json
{
  "algorithm": "LinearRegression",
  "version": "1.0.0",
  "feature_schema": {
    "features": ["study_hours", "attendance", "previous_score"],
    "target": "final_score"
  },
  "training_date": "2026-10-11T...",
  "metrics": {
    "mae": 1.23,
    "rmse": 1.56,
    "r2": 0.98
  },
  "coefficients": {
    "bias": -5.2,
    "study_hours": 2.1,
    "attendance": 0.3,
    "previous_score": 0.8
  },
  "train_size": 80,
  "test_size": 20
}
```

### POST /api/predict

Generates a prediction from input features.

**Request:**
```json
{
  "study_hours": 5.0,
  "attendance": 80.0,
  "previous_score": 70.0
}
```

**Validation:**
- `study_hours`: 0–24, finite
- `attendance`: 0–100, finite
- `previous_score`: 0–100, finite

**Response:**
```json
{
  "predicted_score": 70.5,
  "raw_predicted_score": 70.52,
  "model_version": "1.0.0",
  "timestamp": "2026-10-11T...",
  "contributions": {
    "bias": -5.2,
    "study_hours": 10.5,
    "attendance": 24.0,
    "previous_score": 56.0
  }
}
```

**Errors:**
- `422` — Validation error (out-of-range or non-finite values)
- `503` — Model not loaded (run `python ml/train.py` first)
- `500` — Internal prediction error

### POST /api/dataset/validate

Validates an uploaded CSV file. Multipart form upload.

**Request:** `file` field (CSV, max 5 MB)

**Response:**
```json
{
  "valid": true,
  "row_count": 100,
  "errors": [],
  "warnings": [],
  "missing_values": 0,
  "invalid_ranges": 0,
  "duplicates": 0,
  "descriptive_stats": [
    {
      "column": "study_hours",
      "count": 100,
      "mean": 5.5,
      "median": 5.0,
      "std": 2.8,
      "min": 0.5,
      "max": 10.0
    }
  ]
}
```

## Error Handling

All errors return consistent JSON with appropriate HTTP status codes:

- `400` — Bad request (invalid file type, file too large)
- `422` — Validation error (Pydantic schema violation)
- `503` — Service unavailable (model not loaded)
- `500` — Internal server error

## CORS

CORS is configured for origins specified in `backend/.env` under `CORS_ORIGINS`. Default: `http://localhost:5173,http://localhost:3000`.
