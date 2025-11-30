# train_ensemble.py
"""
GitHub-ready training script for the Cattle Breed Recognition Ensemble.

This script:
1. Loads EfficientNetB3 and MobileNetV2 pretrained models.
2. Strips last layers for feature extraction.
3. Loads dataset from a relative path.
4. Extracts features and trains a Ridge classifier.
5. Evaluates ensemble performance.
6. Saves the full ensemble to 'models/ensemble_final.pkl'.

Usage:
    python train_ensemble.py
"""

import os
import numpy as np
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB3, MobileNetV2
from sklearn.linear_model import RidgeClassifier
from sklearn.preprocessing import LabelBinarizer
from sklearn.metrics import accuracy_score
import joblib

# ----------------------------
# Paths (relative to repo)
# ----------------------------
DATA_DIR = "dataset/Indian_bovine_breeds"   # put dataset here
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

ENSEMBLE_PATH = os.path.join(MODEL_DIR, "ensemble_final.pkl")

# ----------------------------
# Load pretrained models
# ----------------------------
eff_model = EfficientNetB3(weights='imagenet', include_top=True)
mob_model = MobileNetV2(weights='imagenet', include_top=True)

# ----------------------------
# Feature extractor function
# ----------------------------
def strip_last_layer(model):
    """Remove the final classification layer for feature extraction."""
    new_model = Sequential()
    for layer in model.layers[:-1]:
        new_model.add(layer)
    return new_model

eff_feat_model = strip_last_layer(eff_model)
mob_feat_model = strip_last_layer(mob_model)

# Dummy pass to initialize
eff_feat_model(np.zeros((1, 300, 300, 3)))
mob_feat_model(np.zeros((1, 224, 224, 3)))

# ----------------------------
# Data generators
# ----------------------------
train_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
val_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

# EfficientNet uses 300x300
train_gen_eff = train_datagen.flow_from_directory(
    DATA_DIR, target_size=(300,300), batch_size=16, subset='training', shuffle=True
)
val_gen_eff = val_datagen.flow_from_directory(
    DATA_DIR, target_size=(300,300), batch_size=16, subset='validation', shuffle=False
)

# MobileNet uses 224x224
train_gen_mob = train_datagen.flow_from_directory(
    DATA_DIR, target_size=(224,224), batch_size=16, subset='training', shuffle=True
)
val_gen_mob = val_datagen.flow_from_directory(
    DATA_DIR, target_size=(224,224), batch_size=16, subset='validation', shuffle=False
)

# ----------------------------
# Extract features
# ----------------------------
print("⚙️ Extracting EfficientNet features...")
eff_features_train = eff_feat_model.predict(train_gen_eff, verbose=1)
eff_features_val = eff_feat_model.predict(val_gen_eff, verbose=1)

print("⚙️ Extracting MobileNet features...")
mob_features_train = mob_feat_model.predict(train_gen_mob, verbose=1)
mob_features_val = mob_feat_model.predict(val_gen_mob, verbose=1)

# ----------------------------
# Prepare labels
# ----------------------------
labels_train = train_gen_eff.classes
labels_val = val_gen_eff.classes

# ----------------------------
# Combine features and train Ridge
# ----------------------------
X_train = np.concatenate([eff_features_train, mob_features_train], axis=1)
X_val = np.concatenate([eff_features_val, mob_features_val], axis=1)

ridge = RidgeClassifier(alpha=1.0)
ridge.fit(X_train, labels_train)

# ----------------------------
# Evaluate ensemble
# ----------------------------
preds = ridge.predict(X_val)
accuracy = accuracy_score(labels_val, preds)
print(f"🔥 Ensemble Accuracy on validation set: {accuracy*100:.2f}%")

# ----------------------------
# Save ensemble
# ----------------------------
joblib.dump({
    'efficientnet_model': eff_model,
    'mobilenet_model': mob_model,
    'ridge_classifier': ridge
}, ENSEMBLE_PATH)

print(f"✅ Ensemble saved successfully at: {ENSEMBLE_PATH}")
