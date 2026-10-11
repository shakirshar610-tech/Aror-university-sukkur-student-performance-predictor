"""Schemas (Pydantic models) for API request and response validation."""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class PredictionRequest(BaseModel):
    study_hours: float = Field(..., ge=0, le=24, description="Study hours per day (0-24)")
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage (0-100)")
    previous_score: float = Field(..., ge=0, le=100, description="Previous academic score (0-100)")

    @field_validator("study_hours", "attendance", "previous_score")
    @classmethod
    def validate_finite(cls, v: float) -> float:
        if v != v or v in (float("inf"), float("-inf")):
            raise ValueError("Value must be finite")
        return v


class PredictionResponse(BaseModel):
    predicted_score: float = Field(..., description="Predicted final score (0-100, clamped)")
    raw_predicted_score: float = Field(..., description="Raw model output before clamping")
    model_version: str
    timestamp: datetime
    contributions: dict[str, float]


class StudentCreate(BaseModel):
    student_name: str = Field(..., min_length=1, max_length=200)
    student_code: Optional[str] = None
    course: str = Field(default="General", max_length=100)


class StudentUpdate(BaseModel):
    student_name: Optional[str] = Field(None, min_length=1, max_length=200)
    student_code: Optional[str] = None
    course: Optional[str] = Field(None, max_length=100)


class StudentResponse(BaseModel):
    id: str
    student_name: str
    student_code: Optional[str]
    course: str
    created_at: datetime
    updated_at: datetime


class ModelInfo(BaseModel):
    algorithm: str
    version: str
    feature_schema: dict
    training_date: str
    metrics: dict
    coefficients: dict
    train_size: int
    test_size: int


class HealthResponse(BaseModel):
    status: str
    model_available: bool
    version: str


class DatasetValidationResult(BaseModel):
    valid: bool
    row_count: int
    errors: list[str]
    warnings: list[str]
    missing_values: int
    invalid_ranges: int
    duplicates: int
    descriptive_stats: list[dict]


class AnalyticsOverview(BaseModel):
    total_students: int
    total_predictions: int
    avg_previous_score: Optional[float]
    avg_predicted_score: Optional[float]
    model_r2: Optional[float]
    model_mae: Optional[float]
