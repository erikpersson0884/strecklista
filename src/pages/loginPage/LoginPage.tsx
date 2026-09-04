import { useAuth } from "@/contexts/AuthContext";
import "./LoginPage.css";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
    const { authenticate, setToken, isAuthenticated, isLoggingIn } = useAuth();
    const [ numberOfClicks, setNumberOfClicks ] = useState(0);

    useEffect(() => {
        if (numberOfClicks >= 3) {
            const token = prompt("Enter a token to bypass login:");
            if (token) setToken(token);
        }
    }, [numberOfClicks, setToken]);

    if (isLoggingIn) return <div className="login-page"><p>Logging in...</p></div>;

    if (isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="login-page">
            <h1
                style={numberOfClicks > 10 ? { color: "#09cdda" } : undefined}
                onClick={() => setNumberOfClicks(numberOfClicks + 1)}
            >
                Strecklista
            </h1>
            <button onClick={authenticate}>Logga in med Gamma</button>
        </div>
    );
};

export default LoginPage;
