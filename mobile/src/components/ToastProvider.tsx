import React from 'react';
import {View, StyleSheet} from 'react-native';
import Toast from './Toast';
import {useToast} from '../hooks/useToast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastContext = React.createContext<ReturnType<typeof useToast> | null>(null);

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast
        message={toast.toast.message}
        type={toast.toast.type}
        visible={toast.toast.visible}
        onHide={toast.hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

