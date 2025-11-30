import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // For the active step

// 1. Define the steps from the original plan
const steps = [
  'Image Uploaded',
  'Analyzing Body Structure',
  'Identifying Breed',
  'Generating Report'
];

function LoadingComponent() {
  // 2. Keep track of which step is active
  const [activeStep, setActiveStep] = useState(0);

  // 3. Use useEffect to run a series of timers
  useEffect(() => {
    // We know the real API call takes time, so we simulate
    // progress by advancing the step every second.
    
    const timer1 = setTimeout(() => setActiveStep(1), 1000);
    const timer2 = setTimeout(() => setActiveStep(2), 2000);
    const timer3 = setTimeout(() => setActiveStep(3), 3000);
    // At 4 seconds, the real API call (in App.js) will finish
    // and this component will be unmounted automatically.

    // Cleanup: Clear timers if the component unmounts early
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []); // The empty [] means this runs only once

  return (
    <Card sx={{ maxWidth: 500, width: '100%' }}>
      <CardContent sx={{ padding: '32px' }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>
          Analyzing Your Image...
        </Typography>
        
        {/* 4. Map over the steps to create the list */}
        <List>
          {steps.map((label, index) => (
            <Box key={label} sx={{ mb: 3 }}>
              <ListItem sx={{ p: 0 }}>
                <ListItemIcon>
                  {/* If step is done, show check */}
                  {index < activeStep && (
                    <CheckCircleIcon color="success" />
                  )}
                  {/* If step is active, show hourglass */}
                  {index === activeStep && (
                    <HourglassEmptyIcon color="primary" />
                  )}
                  {/* If step is future, show nothing (or a disabled icon) */}
                  {index > activeStep && (
                    <CheckCircleIcon color="disabled" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: index === activeStep ? 'bold' : 'normal',
                    color: index > activeStep ? 'text.disabled' : 'text.primary',
                  }}
                />
              </ListItem>
              
              {/* 5. Show the moving progress bar ONLY for the active step */}
              {index === activeStep && (
                <LinearProgress variant="indeterminate" sx={{ mt: 1, ml: 7 }} />
              )}
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default LoadingComponent;