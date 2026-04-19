"""
admin_routes.py – Protected administrative endpoints.
Requires the user to have the 'admin' role via the get_current_admin dependency.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from app.auth import get_current_admin
from app.database import get_users_collection, get_predictions_collection

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", summary="Get all registered users")
async def get_all_users(admin: dict = Depends(get_current_admin)) -> List[Dict[str, Any]]:
    """
    Fetches all registered users from the system.
    Only accessible by administrators.
    """
    users_col = get_users_collection()
    
    # Exclude the hashed_password from the payload for security
    users_cursor = users_col.find({}, {"hashed_password": 0})
    users = await users_cursor.to_list(length=1000) # Cap at 1000 for safety
    
    # Convert ObjectIds to strings
    for user in users:
        user["_id"] = str(user["_id"])
        
    return users


@router.get("/predictions", summary="Get global prediction history")
async def get_all_predictions(limit: int = 50, admin: dict = Depends(get_current_admin)) -> List[Dict[str, Any]]:
    """
    Fetches the most recent predictions across ALL users.
    Only accessible by administrators.
    """
    preds_col = get_predictions_collection()
    
    # Sort by timestamp descending (newest first)
    cursor = preds_col.find().sort("timestamp", -1).limit(limit)
    predictions = await cursor.to_list(length=limit)
    
    for p in predictions:
        p["_id"] = str(p["_id"])
        # Stringify the user_id just in case
        if "user_id" in p:
            p["user_id"] = str(p["user_id"])
            
    return predictions


@router.get("/stats", summary="Get system statistics KPIs")
async def get_system_stats(admin: dict = Depends(get_current_admin)) -> Dict[str, Any]:
    """
    Computes high-level dashboard metrics.
    Only accessible by administrators.
    """
    users_col = get_users_collection()
    preds_col = get_predictions_collection()
    
    total_users = await users_col.count_documents({})
    total_predictions = await preds_col.count_documents({})
    
    # Count how many of those predictions resulted in a "Tumor" prediction
    tumor_predictions = await preds_col.count_documents({"result": "Tumor"})
    normal_predictions = total_predictions - tumor_predictions
    
    tumor_ratio = 0
    if total_predictions > 0:
        tumor_ratio = round((tumor_predictions / total_predictions) * 100, 2)
        
    return {
        "metrics": {
            "total_users": total_users,
            "total_predictions": total_predictions,
            "tumor_detections": tumor_predictions,
            "normal_detections": normal_predictions,
            "tumor_ratio_percentage": tumor_ratio
        }
    }


# ─── ML Model Training Routes ────────────────────────────────────────────────
import subprocess
import os
from fastapi import BackgroundTasks

# Simple in-memory tracker. In production with multiple workers, use Redis/DB.
training_state = {
    "status": "idle", # "idle", "training", "error"
    "logs": []
}

def _run_training():
    """Background task to run the ML training script."""
    global training_state
    training_state["status"] = "training"
    training_state["logs"] = ["Initializing model training..."]
    
    # Path to the training script relative to backend root
    script_path = os.path.join(os.path.dirname(__file__), "../../ml_training/train_model.py")
    
    try:
        # Run process and capture output continuously
        process = subprocess.Popen(
            ["python", script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT, # pipe stderr into stdout
            text=True
        )
        
        for line in iter(process.stdout.readline, ''):
            clean_line = line.strip()
            if clean_line:
                training_state["logs"].append(clean_line)
                # Keep logs reasonably sized
                if len(training_state["logs"]) > 500:
                    training_state["logs"].pop(0)
                    
        process.stdout.close()
        return_code = process.wait()
        
        if return_code == 0:
            training_state["status"] = "idle"
            training_state["logs"].append("✅ Training completed successfully.")
            # Trigger the app to reload the new model across the service
            from app.ml.model_loader import load_model
            load_model()
        else:
            training_state["status"] = "error"
            training_state["logs"].append(f"❌ Training failed with exit code {return_code}.")
            
    except Exception as e:
        training_state["status"] = "error"
        training_state["logs"].append(f"❌ Exception starting script: {str(e)}")


@router.post("/model/retrain", summary="Trigger ML model retraining")
async def trigger_retraining(
    background_tasks: BackgroundTasks, 
    admin: dict = Depends(get_current_admin)
) -> Dict[str, Any]:
    """
    Kicks off the ML model training script in the background.
    """
    global training_state
    if training_state["status"] == "training":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A model training session is already in progress."
        )
        
    background_tasks.add_task(_run_training)
    
    return {
        "message": "Model training started in the background.",
        "status": "training"
    }


@router.get("/model/status", summary="Get model training status")
async def get_training_status(admin: dict = Depends(get_current_admin)) -> Dict[str, Any]:
    """
    Returns the current status of the background model training 
    and the latest console logs.
    """
    global training_state
    return training_state

