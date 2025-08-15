import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

import LoginPage from './Pages/Login';
import RegisterPage from './Pages/Register';
import HomePage from './Pages/Home';
import MyItemsPage from './Pages/MyItems'; // --- ✨ IMPORT THE NEW PAGE ---

function App() {
  const { token } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/home" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/home" />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={token ? <HomePage /> : <Navigate to="/login" />} />
        {/* --- ✨ ADD THE NEW ROUTE FOR "MY ITEMS" --- */}
        <Route path="/my-items" element={token ? <MyItemsPage /> : <Navigate to="/login" />} />
        
        {/* Default route */}
        <Route path="*" element={<Navigate to={token ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
