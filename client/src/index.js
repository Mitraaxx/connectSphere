import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './Context/AuthContext';
import { ItemProvider } from './Context/ItemContext';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import { SocketProvider } from './Context/SocketContext';
import { SpinnerProvider } from './Context/SpinnerContext';
import { createGlobalStyle, StyleSheetManager } from 'styled-components';

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Overlock:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

body {
  margin: 0;
  font-family: "Roboto", sans-serif;
  font-style: normal;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyleSheetManager shouldForwardProp={(prop) => prop !== 'theme'}>
      <GlobalStyle />
      <SpinnerProvider>
        <AuthProvider>
          <ItemProvider>
            <SocketProvider>
              <Toaster position="top-center" />
              <App />
            </SocketProvider>
          </ItemProvider>
        </AuthProvider>
      </SpinnerProvider>
    </StyleSheetManager>
  </React.StrictMode>
);
