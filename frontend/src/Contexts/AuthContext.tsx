import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../Types';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(        
        {id:231, name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" }
    );

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const fetchUser = async () => {
        const response = await fetch('http://localhost:8000/users/me', {
            headers: {
                Authorization: `Bearer ${savedToken}`
            }
        });
        const data = await response.json();
        setCurrentUser(data);
    };

    const savedToken: string | null = localStorage.getItem('token');
    if (savedToken) {
        fetchUser();
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
