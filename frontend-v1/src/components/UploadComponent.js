import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, Typography, Button, Box, Alert, Divider } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt'; // --- NEW ---

// --- NEW ---
import CameraComponent from './CameraComponent'; // Import our new camera

/**
 * This is the main Upload Component.
 * It now manages its own "mode": 'select' (for file) or 'camera'.
 */
function UploadComponent({ onFileSelect, onUpload, image }) {
  const [fileError, setFileError] = useState(null);
  
  // --- NEW --- Internal state for this component
  const [mode, setMode] = useState('select'); // 'select' or 'camera'

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setFileError(null);
    if (fileRejections.length > 0) {
      setFileError('File error: Please upload an image file (jpg, png).');
    } else if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]); // This updates the 'image' prop
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  // --- NEW --- This is called by the CameraComponent
  const handleCapture = (file) => {
    setFileError(null);
    onFileSelect(file); // This updates the 'image' prop
    // The 'image' prop update will automatically close the camera
    // because the logic below `!image ? ...` will switch to the preview
    setMode('select'); // Reset mode
  };
  
  return (
    <Card sx={{ maxWidth: 500, width: '100%' }}>
      <CardContent sx={{ padding: '24px' }}>
        
        {/* --- LOGIC CHANGE --- */}
        {/* Do we have an image preview? */}
        {!image ? (
          
          // --- No Image Preview ---
          // Are we in 'select' or 'camera' mode?
          mode === 'select' ? (
            
            // --- 'select' Mode (the default) ---
            <>
              <Typography variant="h5" component="div" sx={{ textAlign: 'center', mb: 1 }}>
                Upload Cattle Photo
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: '#666666' }}>
                Get instant AI-powered breed classification
              </Typography>

              {fileError && <Alert severity="error" sx={{ mb: 2 }}>{fileError}</Alert>}

              {/* The Dropzone Box */}
              <Box
                {...getRootProps()}
                sx={{
                  /* ... (same styles as before) ... */
                  border: '2px dashed #bbbbbb', borderRadius: '8px', padding: '40px 20px',
                  textAlign: 'center', cursor: 'pointer',
                  backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
                  transition: 'background-color 0.2s',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                <input {...getInputProps()} />
                <UploadFileIcon sx={{ fontSize: 48, color: '#888888' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#555555' }}>
                  {isDragActive ? 'Drop the image here...' : 'Drag and drop your image here'}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ textAlign: 'center', my: 2, color: '#888888' }}>
                or
              </Typography>

              {/* --- NEW --- Button layout */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={open} // Triggers file browse
                  sx={{ textTransform: 'none', fontSize: '1rem' }}
                >
                  Browse Files
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => setMode('camera')} // --- NEW --- Switch to camera
                  startIcon={<CameraAltIcon />}
                  sx={{ textTransform: 'none', fontSize: '1rem' }}
                >
                  Take Photo
                </Button>
              </Box>
            </>
          ) : (
            
            // --- 'camera' Mode ---
            <CameraComponent
              onCapture={handleCapture}
              onCancel={() => setMode('select')}
            />
          )

        ) : (
          
          // --- Yes, We Have an Image Preview ---
          // (This logic is unchanged)
          <>
            <Typography variant="h5" component="div" sx={{ textAlign: 'center', mb: 2 }}>
              Image Selected
            </Typography>
            
            <img src={image.preview} alt="Preview" style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }}/>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'primary.main' }}>
              <CheckCircleIcon />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {image.file.name}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={onUpload}
              sx={{ textTransform: 'none', fontSize: '1rem', mt: 3 }}
            >
              Analyze Image
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default UploadComponent;