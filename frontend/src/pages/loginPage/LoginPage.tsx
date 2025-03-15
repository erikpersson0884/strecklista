import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const { authenticate } = useAuth();

  return (
    <div className="login-page">
      <h1>Login</h1>
      <button onClick={authenticate}>Login with Gamma</button>
    </div>
  );
};

export default LoginPage;
