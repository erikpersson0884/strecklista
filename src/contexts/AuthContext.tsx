import { createContext, useContext, useState, useEffect } from "react";

import { setAuthToken as setAuthTokenInAxios } from "@/api/axiosInstance";
import authApi from "@/api/authApi";
import userApi from "@/api/userApi";

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

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(
        localStorage.getItem("rememberMe") === "true"
    );

    const getTokenPayload = (token: string): any | null => {
        try {
            const payload = JSON.parse(
                atob(
                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            return payload;
        } catch (err) {
            console.error("Error parsing token", err);
            return null;
        }
    };

    const isTokenValid = (token: string): boolean => {
        try {
            const payload = getTokenPayload(token);

            if (!payload?.exp) {
                return false;
            }

            const currentTime = Math.floor(Date.now() / 1000);

            return payload.exp > currentTime;
        } catch (err) {
            console.error("Error parsing token", err);
            return false;
        }
    };

    const setLogoutTimers = (token: string) => {
        try {
            const payload = getTokenPayload(token);

            if (!payload?.exp) {
                return;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = (payload.exp - currentTime) * 1000;

            const warningTimeMs = 2 * 60 * 1000;

            const warningTimer = setTimeout(() => {
                notify(
                    `Session will expire in ${warningTimeMs / 60000} min`,
                    "info"
                );
            }, Math.max(timeUntilExpiry - warningTimeMs, 0));

            const logoutTimer = setTimeout(() => {
                notify(
                    "Session expired. Please log in again.",
                    "info"
                );

                logout();
            }, Math.max(timeUntilExpiry, 0));

            return () => {
                clearTimeout(warningTimer);
                clearTimeout(logoutTimer);
            };
        } catch (err) {
            console.error(
                "Error parsing token for auto-logout",
                err
            );

            logout();
        }
    };

    const setCurrentUserOrClient = async (token: string): Promise<void> => {
        try {
            const payload = getTokenPayload(token);

            if (!payload) {
                throw new Error("Invalid authentication token payload");
            }

            if (payload.user) {
                const authenticatedUser: User =
                    await userApi.getCurrentUser();

                setCurrentUser(authenticatedUser);
                setCurrentClient(null);

                return;
            }

            if (payload.client) {
                /*
                 * Client information is currently returned from clientLogin().
                 * The token is still installed in Axios, so API requests can
                 * authenticate normally.
                 */
                setCurrentUser(null);

                return;
            }

            throw new Error(
                "Authentication token contains neither user nor client information"
            );
        } catch (err) {
            console.error(
                "Error fetching current user or client",
                err
            );

            throw err;
        }
    };

    const handleTokenUpdate = async (token: string): Promise<void> => {
        try {
            if (!isTokenValid(token)) {
                notify(
                    "Session expired. Please log in again.",
                    "info"
                );

                logout();
                return;
            }

            // Install the token before making any authenticated requests.
            setAuthTokenInAxios(token);

            localStorage.setItem("authToken", token);

            /*
             * Wait until the current user/client has been resolved before
             * telling the rest of the application that authentication is ready.
             *
             * This prevents other contexts from starting API requests while
             * getCurrentUser() is still running.
             */
            await setCurrentUserOrClient(token);

            setIsAuthenticated(true);

            setLogoutTimers(token);
        } catch (err) {
            console.error(
                "Error handling authentication token",
                err
            );

            logout();
        }
    };

    useEffect(() => {
        let cancelled = false;

        const checkForToken = async () => {
            setIsLoggingIn(true);

            try {
                const storedRememberMe =
                    localStorage.getItem("rememberMe") === "true";

                if (!storedRememberMe || cancelled) {
                    return;
                }

                const storedToken =
                    localStorage.getItem("authToken");

                /*
                 * If we already have a valid token, use that token.
                 *
                 * IMPORTANT:
                 * We return afterwards so we don't also start another
                 * authentication flow based on lastLoginType.
                 */
                if (storedToken && isTokenValid(storedToken)) {
                    await handleTokenUpdate(storedToken);
                    return;
                }

                /*
                 * Stored token is missing or expired.
                 * Remove it before attempting another login.
                 */
                if (storedToken) {
                    localStorage.removeItem("authToken");
                }

                if (cancelled) {
                    return;
                }

                const lastLoginType =
                    localStorage.getItem("lastLoginType");

                if (lastLoginType === "client") {
                    try {
                        await clientLogin();
                    } catch (error) {
                        console.error(
                            "Failed to log in with stored client credentials",
                            error
                        );

                        notify(
                            "Failed to log in with stored client credentials. Please log in again.",
                            "error"
                        );
                    }
                } else if (lastLoginType === "user") {
                    try {
                        await userAuthenticate();
                    } catch (error) {
                        console.error(
                            "Failed to authenticate stored user",
                            error
                        );

                        notify(
                            "Failed to authenticate with the stored user session. Please log in again.",
                            "error"
                        );
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoggingIn(false);
                }
            }
        };

        checkForToken();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
        } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("authToken");
            localStorage.removeItem("lastLoginType");
        }
    }, [rememberMe]);

    const clientLogin = async (
        id?: string,
        secret?: string
    ): Promise<void> => {
        try {
            setIsLoggingIn(true);

            if (!id || !secret) {
                const storedClientId =
                    localStorage.getItem("clientId");

                const storedClientSecret =
                    localStorage.getItem("clientSecret");

                if (!storedClientId || !storedClientSecret) {
                    notify(
                        "Client ID or Secret not found. Please provide them.",
                        "error"
                    );

                    return;
                }

                id = storedClientId;
                secret = storedClientSecret;
            }

            const {
                token,
                client,
            }: {
                token: string;
                client: Partial<Client>;
            } = await authApi.clientLogin(id, secret);

            /*
             * Save client information before completing authentication.
             */
            setCurrentClient(client);
            setCurrentUser(null);

            /*
             * IMPORTANT:
             * Wait for token handling to finish.
             */
            await handleTokenUpdate(token);

            localStorage.setItem("clientId", id);
            localStorage.setItem("clientSecret", secret);
            localStorage.setItem("lastLoginType", "client");
        } catch (error) {
            console.error(
                "Error exchanging client credentials for token",
                error
            );

            notify(
                "Login failed. Please try again.",
                "error"
            );

            throw error;
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Login via OAuth2 Authorization Code Flow
    const userAuthenticate = async (): Promise<void> => {
        authApi.userAuthenticate();
    };

    const exchangeCodeForToken = async (
        code: string
    ): Promise<void> => {
        try {
            setIsLoggingIn(true);

            localStorage.removeItem("lastLoginType");

            const { token, user } =
                await authApi.userLogin(code);

            /*
             * Wait for authentication to finish before allowing the rest
             * of the application to react to isAuthenticated.
             */
            await handleTokenUpdate(token);

            /*
             * userLogin already gives us the user, so this keeps the
             * returned OAuth user available immediately.
             */
            setCurrentUser(user);

            localStorage.setItem("lastLoginType", "user");
        } catch (error) {
            console.error(
                "Error exchanging code for token",
                error
            );

            notify(
                "Login failed. Please try again.",
                "error"
            );
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
        <AuthContext.Provider
            value={{
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
                setToken: setAuthTokenInAxios,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
};

export default useAuthContext;