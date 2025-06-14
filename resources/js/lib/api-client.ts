import Axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { paths } from '@/apps/authentication/paths';
import { camelizeKeys, decamelizeKeys } from 'humps';
import useAuth from '@/store/useAuth';
import { convertDates } from './datetime';
import { createFormData } from './formdata';
import { toast } from 'sonner';


function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const { accessToken, tokenType } = useAuth.getState(); // Access the token from Zustand

  // Set Authorization header if token is available
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `${tokenType || "Bearer"} ${accessToken}`;
  }

  // Decamelize keys for consistency with backend expectations
  if (config.data) {
    if(config.headers['Content-Type'] == 'multipart/form-data'){
      config.data = createFormData(config.data);
    }else{
      config.data = decamelizeKeys(config.data);
    }
  }
  if (config.params) {
    config.params = decamelizeKeys(config.params);
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set("Accept", "application/json");
  } else {
    config.headers = new AxiosHeaders({ Accept: "application/json" });
  }


  config.withCredentials = true; // Ensure cookies are sent with requests
  return config;
}

// Axios instance setup
export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
api.interceptors.request.use(authRequestInterceptor);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Automatically camelize the response data
    response.data = camelizeKeys(response.data);

    const { data } = response;
    let message = data?.message;
    let status = data?.status ?? 'info';

    // Handle backend-specific "error" statuses in the response
    if (status === 'error') {
      const firstErrorKey = Object.keys(data.errors || {})[0];
      if (firstErrorKey) {
        message = data.errors[firstErrorKey];
      }
    }

    if (message) {
      toast.success( status, {
        description : message
      });
    }

    // Return the processed response data
    response.data = convertDates(response.data);
    return response.data;
  },
  (error: AxiosError) => {
    let message = error.response?.data?.message || error.message;

    // Handle HTTP error responses
    if (error.response) {
      const { status } = error.response;
      const publicRoutes = ['/auth','/request-tracker'];
      const isPublicPage = publicRoutes.some((route) => window.location.pathname.startsWith(route));
    
      // Handle unauthorized (401)
      if (status === 401) {
        const status = error.response?.data?.status || 'error';
        message = error.response?.data?.message || message;

        if (!isPublicPage) {
          toast.error(status, {
            description : message
          });

          // Redirect to login for non-public pages
          const redirectTo = new URLSearchParams().get('redirectTo') || window.location.pathname;
  
          setTimeout(() => {
            window.location.href = paths.auth.login.getHref(redirectTo);
          }, 2000);
        }
      }

      if(status > 403 && status < 500){
        toast.error(error.response?.data?.message);
      }
    } else {
      // Handle network errors and other issues
      if (message === 'Network Error') {
        message = 'Network connection issue. Please try again later.';
      }
      toast.error('Something went wrong!',{
        description : message
      });
    }

    // Log the error or send it to a monitoring service if needed
    console.error('API Error:', error);

    // Reject the promise to let the calling code handle it if necessary
    return Promise.reject(error);
  }
);
