import Axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { useNotifications } from '@/components/ui/notifications';
import { paths } from '@/apps/authentication/paths';
import { camelizeKeys, decamelizeKeys } from 'humps';
import useAuth from '@/store/useAuth';
import { convertDates } from './datetime';
import { createFormData } from './formdata';

// Throttle settings for toast notifications
let lastErrorTime = 0;

// Extend AxiosRequestConfig to include optional skipNotification property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipNotification?: boolean;
}

function authRequestInterceptor(config: ExtendedAxiosRequestConfig) {
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

    // Show success/error messages if available and skipNotification is not set
    if (message && !response.config.skipNotification) {
      showToastWithThrottle(status, message);
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
      const publicRoutes = ['/issue-tracker'];
      const isPublicPage = publicRoutes.some((route) => window.location.pathname.startsWith(route));
    
      // Handle unauthorized (401)
      if (status === 401) {
        const status = error.response?.data?.status || 'error';
        message = error.response?.data?.message || message;

        if (!isPublicPage) {
          if (!error.config?.skipNotification) {
            showToastWithThrottle(status, message);
          }

          // Redirect to login for non-public pages
          const redirectTo = new URLSearchParams().get('redirectTo') || window.location.pathname;
  
          setTimeout(() => {
            window.location.href = paths.auth.login.getHref(redirectTo);
          }, 2000);
        }
      }

      // Handle forbidden (403)
      if (status === 403) {
        if (!error.config?.skipNotification) {
          showToastWithThrottle('error', 'Access denied. Redirecting to login.');
        }
        setTimeout(() => {
          window.location.href = paths.auth.login.getHref();
        }, 2000);
      }

      if(status > 403 && status < 500){
        if (!error.config?.skipNotification && error.response?.data) {
          showToastWithThrottle(error.response?.data?.status, error.response?.data.message);
        }
      }
    } else {
      // Handle network errors and other issues
      if (message === 'Network Error') {
        message = 'Network connection issue. Please try again later.';
      }
      if (!error.config?.skipNotification) {
        showToastWithThrottle('error', message);
      }
    }

    // Log the error or send it to a monitoring service if needed
    console.error('API Error:', error);

    // Reject the promise to let the calling code handle it if necessary
    return Promise.reject(error);
  }
);

// Utility: Throttled notification handler
export const showToastWithThrottle = (status: string, message: string) => {
  const currentTime = Date.now();
  if (currentTime - lastErrorTime > 3000) { // Throttle notifications every 3 seconds
    useNotifications.getState().addNotification({
      type: status === 'success' ? 'success' : 'error',
      title: status === 'success' ? 'Success' : 'Error',
      message,
    });
    lastErrorTime = currentTime;
  }
};
