import { Navigate, Outlet } from 'react-router-dom';
import useAuthContext from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoggingIn } = useAuthContext()
    if (isLoggingIn) return <p>Loggar in...</p>
    else if (!isAuthenticated) return <Navigate to="/login" replace />
    else return <Outlet />
};

export default ProtectedRoute;
