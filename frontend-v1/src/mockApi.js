// src/mockApi.js

// This file holds our "API Contract"
// We use this fake data to build the frontend
// before the backend is ready.

export async function predictImage(imageData) {
  try {
    console.log("ask for backend")
    const response = await fetch('http://localhost:2020/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // --- CORRECTED ---
    // Return the entire data object from the API
    return data;

  } catch (error) {
    console.error("Error predicting image:", error);
    // You might want to return a default/mock value or re-throw the error
    return null;
  }
}