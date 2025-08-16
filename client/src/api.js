import axios from 'axios';

const api = axios.create({
  baseURL: 'https://connectsphere-wgn7.onrender.com/api',
});

export const setupInterceptors = (spinnerContext) => {
  api.interceptors.request.use(
    (config) => {
      spinnerContext.showSpinner();
      return config;
    },
    (error) => {
      spinnerContext.hideSpinner();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      spinnerContext.hideSpinner();
      return response;
    },
    (error) => {
      spinnerContext.hideSpinner();
      return Promise.reject(error);
    }
  );
};

export default api;
