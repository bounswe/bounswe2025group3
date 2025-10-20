// alertContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import CustomAlert from '@/components/ui/custom-alert';

interface AlertOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  hideAlert: () => {},
  isVisible: false,
});

interface AlertProviderProps {
    children: React.ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alertState, setAlertState] = useState({
    isVisible: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
  });

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isVisible: true,
      title: options.title || 'Alert',
      message: options.message || '',
      confirmText: options.confirmText || '',
      onConfirm: () => {
        options.onConfirm?.();
        hideAlert();
      },
    });
  }, [hideAlert]);

  const value = { showAlert, hideAlert, isVisible: alertState.isVisible };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <CustomAlert
        visible={alertState.isVisible}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
        onClose={hideAlert}
        confirmText={alertState.confirmText}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
