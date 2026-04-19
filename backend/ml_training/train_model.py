"""
train_model.py – Complete CNN training script for brain tumor MRI classification.

Dataset: Kaggle Brain Tumor MRI Dataset
  https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
  OR
  https://www.kaggle.com/datasets/navoneel/brain-mri-images-for-brain-tumor-detection

Expected folder structure:
  dataset/
  ├── Training/
  │   ├── glioma/
  │   ├── meningioma/
  │   ├── notumor/      ← "Normal" class
  │   └── pituitary/
  └── Testing/
      ├── ...same classes...

For BINARY classification (Tumor vs. Normal):
  We merge glioma + meningioma + pituitary → "tumor"
  notumor → "normal"
Usage:
  pip install tensorflow pillow numpy matplotlib scikit-learn
  python train_model.py
"""
import os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
# ─── Configuration ────────────────────────────────────────────────────────────
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
NUM_CLASSES = 1          # Binary: 1 sigmoid output
LEARNING_RATE = 1e-4
DATASET_DIR = "./dataset" # Path to your downloaded dataset
MODEL_SAVE_PATH = "../app/ml/brain_tumor_model.h5"
print("TensorFlow version:", tf.__version__)
print("GPU Available:", tf.config.list_physical_devices('GPU'))
# ─── Data Augmentation ────────────────────────────────────────────────────────
# Training data augmentation prevents overfitting by creating variations
train_datagen = ImageDataGenerator(
    rotation_range=20,           # Random rotation ±20°
    width_shift_range=0.1,       # Horizontal shift
    height_shift_range=0.1,      # Vertical shift
    shear_range=0.1,             # Shear transformation
    zoom_range=0.15,             # Random zoom
    horizontal_flip=True,        # Mirror images
    brightness_range=[0.8, 1.2], # Brightness variation (simulates scan differences)
    fill_mode="nearest",
    validation_split=0.2,        # 20% for validation
)
# Test data: ONLY normalization (no augmentation)
test_datagen = ImageDataGenerator()
# ─── Data Generators ──────────────────────────────────────────────────────────
print("\n📂 Loading training data...")
# For BINARY classification, we need a binary_crossentropy setup
# Two-class approach: class_mode='binary' with sigmoid output
train_generator = train_datagen.flow_from_directory(
    os.path.join(DATASET_DIR, "Training"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",    # 0=notumor, 1=tumor
    subset="training",
    shuffle=True,
    seed=42,
)
val_generator = train_datagen.flow_from_directory(
    os.path.join(DATASET_DIR, "Training"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="validation",
    shuffle=False,
    seed=42,
)
# Note: With the 4-class dataset, Keras will create binary labels:
# If you have 4 folders, folders are sorted alphabetically:
# glioma=0, meningioma=1, notumor=2, pituitary=3
# For binary mode to work cleanly, restructure your dataset into:
# Training/tumor/  and  Training/normal/
# See README.md for dataset restructuring instructions.
print(f"Training samples: {train_generator.samples}")
print(f"Validation samples: {val_generator.samples}")
print(f"Classes found: {train_generator.class_indices}")
# ─── CNN Model Architecture ───────────────────────────────────────────────────
# Using Transfer Learning with EfficientNetB0 for best accuracy
# with a custom classification head for binary output.

def build_model():
    """
    Builds a CNN using EfficientNetB0 as backbone (transfer learning).
    EfficientNetB0 is pre-trained on ImageNet and extracts rich features.
    We freeze the backbone and train only our custom classification head.
    """
    # Base model (pre-trained, frozen)
    base_model = keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(224, 224, 3),
    )
    base_model.trainable = False  # Freeze pre-trained weights
    # Custom Classification Head
    inputs = keras.Input(shape=(224, 224, 3))
    x = keras.applications.efficientnet.preprocess_input(inputs)  # EfficientNet preprocessing
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)  # Binary output
    model = keras.Model(inputs, outputs, name="BrainTumorCNN")
    return model, base_model
model, base_model = build_model()
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss="binary_crossentropy",
    metrics=["accuracy", keras.metrics.AUC(name="auc")],
)
model.summary()
# ─── Callbacks ────────────────────────────────────────────────────────────────
callbacks = [
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    ),
    EarlyStopping(
        monitor="val_loss",
        patience=8,
        restore_best_weights=True,
        verbose=1,
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=4,
        min_lr=1e-7,
        verbose=1,
    ),
]
# ─── Phase 1: Train with Frozen Backbone ─────────────────────────────────────
print("\n🧠 Phase 1: Training classification head (backbone frozen)...")
history1 = model.fit(
    train_generator,
    epochs=15,
    validation_data=val_generator,
    callbacks=callbacks,
    verbose=1,
)
# ─── Phase 2: Fine-tuning (Unfreeze top layers) ───────────────────────────────
print("\n🔓 Phase 2: Fine-tuning top layers of backbone...")
base_model.trainable = True
# Freeze all layers except the last 15 (fine-tune top layers only)
for layer in base_model.layers[:-15]:
    layer.trainable = False
# Recompile with lower learning rate for fine-tuning
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 100),
    loss="binary_crossentropy",
    metrics=["accuracy", keras.metrics.AUC(name="auc")],
)
history2 = model.fit(
    train_generator,
    epochs=EPOCHS,
    initial_epoch=15,
    validation_data=val_generator,
    callbacks=callbacks,
    verbose=1,
)
# ─── Evaluation ───────────────────────────────────────────────────────────────
print("\n📊 Evaluating on test set...")

test_generator = test_datagen.flow_from_directory(
    os.path.join(DATASET_DIR, "Testing"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False,
)
test_loss, test_acc, test_auc = model.evaluate(test_generator)
print(f"\n✅ Test Accuracy: {test_acc * 100:.2f}%")
print(f"✅ Test AUC:      {test_auc:.4f}")
print(f"✅ Test Loss:     {test_loss:.4f}")
# Classification Report
y_pred = (model.predict(test_generator) > 0.5).astype(int)
y_true = test_generator.classes
print("\n📋 Classification Report:")
print(classification_report(y_true, y_pred, target_names=["Normal", "Tumor"]))
# ─── Save Final Model ─────────────────────────────────────────────────────────
final_save_path = MODEL_SAVE_PATH.replace(".h5", "_final.h5")
model.save(final_save_path)
print(f"\n💾 Final model saved to: {final_save_path}")
print(f"💾 Best model saved to:  {MODEL_SAVE_PATH}")
print("\n🎉 Training complete! Copy brain_tumor_model.h5 to backend/app/ml/")
# ─── Plot Training History ────────────────────────────────────────────────────
def plot_history(h1, h2):
    acc = h1.history["accuracy"] + h2.history["accuracy"]
    val_acc = h1.history["val_accuracy"] + h2.history["val_accuracy"]
    loss = h1.history["loss"] + h2.history["loss"]
    val_loss = h1.history["val_loss"] + h2.history["val_loss"]
    epochs_range = range(len(acc))
    plt.figure(figsize=(14, 5))
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label="Training Accuracy")
    plt.plot(epochs_range, val_acc, label="Validation Accuracy")
    plt.legend()
    plt.title("Accuracy")
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label="Training Loss")
    plt.plot(epochs_range, val_loss, label="Validation Loss")
    plt.legend()
    plt.title("Loss")
    plt.savefig("training_history.png")
    plt.show()
    print("📈 Training history plot saved to training_history.png")
plot_history(history1, history2)
