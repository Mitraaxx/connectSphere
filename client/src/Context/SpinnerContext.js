import React, { createContext, useState, useContext } from 'react';

const SpinnerContext = createContext();

export const useSpinner = () => useContext(SpinnerContext);

export const SpinnerProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showSpinner = () => setIsVisible(true);
  const hideSpinner = () => setIsVisible(false);

  return (
    <SpinnerContext.Provider value={{ showSpinner, hideSpinner }}>
      {children}
      {isVisible && <Spinner />}
    </SpinnerContext.Provider>
  );
};

// You'll need to create this Spinner component
import Spinner from '../Components/Spinner';
