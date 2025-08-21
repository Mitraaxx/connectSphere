import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  baseURL: 'https://connectsphere-wgn7.onrender.com/api',
});

// --- UPDATED INTERCEPTOR ---
// This function now handles BOTH the spinner and adding the auth token.
export const setupInterceptors = (spinnerContext) => {
  api.interceptors.request.use(
    (config) => {
      // Show spinner before the request is sent
      if (spinnerContext) spinnerContext.showSpinner();

      // --- CRITICAL ADDITION ---
      // Get the token from localStorage and add it to the request headers.
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      // Hide spinner if the request fails
      if (spinnerContext) spinnerContext.hideSpinner();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      // Hide spinner when the response is received
      if (spinnerContext) spinnerContext.hideSpinner();
      return response;
    },
    (error) => {
      // Hide spinner if the response has an error
      if (spinnerContext) spinnerContext.hideSpinner();
      return Promise.reject(error);
    }
  );
};

// --- FALLBACK INTERCEPTOR ---
// This is a safety measure. If setupInterceptors isn't called,
// this will still attempt to add the token.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;
