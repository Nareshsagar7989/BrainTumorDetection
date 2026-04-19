"""
models.py – MongoDB document structure definitions.
These are plain Python classes that represent how data is stored in MongoDB.
"""

from datetime import datetime
from typing import Optional


class UserDocument:
    """Represents a user document stored in MongoDB."""

    def __init__(
        self,
        username: str,
        email: str,
        hashed_password: str,
        role: str = "user",
        created_at: datetime = None,
    ):
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.role = role
        self.created_at = created_at or datetime.utcnow()
        self.is_active = True

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "role": self.role,
            "created_at": self.created_at,
            "is_active": self.is_active,
        }


class PredictionDocument:
    """Represents a prediction document stored in MongoDB."""

    def __init__(
        self,
        user_id: str,
        image_filename: str,
        image_path: str,
        result: str,
        probability: float,
        confidence_percentage: float,
        timestamp: datetime = None,
    ):
        self.user_id = user_id
        self.image_filename = image_filename
        self.image_path = image_path
        self.result = result
        self.probability = probability
        self.confidence_percentage = confidence_percentage
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "image_filename": self.image_filename,
            "image_path": self.image_path,
            "result": self.result,
            "probability": self.probability,
            "confidence_percentage": self.confidence_percentage,
            "timestamp": self.timestamp,
        }
