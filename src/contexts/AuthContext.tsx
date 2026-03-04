import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken as setAuthTokenInAxios } from "../api/axiosInstance";
import usersApi from "../api/usersApi";
import authApi from "../api/authApi";

interface AuthContextType {
    isLoggingIn: boolean;
    isAuthenticated: boolean;
    authenticate: () => void;
    logout: () => void;
    currentUser: User | null;
    exchangeCodeForToken: (code: string) => Promise<void>;
    setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ isLoggingIn , setIsLoggingIn ] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setCurrentUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem("authToken");
                setIsLoggingIn(false);
                return;
            }
            try {
                setAuthTokenInAxios(token);
                const user: User = await usersApi.getCurrentUser();
                setCurrentUser(user);
                setIsAuthenticated(true);
                localStorage.setItem("authToken", token);
                setIsLoggingIn(false);
            } catch (error) {
                console.error("Error fetching the current user:", error);
                setCurrentUser(null);
                setIsAuthenticated(false);
                setToken(null);
            }
        };


        fetchUser();
    }, [token]); // Ensure it refetches user when token changes

    const authenticate = async (): Promise<void> => {
        const authenticationUrl = (__API_BASE__ + "/authorize");
        window.location.href = authenticationUrl;
    };

    const exchangeCodeForToken = async (code: string): Promise<void> => {
        try {
            const { token } = await authApi.login(code);
            setToken(token);
        } catch (error) {
            console.error("Error exchanging code for token", error);
        }
    };

    const logout = (): void => {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };


    return (
        <AuthContext.Provider value={{ 
            isLoggingIn, 
            isAuthenticated, 
            authenticate, 
            logout, 
            currentUser, 
            exchangeCodeForToken,
            setToken
        }}>
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
