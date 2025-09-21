import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ToastMessage } from '../types';
import Toast from '../components/common/Toast';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 w-full max-w-xs space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};