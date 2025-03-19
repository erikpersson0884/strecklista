import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken as setAuthTokenInAxios } from "../api/axiosInstance";
import { getCurrentUser } from "../api/usersApi";
import { User } from "../Types";
import { login } from "../api/authApi";

interface AuthContextType {
    isAuthenticated: boolean;
    authenticate: () => void;
    logout: () => void;
    currentUser: User | null;
    exchangeCodeForToken: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

    useEffect(() => {
        if (token) {
            setAuthTokenInAxios(token); // Ensure Axios has the token
            localStorage.setItem("authToken", token); // Store token persistently
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setCurrentUser(null);
                setIsAuthenticated(false);
                return;
            }

            try {
                const user: User = await getCurrentUser();
                setCurrentUser(user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error fetching user:", error);
                setCurrentUser(null);
                setIsAuthenticated(false);
                setToken(null); // Clear invalid token
            }
        };

        fetchUser();
    }, [token]); // Ensure it refetches user when token changes

    const authenticate = async () => {
        const authenticationUrl = import.meta.env.VITE_AUTH_URL as string;
        window.location.href = authenticationUrl;
    };

    const exchangeCodeForToken = async (code: string): Promise<void> => {
        try {
            const { token, user } = await login(code);

            setToken(token);
            setCurrentUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error exchanging code for token", error);
        }
    };

    const logout = () => {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, authenticate, logout, currentUser, exchangeCodeForToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
