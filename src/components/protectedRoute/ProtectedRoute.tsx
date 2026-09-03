// ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoggingIn } = useAuth()

    if (isLoggingIn) {
        return <div>Loggar in...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
};

export default ProtectedRoute;
