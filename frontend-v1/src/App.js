import React, { useState } from 'react';
import './App.css';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
// We will create/update these components
import UploadComponent from './components/UploadComponent';
import LoadingComponent from './components/LoadingComponent';
import ResultComponent from './components/ResultComponent';
import Header from './components/Header';
import { predictImage } from './mockApi'; // Re-add the import for predictImage

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#28a745',
    },
    background: {
      default: '#f4f4f4',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  const [appState, setAppState] = useState('upload');
  const [resultData, setResultData] = useState(null);

  // --- NEW ---
  // This state will hold the file object and its preview URL
  const [imageToAnalyze, setImageToAnalyze] = useState(null);

  // --- NEW ---
  /**
   * Called by UploadComponent when a file is selected.
   * It creates a "preview" URL for the image and stores it.
   */
  const handleFileSelect = (file) => {
    if (file) {
      setImageToAnalyze({
        file: file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  /**
   * // --- CHANGED ---
   * This is now called after a file is selected.
   * It switches to the 'loading' state.
   */
  const handleUpload = async () => {
    if (!imageToAnalyze || !imageToAnalyze.file) return;

    setAppState('loading');

    // Convert image file to base64 for the backend
    const reader = new FileReader();
    reader.readAsDataURL(imageToAnalyze.file);
    
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result.split(',')[1]; // Get only the base64 part

        // Make the API call using predictImage from mockApi.js
        const realData = await predictImage(base64Image);

        // Check if the API call failed or returned no data
        if (!realData) {
          throw new Error("API returned no data.");
        }

        // Combine real data with our local preview URL so we can still show the image
        setResultData({
          ...realData, // This spreads all keys from the backend (breed, confidence, etc.)
          imageUrl: imageToAnalyze.preview
        });

        // Success! Go to results.
        setAppState('result');
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to analyze image. Please try again.");
        setAppState('upload'); // Go back to start on error
      }
    };
  };

  /**
   * // --- CHANGED ---
   * Resets everything, including the selected image.
   */
  const handleNewAnalysis = () => {
    // --- NEW ---
    // Revoke the old preview URL to prevent memory leaks
    if (imageToAnalyze && imageToAnalyze.preview) {
      URL.revokeObjectURL(imageToAnalyze.preview);
    }
    setImageToAnalyze(null); // --- NEW ---
    setResultData(null);
    setAppState('upload');
  };

  const componentAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const renderComponent = () => {
    if (appState === 'upload') {
      return (
        <motion.div key="upload" {...componentAnimation}>
          {/* // --- CHANGED --- */}
          {/* We now pass down the new function and the image state */}
          <UploadComponent
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            image={imageToAnalyze}
          />
        </motion.div>
      );
    }
    if (appState === 'loading') {
      return (
        <motion.div key="loading" {...componentAnimation}>
          <LoadingComponent />
        </motion.div>
      );
    }
    if (appState === 'result') {
      return (
        <motion.div key="result" {...componentAnimation}>
          <ResultComponent data={resultData} onNewAnalysis={handleNewAnalysis} />
        </motion.div>
      );
    }
  };

  return (
    <>
      <Header />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <AnimatePresence mode="wait">
            {renderComponent()}
          </AnimatePresence>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;