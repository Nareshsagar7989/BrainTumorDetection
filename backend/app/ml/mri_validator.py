"""
mri_validator.py – Heuristic validation to check if an uploaded image
is likely a brain/skull MRI scan before running tumor inference.

Strategy:
  1. Grayscale dominance check  – MRI scans are near-grayscale; color photos have
                                   high variance between R, G, B channels.
  2. Dark background check      – Brain MRIs typically have a large dark background
                                   (> 30% of pixels are near-black).

These two lightweight checks reject obvious non-MRI images (selfies, nature photos,
documents, etc.) without requiring an extra ML model.
"""

import io
import numpy as np
from PIL import Image


# ── Tunable thresholds ────────────────────────────────────────────────────────
# Average per-pixel difference between color channels (0-255 scale).
# MRI scans score < 15; typical color photos score 20-80.
COLOR_DIFF_THRESHOLD = 10.0

# Fraction of pixels that must be "dark" (near-black background).
# Brain MRIs almost always have ≥ 25% dark background.
DARK_PIXEL_RATIO_MIN = 0.25

# A pixel is "dark" if all three channels are below this value (0-255).
DARK_PIXEL_VALUE = 30
# ─────────────────────────────────────────────────────────────────────────────


def is_valid_mri_scan(image_bytes: bytes) -> bool:
    """
    Heuristic check: returns True if the image plausibly looks like an MRI scan.

    Two independent checks must BOTH pass:
      - Grayscale dominance: avg channel difference < COLOR_DIFF_THRESHOLD
      - Sufficient dark background: dark pixel ratio ≥ DARK_PIXEL_RATIO_MIN

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        True  – image is likely an MRI scan → allow prediction.
        False – image does not look like MRI → reject with error.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img, dtype=np.float32)
    except Exception:
        # If the image can't even be opened, reject it
        return False

    r = img_array[:, :, 0]
    g = img_array[:, :, 1]
    b = img_array[:, :, 2]

    # ── Check 1: Grayscale dominance ─────────────────────────────────────────
    # In a grayscale-like image, R ≈ G ≈ B, so channel differences are tiny.
    rg_diff = np.mean(np.abs(r - g))
    rb_diff = np.mean(np.abs(r - b))
    gb_diff = np.mean(np.abs(g - b))
    avg_color_diff = (rg_diff + rb_diff + gb_diff) / 3.0

    if avg_color_diff > COLOR_DIFF_THRESHOLD:
        return False  # Too colorful – likely a regular photo, not an MRI

    # ── Check 2: Dark background presence ────────────────────────────────────
    # Brain MRIs have a distinctive dark (near-black) background.
    dark_mask = (r < DARK_PIXEL_VALUE) & (g < DARK_PIXEL_VALUE) & (b < DARK_PIXEL_VALUE)
    dark_pixel_ratio = np.sum(dark_mask) / dark_mask.size

    if dark_pixel_ratio < DARK_PIXEL_RATIO_MIN:
        return False  # Not enough dark background – likely not a brain MRI

    return True
