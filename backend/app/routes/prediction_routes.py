"""
prediction_routes.py – MRI image upload and tumor prediction endpoint.
POST /predict – Accepts MRI image, runs CNN inference, stores result.
"""

import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status

from app.auth import get_current_user
from app.database import get_predictions_collection
from app.schemas import PredictionResponse
from app.models import PredictionDocument
from app.ml.model_loader import predict
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "tiff", "webp"}
MAX_FILE_SIZE_MB = 10

router = APIRouter(prefix="/predict", tags=["Prediction"])


def _is_valid_extension(filename: str) -> bool:
    """Check if the uploaded file has an allowed image extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Upload MRI scan and get tumor prediction",
)
async def predict_tumor(
    file: UploadFile = File(..., description="MRI brain scan image (JPG/PNG/BMP)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Processes an uploaded MRI image and returns a tumor prediction.
    
    Steps:
      1. Validate file type and size
      2. Save image to /uploads directory
      3. Run CNN model inference
      4. Store prediction in MongoDB
      5. Return structured prediction result
    """
    # ─── Step 1: File Validation ───────────────────────────────────────────────
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded.",
        )

    if not _is_valid_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file bytes and check size
    image_bytes = await file.read()
    file_size_mb = len(image_bytes) / (1024 * 1024)

    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.",
        )

    # ─── Step 2: Save Image ────────────────────────────────────────────────────
    # Create a unique filename to avoid collisions
    ext = file.filename.rsplit(".", 1)[-1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    # Organize uploads by user directory
    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user["_id"]))
    os.makedirs(user_upload_dir, exist_ok=True)

    save_path = os.path.join(user_upload_dir, unique_filename)

    try:
        with open(save_path, "wb") as f:
            f.write(image_bytes)
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image: {str(e)}",
        )

    # ─── Step 3: CNN Model Inference ──────────────────────────────────────────
    try:
        prediction_result = predict(image_bytes)
    except Exception as e:
        # Clean up saved file on prediction error
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(e)}",
        )

    result = prediction_result["result"]
    probability = prediction_result["probability"]
    confidence_percentage = prediction_result["confidence_percentage"]
    is_demo = prediction_result.get("demo_mode", False)

    # ─── Step 4: Store in MongoDB ─────────────────────────────────────────────
    timestamp = datetime.utcnow()
    prediction_doc = PredictionDocument(
        user_id=current_user["_id"],
        image_filename=file.filename,
        image_path=save_path,
        result=result,
        probability=probability,
        confidence_percentage=confidence_percentage,
        timestamp=timestamp,
    )

    predictions_col = get_predictions_collection()
    db_result = await predictions_col.insert_one(prediction_doc.to_dict())

    if not db_result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save prediction. Please try again.",
        )

    # ─── Step 5: Return Response ───────────────────────────────────────────────
    message = (
        f"⚠️ {'TUMOR DETECTED' if result == 'Tumor' else 'NO TUMOR DETECTED'} "
        f"({'Demo Mode' if is_demo else 'AI Analysis'}) – "
        f"Confidence: {confidence_percentage:.1f}%"
    )

    return PredictionResponse(
        prediction_id=str(db_result.inserted_id),
        result=result,
        probability=probability,
        confidence_percentage=confidence_percentage,
        image_filename=file.filename,
        timestamp=timestamp,
        message=message,
    )
