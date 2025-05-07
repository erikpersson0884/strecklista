import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken as setAuthTokenInAxios } from "../api/axiosInstance";
import { getCurrentUser } from "../api/usersApi";
import authApi from "../api/authApi";

interface AuthContextType {
    isAuthenticated: boolean;
    authenticate: () => void;
    logout: () => void;
    currentUser: User | null;
    exchangeCodeForToken: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setCurrentUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem("authToken");
                return;
            }

            try {
                await setAuthTokenInAxios(token); // Ensure Axios has the token
                const user: User = await getCurrentUser();
                setCurrentUser(user);
                setIsAuthenticated(true);
                localStorage.setItem("authToken", token); // Store token persistently
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
        const authenticationUrl = (__API_BASE__ + "/authorize");
        window.location.href = authenticationUrl;
    };

    const exchangeCodeForToken = async (code: string): Promise<void> => {
        try {
            const { token, user } = await authApi.login(code);

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
