import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";
import { useState } from "react";

const LoginPage = () => {
    const { authenticate } = useAuth();
    const [ numberOfClicks, setNumberOfClicks ] = useState(0);

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
