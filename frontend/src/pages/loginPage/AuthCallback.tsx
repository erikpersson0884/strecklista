import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthCallback.css";

const AuthCallback = () => {
  const { exchangeCodeForToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hasRequested = useRef(false); // Prevents multiple requests

  useEffect(() => {
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

    handleAuth();
  }, [location]); // Dependency array remains unchanged

  return (
    <div className="auth-callback">
      <p>Logging in...</p>
    </div>
  );
};

export default AuthCallback;
