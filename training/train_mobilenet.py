"""
train_mobilenet.py
-------------------
This script trains MobileNetV2 on the Indian Bovine Breeds dataset.
It performs:
1. Data loading + augmentation
2. Transfer learning with frozen base
3. Fine-tuning top layers
4. Saving best fine-tuned model
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping, ModelCheckpoint


# ----------------------------
# CONFIG
# ----------------------------
DATA_DIR = "path/to/your/dataset"     # <-- replace on your system
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
NUM_CLASSES = 41
INITIAL_EPOCHS = 5
FINE_TUNE_EPOCHS = 3


# ----------------------------
# DATA PIPELINE
# ----------------------------
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=25,
    width_shift_range=0.25,
    height_shift_range=0.25,
    shear_range=0.25,
    zoom_range=[0.8, 1.2],
    brightness_range=[0.8, 1.2],
    channel_shift_range=30.0,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)

val_datagen = ImageDataGenerator(
    rescale=1.0/255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_generator = val_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)


# ----------------------------
# MODEL BUILDING
# ----------------------------
base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

base_model.trainable = False   # freeze first stage

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(512, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ----------------------------
# STAGE 1 TRAINING
# ----------------------------
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=INITIAL_EPOCHS,
    verbose=1
)


# ----------------------------
# STAGE 2 FINE TUNING
# ----------------------------
base_model.trainable = True

# freeze all except last 40 layers
for layer in base_model.layers[:-40]:
    layer.trainable = False

# add regularization
for layer in base_model.layers[-40:]:
    if hasattr(layer, "kernel_regularizer"):
        layer.kernel_regularizer = regularizers.l2(1e-4)

model.compile(
    optimizer=tf.keras.optimizers.AdamW(learning_rate=3e-5, weight_decay=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

callbacks = [
    ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=2, min_lr=1e-6, verbose=1),
    EarlyStopping(monitor='val_accuracy', patience=4, restore_best_weights=True, verbose=1),
    ModelCheckpoint("best_finetuned_mobilenet.keras", save_best_only=True, monitor="val_accuracy")
]

fine_tune_history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=callbacks,
    verbose=1
)

print("Training complete. Best model saved as best_finetuned_mobilenet.keras")
