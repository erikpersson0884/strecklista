import { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance, setAuthToken } from '../api/AxiosInstance';


interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(true);

    useEffect(() => {
        localStorage.setItem('authToken', token || '');
        setAuthToken(token);
        setIsAuthenticated(!!token);
    }, [token]);

    const login = (username: string, password: string) => {
        axiosInstance.post('/auth/login', { username, password })
            .then((response) => {
                setToken(response.data.token);
            })
            .catch((error) => {
                console.error('Failed to login:', error);
            });
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
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
