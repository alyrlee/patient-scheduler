import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useApiError() {
  const handleError = useCallback((error, context = '') => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    let message = 'Something went wrong. Please try again.';
    let type = 'error';
    
    if (error.message) {
      // Handle specific error messages
      if (error.message.includes('fetch')) {
        message = 'Unable to connect to the server. Please check your connection.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = 'You are not authorized to perform this action.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        message = 'Access denied. You do not have permission for this action.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = 'The requested resource was not found.';
      } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        message = 'Too many requests. Please wait a moment and try again.';
        type = 'warning';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        message = 'Server error. Please try again later.';
      } else if (error.message.includes('Validation failed')) {
        message = 'Please check your input and try again.';
      } else {
        message = error.message;
      }
    }
    
    // Show appropriate toast
    if (type === 'warning') {
      toast(message, {
        icon: '⚠️',
        duration: 4000,
        position: 'top-right'
      });
    } else {
      toast.error(message, {
        duration: 5000,
        position: 'top-right'
      });
    }
  }, []);

  const handleSuccess = useCallback((message, context = '') => {
    console.log(`API Success${context ? ` in ${context}` : ''}:`, message);
    
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    });
  }, []);

  const handleInfo = useCallback((message, context = '') => {
    console.log(`API Info${context ? ` in ${context}` : ''}:`, message);
    
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      position: 'top-right'
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleInfo
  };
}
