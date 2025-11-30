"""
train_efficientnet.py
---------------------
Trains EfficientNetB3 on the Indian Bovine Breeds dataset.

Stages:
1. Transfer learning with frozen backbone
2. Fine-tuning top layers
3. Save best model
"""

import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import models, layers, optimizers, regularizers
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau


# ----------------------------
# CONFIG
# ----------------------------
DATA_DIR = "path/to/your/dataset"   # 🔥 REPLACE THIS
IMG_SIZE = (300, 300)
BATCH_SIZE = 16
NUM_CLASSES = 41
INITIAL_EPOCHS = 6
FINE_TUNE_EPOCHS = 10


# ----------------------------
# DATA PIPELINE
# ----------------------------
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=25,
    width_shift_range=0.25,
    height_shift_range=0.25,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    validation_split=0.2
)

val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    class_mode="categorical",
    batch_size=BATCH_SIZE,
    subset="training",
    shuffle=True
)

val_generator = val_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    class_mode="categorical",
    batch_size=BATCH_SIZE,
    subset="validation"
)


# ----------------------------
# MODEL — STAGE 1: Transfer Learning
# ----------------------------
base_model = EfficientNetB3(
    weights="imagenet",
    include_top=False,
    input_shape=(300, 300, 3)
)
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation="softmax")
])

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

stage1_ckpt = ModelCheckpoint(
    "efficientnet_stage1_best.keras",
    save_best_only=True,
    monitor="val_accuracy",
    verbose=1
)

early1 = EarlyStopping(
    monitor="val_accuracy",
    patience=3,
    restore_best_weights=True
)

# 🔥 Train Stage 1
model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=INITIAL_EPOCHS,
    callbacks=[stage1_ckpt, early1],
    verbose=1
)


# ----------------------------
# MODEL — STAGE 2: Fine-Tuning
# ----------------------------
# Unfreeze deeper layers
base_model.trainable = True

# Freeze all except last 50 layers
for layer in base_model.layers[:-50]:
    layer.trainable = False

# Add regularization
for layer in base_model.layers[-50:]:
    if hasattr(layer, "kernel_regularizer"):
        layer.kernel_regularizer = regularizers.l2(1e-5)

# Re-compile with small LR + weight decay
model.compile(
    optimizer=optimizers.AdamW(learning_rate=3e-6, weight_decay=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

stage2_ckpt = ModelCheckpoint(
    "efficientnet_stage2_best.keras",
    save_best_only=True,
    monitor="val_accuracy",
    verbose=1
)

early2 = EarlyStopping(
    monitor="val_accuracy",
    patience=3,
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=2,
    min_lr=1e-6,
    verbose=1
)

# 🔥 Train Stage 2 (fine-tuning)
model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=[stage2_ckpt, early2, reduce_lr],
    verbose=1
)

print("\n✅ EfficientNetB3 training complete.")
print("✔ Stage 1 best saved: efficientnet_stage1_best.keras")
print("✔ Stage 2 best saved: efficientnet_stage2_best.keras")
