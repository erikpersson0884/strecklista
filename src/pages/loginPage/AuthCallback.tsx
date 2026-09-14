import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthContext from "@/contexts/AuthContext";
import "./AuthCallback.css";
import loadingGif from "@/assets/loading.gif";

const AuthCallback = () => {
    const { exchangeCodeForToken } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();

    const hasRequested = useRef(false); // Prevents multiple requests
    
    const handleAuth = async () => {
        if (hasRequested.current) return; // Prevent duplicate execution
        hasRequested.current = true;

        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        if (code) {
            await exchangeCodeForToken(code);
        }
        navigate("/");
      };

    useEffect(() => {
        handleAuth();
    }, [location]);

    return (
        <div className="auth-callback page">
            <img src={loadingGif} alt="Loading" className="loading-gif" height={40}/>
            <p>Loggar in...</p>
        </div>
    );
};

export default AuthCallback;
