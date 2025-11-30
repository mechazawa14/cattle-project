import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Button } from '@mui/material'; // <-- Removed Chip

// ... (dataURLtoFile helper function is still here) ...
function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}


function CameraComponent({ onCapture, onCancel }) {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const file = dataURLtoFile(imageSrc, 'camera-photo.jpg');
      onCapture(file);
    }
  }, [webcamRef, onCapture]);

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      
      {/* --- This is the container --- */}
      <Box sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* The webcam feed is the base layer */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{
            facingMode: 'environment',
          }}
          // We removed the parent Box and all overlay layers
        />

      </Box>
      
      {/* Action buttons (unchanged) */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" size="large" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" size="large" onClick={capture}>
          Capture Photo
        </Button>
      </Box>
    </Box>
  );
}

export default CameraComponent;