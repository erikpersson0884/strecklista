import useAuthContext from "@/contexts/AuthContext";
import "./LoginPage.css";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useModalContext from "@/contexts/ModalContext";
import ClientLoginPopup from "@/components/clientLoginPopup/ClientLoginPopup";
import { useNotificationContext } from "@/contexts/NotificationContext";

const LoginPage = () => {
    const { userAuthenticate, clientLogin, setToken, isAuthenticated, isLoggingIn, rememberMe, setRememberMe } = useAuthContext();
    const { openModal } = useModalContext();
    const { notify } = useNotificationContext();

    const [ numberOfClicks, setNumberOfClicks ] = useState(0);
   

    useEffect(() => {
        if (numberOfClicks >= 3) {
            const token = prompt("Enter a token to bypass login:");
            if (token) setToken(token);
        }
    }, [numberOfClicks, setToken]);


    const handleClientLogin = () => {
        const clientId = localStorage.getItem("clientId");
        const clientSecret = localStorage.getItem("clientSecret");

        if (!clientId || !clientSecret) {
            notify("Ingen klient-data hittades, vänligen ange klient-id och klient-hemlighet för att logga in.");
            openModal(<ClientLoginPopup />);
        }
        else clientLogin(clientId, clientSecret);
    }

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
            <button onClick={userAuthenticate}>Logga in med Gamma</button>
            <button onClick={handleClientLogin}>Logga in med klient</button>
            <div className="remember-me">
                <p>Kom ihåg mig: </p>
                <label className="switch">
                    <input
                        type="checkbox"
                        id="remember-login"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="slider"></span>
                </label>
            </div>
        </div>
    );
};

export default LoginPage;
