import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthContext from "@/contexts/AuthContext";
import LoadingPage from "@/pages/loadingPage/LoadingPage";

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
        <LoadingPage message="Loggar in..." />
    );
};

export default AuthCallback;
