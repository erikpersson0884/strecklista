import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken as setAuthTokenInAxios } from "../axiosInstance";
import usersApi from "../usersApi";
import authApi from "../authApi";

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    authenticate: () => void;
    logout: () => void;
    currentUser: User | null;
    exchangeCodeForToken: (code: string) => Promise<void>;
    setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ isLoading , setIsLoading ] = useState<boolean>(true);
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
                const user: User = await usersApi.getCurrentUser();
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
        setIsLoading(false);
    }, [token]); // Ensure it refetches user when token changes

    const authenticate = async (): Promise<void> => {
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

    const logout = (): void => {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };


    return (
        <AuthContext.Provider value={{ 
            isLoading, 
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
