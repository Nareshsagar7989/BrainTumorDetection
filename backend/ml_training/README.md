# CNN Model Training Guide

## Step 1: Download Dataset from Kaggle

```bash
# Install Kaggle CLI
pip install kaggle

# Download brain tumor dataset (requires Kaggle account + API key)
kaggle datasets download -d masoudnickparvar/brain-tumor-mri-dataset
unzip brain-tumor-mri-dataset.zip -d backend/ml_training/dataset
```

**Dataset Structure Expected:**
```
dataset/
├── Training/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
└── Testing/
    ├── glioma/
    ├── meningioma/
    ├── notumor/
    └── pituitary/
```

---

## Step 2: Restructure for Binary Classification

For Tumor vs. Normal detection, restructure folders:

```bash
# On Windows (PowerShell):
mkdir dataset\Training\tumor
mkdir dataset\Training\normal
mkdir dataset\Testing\tumor
mkdir dataset\Testing\normal

# Move tumor classes
xcopy dataset\Training\glioma\* dataset\Training\tumor\
xcopy dataset\Training\meningioma\* dataset\Training\tumor\
xcopy dataset\Training\pituitary\* dataset\Training\tumor\
xcopy dataset\Training\notumor\* dataset\Training\normal\

xcopy dataset\Testing\glioma\* dataset\Testing\tumor\
xcopy dataset\Testing\meningioma\* dataset\Testing\tumor\
xcopy dataset\Testing\pituitary\* dataset\Testing\tumor\
xcopy dataset\Testing\notumor\* dataset\Testing\normal\
```

---

## Step 3: Install Training Dependencies

```bash
pip install tensorflow pillow numpy matplotlib scikit-learn
```

---

## Step 4: Train the Model

```bash
cd backend/ml_training
python train_model.py
```

Training time: ~10-30 minutes depending on GPU availability.
Expected accuracy: 95%+ on the test set.

---

## Step 5: Copy Model to Backend

```bash
# The script saves the best model directly to backend/app/ml/
# If it saved elsewhere, copy manually:
copy brain_tumor_model.h5 ..\app\ml\brain_tumor_model.h5
```

---

## Step 6: Restart the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
✅ CNN model loaded successfully from: .../brain_tumor_model.h5
```

---

## Model Architecture

| Component | Details |
|-----------|---------|
| **Backbone** | EfficientNetB0 (ImageNet pre-trained) |
| **Input size** | 224 × 224 × 3 |
| **Output** | 1 sigmoid neuron (binary) |
| **Loss** | Binary Crossentropy |
| **Optimizer** | Adam |
| **Training strategy** | Two-phase: frozen backbone → fine-tuning |

---

> **No GPU?** Training still works on CPU but will take longer (~1-2 hours).
> For fast experimentation, use Google Colab (free GPU).
