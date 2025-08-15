import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import toast from 'react-hot-toast';

// --- STYLED COMPONENTS ---

const AuthPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-image: url('/Nature.png');
  background-size: cover;
  background-position: center;
`;

// --- ✨ Theme Update: Matched container to homepage style ---
const FormBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(249, 249, 249, 0.65); /* Lighter, cleaner glass effect */
  border-radius: 20px; /* Matched radius */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1); /* Softer shadow */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.4);
`;

const Title = styled.h2`
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 1.5rem; /* Adjusted margin */
  font-size: 2rem;
  font-weight: 535;
`;

// --- ✨ Theme Update: Using the same input style as ItemForm for consistency ---
const sharedInputStyles = css`
  width: 100%;
  padding: 14px;
  font-size: 0.95rem;
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid transparent;
  background-color: rgba(228, 228, 229, 0.6); /* iOS-style input background */
  color: #1c1c1e;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: #8e8e93; /* iOS-style placeholder color */
  }

  &:focus {
    outline: none;
    background-color: white;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StyledInput = styled.input`
  ${sharedInputStyles}
`;

// --- ✨ Theme Update: Matched button style to the primary black button ---
const StyledButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background-color: #000;
  color: #fff;
  font-family: inherit; /* FIX: Inherit global font */
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
`;

const RedirectText = styled.p`
  text-align: center;
  color: #333; /* Slightly softer text color */
  font-size: 0.9rem;
  a {
    color: #000;
    font-weight: 550;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

// --- REACT COMPONENT (No logic changes needed) ---

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
      const errorMessage = error.response?.data?.error || toastMessages.error;
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <AuthPageContainer>
      <FormBox>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Title>{isRegister ? 'Create Account' : 'Welcome Back'}</Title>
          <StyledInput
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <StyledInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <StyledButton type="submit">
            {isRegister ? 'Register' : 'Login'}
          </StyledButton>

          <RedirectText>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Login' : 'Sign Up'}
            </Link>
          </RedirectText>
        </form>
      </FormBox>
    </AuthPageContainer>
  );
};

export default AuthForm;
