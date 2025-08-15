import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import { AuthProvider } from './Context/AuthContext';
import { ItemProvider } from './Context/ItemContext';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css'; 

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Overlock:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap');

body {
  margin: 0;
  font-family: "Overlock", sans-serif;
  font-style: normal;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle/>
    <AuthProvider>
      <ItemProvider>
        <Toaster position="top-center" />
        <App />
     </ItemProvider>
    </AuthProvider>
  </React.StrictMode>
);
