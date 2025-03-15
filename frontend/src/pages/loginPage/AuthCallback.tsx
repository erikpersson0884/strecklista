import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AuthCallback = () => {
  const { exchangeCodeForToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (code) {
        const success: boolean = await exchangeCodeForToken(code);
        if (success) return;
      }
      alert("Login failed. Please try again.");
      navigate("/");
      return;
    };

    handleAuth();
  }, [location]);


  return <div>Logging in...</div>;
};

export default AuthCallback;
