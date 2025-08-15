import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import { AuthProvider } from './Context/AuthContext';
import { ItemProvider } from './Context/ItemContext';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css'; // --- ADDED: Import Leaflet's CSS

const GlobalStyle = createGlobalStyle`
  /* Switched to the 'Inter' font for consistency across the app */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    margin: 0;
    font-family: "Inter", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <AuthProvider>
      <ItemProvider>
        <Toaster position="top-center" />
        <App />
     </ItemProvider>
    </AuthProvider>
  </React.StrictMode>
);
