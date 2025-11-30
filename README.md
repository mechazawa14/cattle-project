# cattle-project
A web app that classifies Indian cattle breeds from uploaded images using a trained ensemble of EfficientNet and MobileNet models.

How to Run
1️⃣ Backend (Python + Flask)

Open terminal and navigate to the backend folder:
cd backend


Activate the virtual environment:
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux


Install dependencies:
pip install -r requirements.txt

Run the backend server:

python app.py
The server should start on http://127.0.0.1:5000.



2️⃣ Frontend (React)

Open another terminal and go to the frontend folder:
cd frontend-v1


Install dependencies:
npm install


Start the React app:

npm start
The app should open in your browser on http://localhost:3000.

Usage

Upload an image of a cattle breed on the frontend.
The backend will analyze it using the saved ensemble model.
Classification results, confidence scores, and other information will be displayed.

Notes
The .pkl ensemble model is required locally to run predictions.
Large model and training files are not included in the repo.


How It Works

The React frontend communicates with the Python Flask backend (app.py) via HTTP requests. When you upload an image, the frontend sends it to the backend, which loads the pre-trained ensemble model to analyze the image and return the classification results. The model itself was rigorously trained on the Indian cattle breeds dataset: images were cleaned, normalized, and augmented on Google Colab, with EfficientNet and MobileNet trained separately, their features combined, and a Ridge classifier fine-tuned to achieve high accuracy. Every step — from mounting the dataset on Drive to careful fine-tuning — was performed to ensure robust and reliable predictions.

