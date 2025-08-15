import React from 'react';
import AuthForm from '../Components/AuthForm';

const RegisterPage = () => {
  // Pass the 'isRegister' prop to change it to a register form
  return <AuthForm isRegister={true} />;
};

export default RegisterPage;