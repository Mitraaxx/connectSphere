import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import toast from 'react-hot-toast';
import './AuthForm.css'; // Import the new CSS file

const AuthForm = ({ isRegister = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser, loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isRegister ? registerUser : loginUser;
    const toastMessages = {
      success: isRegister ? 'Registration successful! Please log in.' : 'Login successful!',
      error: isRegister ? 'Registration failed.' : 'Login failed.',
    };

    try {
      await action(username, password);
      toast.success(toastMessages.success);
      navigate(isRegister ? '/login' : '/home');
    } catch (error) {
      // --- MODIFIED: Improved error message detection ---
      const serverError = error.response?.data?.message || error.response?.data?.error;
      const errorMessage = serverError || toastMessages.error;
      
      toast.error(errorMessage);
      console.error(error);
      // --- END MODIFIED ---
    }
  };

  return (
    <div className="auth-page-container">
      <div className="form-box">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <input
            type="text"
            placeholder="Username"
            className="styled-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="styled-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="styled-button">
            {isRegister ? 'Register' : 'Login'}
          </button>

          <p className="redirect-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Login' : 'Sign Up'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;