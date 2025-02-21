import { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance, setAuthToken } from '../api/axiosInstance';
import { User } from '../Types';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
    currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        localStorage.setItem('authToken', token || '');
        setAuthToken(token);
        setIsAuthenticated(!!token);
    }, [token]);

    const login = (username: string, password: string) => {
        axiosInstance.post('/auth/login', { username, password })
            .then((response) => {
                setToken(response.data.token);
                setCurrentUser(response.data.user);
            })
            .catch((error) => {
                console.error('Failed to login:', error);
            });
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout, currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
