"""
model_loader.py – Loads the trained Keras CNN model for MRI classification.

IMPORTANT:
  - Place your trained model file at: backend/app/ml/brain_tumor_model.h5
  - If no model file is found, the app runs in DEMO MODE (simulated predictions).
  - See backend/ml_training/README.md for instructions on training the model.
"""

import os
import numpy as np
from PIL import Image
import io
import random
# We do lazy import of tensorflow to avoid startup crash if not installed
_model = None
_model_loaded = False
_demo_mode = False
MODEL_PATH = os.path.join(os.path.dirname(__file__), "brain_tumor_model.h5")
def load_model():
    """
    Loads the Keras CNN model.
    Called once on application startup.
    Falls back to demo mode if the model file is not found.
    """
    global _model, _model_loaded, _demo_mode

    if not os.path.exists(MODEL_PATH):
        print(
            f"⚠️  Model file not found at: {MODEL_PATH}\n"
            "   Running in DEMO MODE – predictions will be simulated.\n"
            "   Train the model using: backend/ml_training/train_model.py"
        )
        _demo_mode = True
        _model_loaded = True
        return
    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        _model_loaded = True
        _demo_mode = False
        print(f"✅ CNN model loaded successfully from: {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}\n   Running in DEMO MODE.")
        _demo_mode = True
        _model_loaded = True
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocesses an MRI image for CNN inference.
    
    Steps:
      1. Open image with Pillow
      2. Convert to RGB (handles grayscale, RGBA, etc.)
      3. Resize to 224x224 (model input size)
      4. Normalize pixel values to [0, 1]
      5. Add batch dimension: (1, 224, 224, 3)
    
    Args:
        image_bytes: Raw bytes of the uploaded image file
        
    Returns:
        numpy array of shape (1, 224, 224, 3) ready for model.predict()
    """
    # Open image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Ensure RGB (MRI scans are often grayscale; model expects 3 channels)
    img = img.convert("RGB")
    
    # Resize to match model input size
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    
    # Convert to numpy array and normalize
    img_array = np.array(img, dtype=np.float32) / 255.0
    
    # Add batch dimension: shape becomes (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array
def predict(image_bytes: bytes) -> dict:
    """
    Runs inference on the preprocessed MRI image.
    
    Args:
        image_bytes: Raw bytes of the uploaded MRI image
        
    Returns:
        dict with keys: result, probability, confidence_percentage
    """
    global _model, _demo_mode

    if not _model_loaded:
        load_model()

    # ─── DEMO MODE ────────────────────────────────────────────────────────────
    if _demo_mode:
        # Simulated prediction for demo/development purposes
        prob = round(random.uniform(0.2, 0.95), 4)
        result = "Tumor" if prob >= 0.5 else "Normal"
        return {
            "result": result,
            "probability": prob,
            "confidence_percentage": round(prob * 100, 2),
            "demo_mode": True,
        }

    # ─── REAL MODEL INFERENCE ─────────────────────────────────────────────────
    img_array = preprocess_image(image_bytes)

    # Run prediction – model outputs a single sigmoid probability
    # Output > 0.5 → Tumor, Output ≤ 0.5 → Normal
    raw_output = _model.predict(img_array, verbose=0)
    
    # Handle both single-output (binary) and two-output (softmax) models
    if raw_output.shape[-1] == 1:
        # Sigmoid output: probability of "Tumor"
        tumor_prob = float(raw_output[0][0])
    else:
        # Softmax output: [prob_normal, prob_tumor]
        tumor_prob = float(raw_output[0][1])

    result = "Tumor" if tumor_prob >= 0.5 else "Normal"
    # For Normal, confidence is 1 - tumor_prob
    confidence = tumor_prob if result == "Tumor" else (1 - tumor_prob)

    return {
        "result": result,
        "probability": round(tumor_prob, 4),
        "confidence_percentage": round(confidence * 100, 2),
        "demo_mode": False,
    }
