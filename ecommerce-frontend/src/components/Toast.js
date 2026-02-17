import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: { message: null, type: 'info' },
      showToast: () => {},
      hideToast: () => {}
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: null, type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: null, type: 'info' });
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div 
      className={`toast ${type}`}
      role="alert"
      aria-live="polite"
    >
      <span style={{ 
        marginRight: '10px', 
        fontWeight: 'bold',
        fontSize: '16px' 
      }}>
        {icons[type] || 'ℹ'}
      </span>
      {message}
    </div>
  );
};
