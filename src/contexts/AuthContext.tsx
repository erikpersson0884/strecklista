import { createContext, useContext, useState, useEffect, useRef } from "react";

import { setAuthToken as setAuthTokenInAxios } from "@/api/axiosInstance";
import authApi from "@/api/authApi";

import useNotificationContext from "./NotificationContext";


interface AuthContextType {
    isLoggingIn: boolean;
    isAuthenticated: boolean;
    currentUser: User | null;
    currentClient: Partial<Client> | null;
    rememberMe: boolean;

    clientLogin: (id?: string, secret?: string) => Promise<void>;

    userAuthenticate: () => void;
    exchangeCodeForToken: (code: string) => Promise<void>;

    setToken: (token: string) => void;
    setRememberMe: (remember: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { notify } = useNotificationContext();

    const [ isLoggingIn , setIsLoggingIn ] = useState<boolean>(false);
    const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);
    const [ currentUser, setCurrentUser ] = useState<User | null>(null);
    const [ currentClient, setCurrentClient ] = useState<Partial<Client> | null>(null);
    const [ rememberMe, setRememberMe ] = useState<boolean>(localStorage.getItem('rememberMe') === 'true');

    const hasCheckedToken = useRef(false);

    const handleTokenUpdate = (token: string) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (!payload.exp) return;

            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = (payload.exp - currentTime) * 1000;

            if (timeUntilExpiry <= 0) {
                logout();
                return;
            }

            setAuthTokenInAxios(token);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", token);

            const warningTimeMs = 2 * 60 * 1000;
            const warningTimer = setTimeout(() => {
                notify(`Session will expire in ${warningTimeMs / 60000} min`, "info");
            }, timeUntilExpiry - warningTimeMs);

            const logoutTimer = setTimeout(() => {
                notify("Session expired. Please log in again.", "info");
                logout();
            }, timeUntilExpiry);

            return () => {
                clearTimeout(warningTimer);
                clearTimeout(logoutTimer);
            };
        } catch (err) {
            console.error('Error parsing token for auto-logout', err);
            logout();
        } finally {
            setIsLoggingIn(false);
        }
    };

    useEffect(() => { // Check for token / remember-me on mount
        if (hasCheckedToken.current) return;
        hasCheckedToken.current = true;

        const checkForToken = async () => {
            const storedToken: string | null = localStorage.getItem('authToken');
            const rememberMe: boolean = localStorage.getItem('rememberMe') === 'true';
            const lastLoginType: string | null = localStorage.getItem('lastLoginType');

            if (!rememberMe) return;
            if (isLoggingIn) return;

            if (lastLoginType === 'client') {
                await clientLogin();
                notify("Jag kom ihåg dig kompis!", "info");
            } else if (storedToken) {
                handleTokenUpdate(storedToken);
                return;
            }
            // else if (lastLoginType === 'user') {
            //     // No stored token, but user was logged in via OAuth before ->
            //     // send them straight back to the provider.
            //     setIsLoggingIn(true);
            //     userAuthenticate();
            // }
        }

        checkForToken();
    }, []);

    useEffect(() => {
        if (rememberMe) localStorage.setItem('rememberMe', "true");
        else {
            localStorage.removeItem('rememberMe')
            localStorage.removeItem('authToken')
            localStorage.removeItem('lastLoginType')
        }
    }, [rememberMe]);


    const clientLogin = async (id?: string, secret?: string): Promise<void> => {
        try {
            setIsLoggingIn(true);
            if ( !id || !secret) {
                const storedClientId: string | null = localStorage.getItem('clientId');
                const storedClientSecret: string | null = localStorage.getItem('clientSecret');
                if (!storedClientId || !storedClientSecret) {
                    notify("Client ID or Secret not found in . Please provide them.", "error");
                    return;
                }
                id = storedClientId;
                secret = storedClientSecret;
            }

            const { token, client }: { token: string, client: Partial<Client> } = await authApi.clientLogin(id, secret);
            setCurrentClient(client);
            handleTokenUpdate(token);

            localStorage.setItem('clientId', id);
            localStorage.setItem('clientSecret', secret);
            localStorage.setItem('lastLoginType', 'client');
        } catch (error) {
            console.error("Error exchanging code for token", error);
            notify("Login failed. Please try again\n" + error, "error");
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Login via OAuth2 Authorization Code Flow
    const userAuthenticate = async (): Promise<void> => {
        authApi.userAuthenticate();
    };

    const exchangeCodeForToken = async (code: string): Promise<void> => {
        try {
            setIsLoggingIn(true);
            const { token, user } = await authApi.userLogin(code);
            handleTokenUpdate(token);
            setCurrentUser(user);

            localStorage.setItem('lastLoginType', 'user');
        } catch (error) {
            console.error("Error exchanging code for token", error);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const logout = (): void => {
        setCurrentClient(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setAuthTokenInAxios(null);
        setRememberMe(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("lastLoginType");
    };


    return (
        <AuthContext.Provider value={{ 
            isLoggingIn, 
            isAuthenticated, 
            currentUser,
            currentClient,
            rememberMe,
            setRememberMe,
            clientLogin,
            userAuthenticate, 
            logout, 
            exchangeCodeForToken,
            setToken: setAuthTokenInAxios
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default useAuthContext;
