import { Navigate, Outlet } from 'react-router-dom';
import useAuthContext from '@/contexts/AuthContext';
import LoadingPage from '@/pages/loadingPage/LoadingPage';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoggingIn } = useAuthContext()
    if (isLoggingIn) return <LoadingPage message="Loggar in..." />
    else if (!isAuthenticated) return <Navigate to="/login" replace />
    else return <Outlet />
};

export default ProtectedRoute;
