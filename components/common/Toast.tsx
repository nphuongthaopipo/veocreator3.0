import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../../types';

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: number) => void;
}

const ICONS = {
    success: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
         <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    info: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};


const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const { id, message, type } = toast;
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, []);
    
    const handleClose = () => {
        setIsFadingOut(true);
        setTimeout(() => onClose(id), 300); // Wait for fade-out animation
    };

    return (
        <div className={`
            flex items-start p-4 mb-3 max-w-sm w-full bg-secondary shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
            transition-all duration-300 ease-in-out
            ${isFadingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        `}>
            <div className="flex-shrink-0">
                {ICONS[type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-light">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button onClick={handleClose} className="rounded-md inline-flex text-dark-text hover:text-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                    <span className="sr-only">Close</span>
                     <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;
