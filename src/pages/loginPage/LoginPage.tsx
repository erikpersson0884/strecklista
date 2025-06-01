import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";
import { useState, useEffect } from "react";

const LoginPage = () => {
    const { authenticate, setToken } = useAuth();
    const [ numberOfClicks, setNumberOfClicks ] = useState(0);

    useEffect(() => {
        if (numberOfClicks >= 3) {
            const token = prompt("Enter a token to bypass login:");
            setToken(token || "");
        }
    }, [numberOfClicks, setToken]);

    return (
        <div className="login-page">
            <h1
                style={numberOfClicks > 10 ? { color: "#09cdda" } : undefined}
                onClick={() => setNumberOfClicks(numberOfClicks + 1)}
            >
                Login
            </h1>
            <button onClick={authenticate}>Login with Gamma</button>
        </div>
    );
};

export default LoginPage;
