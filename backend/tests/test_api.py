"""Tests for input validation, model predictions, and dataset validation."""
import pytest
import numpy as np
import pandas as pd
from pathlib import Path
from app.schemas.schemas import PredictionRequest
from pydantic import ValidationError


class TestInputValidation:
    def test_valid_input(self):
        req = PredictionRequest(study_hours=5.0, attendance=80.0, previous_score=70.0)
        assert req.study_hours == 5.0

    def test_study_hours_out_of_range(self):
        with pytest.raises(ValidationError):
            PredictionRequest(study_hours=25.0, attendance=80.0, previous_score=70.0)

    def test_attendance_out_of_range(self):
        with pytest.raises(ValidationError):
            PredictionRequest(study_hours=5.0, attendance=101.0, previous_score=70.0)

    def test_previous_score_out_of_range(self):
        with pytest.raises(ValidationError):
            PredictionRequest(study_hours=5.0, attendance=80.0, previous_score=-1.0)

    def test_nan_rejected(self):
        with pytest.raises(ValidationError):
            PredictionRequest(study_hours=float("nan"), attendance=80.0, previous_score=70.0)

    def test_inf_rejected(self):
        with pytest.raises(ValidationError):
            PredictionRequest(study_hours=float("inf"), attendance=80.0, previous_score=70.0)


class TestDatasetValidation:
    def test_valid_csv(self):
        from app.services.dataset_service import validate_csv
        csv_content = b"study_hours,attendance,previous_score,final_score\n5,80,70,70\n3,65,60,58\n"
        result = validate_csv(csv_content)
        assert result["valid"] is True
        assert result["row_count"] == 2

    def test_missing_column(self):
        from app.services.dataset_service import validate_csv
        csv_content = b"study_hours,attendance\n5,80\n"
        result = validate_csv(csv_content)
        assert result["valid"] is False
        assert "Missing required column" in result["errors"][0]

    def test_invalid_range(self):
        from app.services.dataset_service import validate_csv
        csv_content = b"study_hours,attendance,previous_score,final_score\n25,80,70,70\n"
        result = validate_csv(csv_content)
        assert result["invalid_ranges"] > 0
