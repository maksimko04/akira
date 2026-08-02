"use client"

import { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const createToast = (type, message, duration = 3000) => {
        const id = Date.now() + toasts.length;
        setToasts(preventValue => [...preventValue, {id, type, message}]);

        setTimeout(() => {
            setToasts(preventValue => preventValue.filter(toast => toast.id !== id));
        }, duration);
    } 
    
    return (<ToastContext.Provider value = {createToast}>
        {children}

        {toasts.map(toast => 
            <Toast key={toast.id} type={toast.type} message={toast.message} />
        )}
    </ToastContext.Provider>);
}

export function useToast(){
    const context = useContext(ToastContext);

    if(!context){
        return;
    }

    return context;
}