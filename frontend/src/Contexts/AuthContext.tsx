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
	const [token, setToken] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => { // check if user is already authenticated on startup
		const checkAuth = async () => {
		const storedToken = localStorage.getItem("authToken");
		if (storedToken) {
			setToken(storedToken);
		}
		};
		checkAuth();
	}, []);

	useEffect(() => {
		const fetchUser = async () => {
			if (token) {
				localStorage.setItem("authToken", token);
				const user: User = await getCurrentUser();
				if (user) {
					setAuthTokenInAxios(token);
					setCurrentUser(user);
					setIsAuthenticated(true);
				}
			} else {
				localStorage.removeItem("authToken");
				setCurrentUser(null);
				setIsAuthenticated(false);
			}
		};

		fetchUser();
	}, [token]);

	
	/**
	 * Redirects the user to the authentication URL for login.
	 * 
	 * This function retrieves the authentication URL from the environment variables
	 * and sets the window location to this URL, effectively redirecting the user
	 * to the authentication page.
	 * 
	 * @async
	 */
	const authenticate = async () => {
		const authenticationUrl = import.meta.env.VITE_AUTH_URL as string;
		window.location.href = authenticationUrl;
	};

	const exchangeCodeForToken = async (code: string): Promise<boolean> => {
		try {
		const { token, user } = await login(code);
		setToken(token);
		setCurrentUser(user);
		window.location.href = "/";
		return true;
		}
		catch (error) {
		console.error("Error exchanging code for token", error);
		return false;
		}
	};

  const logout = () => {
		setToken(null);
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
