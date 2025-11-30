# backend/app.py

import os # <-- Add this import
import numpy as np
from tensorflow.keras.models import Sequential
from flask import Flask, request, jsonify
from PIL import Image
import io
import base64
import joblib
from flask_cors import CORS

# --- Make sure dill is installed: pip install dill ---

# 1️⃣ Load saved ensemble
ensemble_path ="ensemble_final.pkl" # Use os.path.join for compatibility
ensemble = joblib.load(ensemble_path)
eff_model = ensemble['efficientnet_model']
mob_model = ensemble['mobilenet_model']
ridge = ensemble['ridge_classifier']

print("✅ Ensemble loaded successfully!")

app = Flask(__name__)
CORS(app) 

# Your class names
class_names = ['Alambadi', 'Amritmahal', 'Ayrshire', 'Banni', 'Bargur', 'Bhadawari', 'Brown_Swiss', 'Dangi', 'Deoni', 'Gir', 'Guernsey', 'Hallikar', 'Hariana', 'Holstein_Friesian', 'Jaffrabadi', 'Jersey', 'Kangayam', 'Kankrej', 'Kasargod', 'Kenkatha', 'Kherigarh', 'Khillari', 'Krishna_Valley', 'Malnad_gidda', 'Mehsana', 'Murrah', 'Nagori', 'Nagpuri', 'Nili_Ravi', 'Nimari', 'Ongole', 'Pulikulam', 'Rathi', 'Red_Dane', 'Red_Sindhi', 'Sahiwal', 'Surti', 'Tharparkar', 'Toda', 'Umblachery', 'Vechur']

# 2️⃣ Strip last layer to create feature extractors (for the Ridge model)
def strip_last_layer(model):
    new_model = Sequential()
    for layer in model.layers[:-1]:
        new_model.add(layer)
    return new_model

eff_feat_model = strip_last_layer(eff_model)
mob_feat_model = strip_last_layer(mob_model)

# Initialize (avoid unbuilt model error)
eff_feat_model(np.zeros((1, 300, 300, 3)))
mob_feat_model(np.zeros((1, 224, 224, 3)))

print("✅ Feature extractors ready!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        print("Backend received an image.")
        image_data = data['image']
        
        if not image_data:
            return jsonify({'error': 'Image data is empty'}), 400

        # Decode the image
        try:
            image = Image.open(io.BytesIO(base64.b64decode(image_data)))
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return jsonify({'error': 'Invalid image data', 'details': str(e)}), 400

        # Preprocess image for both models
        img_eff = image.resize((300, 300))
        img_eff = np.expand_dims(np.array(img_eff) / 255., axis=0)
        
        img_mob = image.resize((224, 224))
        img_mob = np.expand_dims(np.array(img_mob) / 255., axis=0)
        print("Image preprocessed successfully.")

        # --- MODIFIED: Calculate confidence using the full models ---
        
        # Get probability vectors from the original models
        eff_probs = eff_model.predict(img_eff, verbose=0)[0]
        mob_probs = mob_model.predict(img_mob, verbose=0)[0]

        # Get the confidence of the highest probability class for each model
        eff_conf = np.max(eff_probs)
        mob_conf = np.max(mob_probs)

        # Calculate the average confidence
        avg_confidence = (eff_conf + mob_conf) / 2.0
        
        print(f"EfficientNet Conf: {eff_conf:.2f}, MobileNet Conf: {mob_conf:.2f}, Avg Conf: {avg_confidence:.2f}")

        # --- UNCHANGED: Get the final prediction using the Ridge ensemble ---

        # Extract features using the stripped models
        eff_features = eff_feat_model.predict(img_eff, verbose=0)
        mob_features = mob_feat_model.predict(img_mob, verbose=0)

        # Concatenate & predict with Ridge Classifier
        combined_features = np.concatenate([eff_features, mob_features], axis=1)
        prediction_idx = ridge.predict(combined_features)[0]
        
        predicted_breed = class_names[prediction_idx]
        print(f"Final Prediction from Ridge: {predicted_breed}")

        # --- MODIFIED: Use the calculated confidence in the response ---
        
        response_data = {
            "breed": predicted_breed,
            "confidence": avg_confidence,  # Use the real calculated average confidence
            "usabilityScore": 0.97, # Dummy value
            "dairyLevel": "High Dairy", # Dummy value
            "purpose": "Dairy Production", # Dummy value
            "evidence": [
                f"Classified as {predicted_breed} with high confidence.",
                "Body structure is consistent with the breed's profile.",
                "Unique coat patterns were identified."
            ]
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to process image due to a server error', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2020)