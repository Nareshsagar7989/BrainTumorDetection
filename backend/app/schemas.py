"""
schemas.py – Pydantic v2 request/response models for validation and serialization.
These schemas define what data the API accepts and returns.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "SecurePass@123"
            }
        }
    }


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john@example.com",
                "password": "SecurePass@123"
            }
        }
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str
    role: str


class UserPublic(BaseModel):
    user_id: str
    username: str
    email: str
    role: str


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    prediction_id: str
    result: str                    # "Tumor" or "Normal"
    probability: float             # raw probability (0.0 – 1.0)
    confidence_percentage: float   # probability * 100
    image_filename: str
    timestamp: datetime
    message: str


class PredictionHistoryItem(BaseModel):
    prediction_id: str
    result: str
    probability: float
    confidence_percentage: float
    image_filename: str
    image_path: Optional[str] = None
    timestamp: datetime


class HistoryResponse(BaseModel):
    total: int
    predictions: list[PredictionHistoryItem]


# ─────────────────────────────────────────────────────────────────────────────
# GENERIC RESPONSE
# ─────────────────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True
