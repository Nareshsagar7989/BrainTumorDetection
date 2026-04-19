"""
history_routes.py – Returns the logged-in user's prediction history.
GET /history – Fetch all predictions for the current user (latest first)
"""

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.database import get_predictions_collection
from app.schemas import HistoryResponse, PredictionHistoryItem
from bson import ObjectId

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "",
    response_model=HistoryResponse,
    summary="Get prediction history for the logged-in user",
)
async def get_history(current_user: dict = Depends(get_current_user)):
    """
    Returns all past predictions for the authenticated user.
    - Filtered by the logged-in user's ID
    - Sorted by timestamp descending (newest first)
    """
    predictions_col = get_predictions_collection()
    user_id = current_user["_id"]

    # Query predictions for this user, sort newest first
    cursor = predictions_col.find(
        {"user_id": user_id}
    ).sort("timestamp", -1)

    predictions_list = []
    async for doc in cursor:
        predictions_list.append(
            PredictionHistoryItem(
                prediction_id=str(doc["_id"]),
                result=doc["result"],
                probability=doc["probability"],
                confidence_percentage=doc["confidence_percentage"],
                image_filename=doc["image_filename"],
                image_path=doc.get("image_path", ""),
                timestamp=doc["timestamp"],
            )
        )

    return HistoryResponse(
        total=len(predictions_list),
        predictions=predictions_list,
    )
