"""API route handlers."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.schemas import (
    PredictionRequest,
    PredictionResponse,
    HealthResponse,
    ModelInfo,
    DatasetValidationResult,
)
from app.services.model_service import predict as model_predict, get_model_info
from app.services.dataset_service import validate_csv

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
async def health():
    info = get_model_info()
    return HealthResponse(
        status="ok",
        model_available=info is not None,
        version=info["version"] if info else "unknown",
    )


@router.get("/model/info", response_model=ModelInfo)
async def model_info():
    info = get_model_info()
    if info is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run ml/train.py first.")
    return ModelInfo(
        algorithm=info["algorithm"],
        version=info["version"],
        feature_schema={"features": info["feature_names"], "target": "final_score"},
        training_date=info["training_date"],
        metrics=info["metrics"],
        coefficients=info["coefficients"],
        train_size=info["train_size"],
        test_size=info["test_size"],
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    try:
        result = model_predict(
            study_hours=req.study_hours,
            attendance=req.attendance,
            previous_score=req.previous_score,
        )
        return PredictionResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/dataset/validate", response_model=DatasetValidationResult)
async def validate_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")
    result = validate_csv(content)
    return DatasetValidationResult(**result)
