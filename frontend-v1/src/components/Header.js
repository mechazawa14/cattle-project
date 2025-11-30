import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';

// This is the SVG data for a simple "cow" icon
// We're defining it here to avoid importing another file
const CowIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.9 6.9C20.4 4.4 18.2 2.5 15.6 2.5C15.4 2.5 15.1 2.5 14.9 2.6C14.1 1.7 13.1 1 12 1S9.9 1.7 9.1 2.6C8.9 2.5 8.6 2.5 8.4 2.5C5.8 2.5 3.6 4.4 3.1 6.9C1.2 7.8 0 9.7 0 11.9C0 14.7 2.2 17 5 17C5.1 17.6 5.3 18.1 5.5 18.6C6.3 20.9 8.7 23 12 23S17.7 20.9 18.5 18.6C18.7 18.1 18.9 17.6 19 17C21.8 17 24 14.7 24 11.9C24 9.7 22.8 7.8 20.9 6.9ZM12 4C12.6 4 13 4.4 13 5C13 5.6 12.6 6 12 6S11 5.6 11 5S11.4 4 12 4ZM7 5C7 4.4 7.4 4 8 4S9 4.4 9 5C9 5.6 8.6 6 8 6S7 5.6 7 5ZM19 15H5C3.3 15 2 13.7 2 11.9C2 10.6 2.8 9.5 4.1 9.1C4.6 8.9 5.1 8.5 5.3 8C5.6 7.1 6.2 6.3 7 5.8C7.2 5.7 7.3 5.6 7.4 5.4C7.8 4.7 8.5 4.3 9.3 4.1C9.8 5.3 10.8 6.1 12 6.1S14.2 5.3 14.7 4.1C15.5 4.3 16.2 4.7 16.6 5.4C16.7 5.6 16.8 5.7 17 5.8C17.8 6.3 18.4 7.1 18.7 8C18.9 8.5 19.4 8.9 19.9 9.1C21.2 9.5 22 10.6 22 11.9C22 13.7 20.7 15 19 15Z" />
  </SvgIcon>
);

function Header() {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
        marginBottom: '24px', // Add space below the header
      }}
    >
      <Toolbar sx={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        {/* The Icon */}
        <Box sx={{
          backgroundColor: 'primary.main',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1.5, // margin-right
        }}>
          <CowIcon sx={{ color: 'white' }} />
        </Box>

        {/* The Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold', 
            color: '#333' 
          }}
        >
          Cattle Classification
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;