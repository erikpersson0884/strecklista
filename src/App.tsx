import './styles/App.css';
import { Navigate, Route, Routes } from 'react-router-dom';

import Header from './layouts/header/Header';
import Footer from './layouts/footer/Footer';

import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import LoginPage from './pages/loginPage/LoginPage';
import AuthCallback from './pages/loginPage/AuthCallback';

import ShopPage from './pages/shopPage/ShopPage';
import InventoryPage from './pages/inventoryPage/InventoryPage';
import BalancePage from './pages/balancePage/BalancePage';
import TransactionsPage from './pages/transactionsPage/TransactionsPage';

import ClientPage from './pages/clientPage/ClientPage';
import ProfilePage from './pages/profilePage/profilePage';

import useAuthContext from '@/contexts/AuthContext';


const App: React.FC = () => {
    const { isLoggingIn } = useAuthContext();

    const pages = [
        { url: '/', component: <ShopPage /> },
        { url: '/inventory', component: <InventoryPage /> },
        { url: '/balance', component: <BalancePage /> },
        { url: '/transactions', component: <TransactionsPage /> },
        { url: '/profile', component: <ProfilePage /> },
        { url: '/clients', component: <ClientPage /> },
    ]
    
    if (isLoggingIn) {
        return <p>Loading...</p>;
    } 

    else return (
        <>
            <Header />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/callback" element={<AuthCallback />} />
                    <Route element={<ProtectedRoute/>}>
                        {pages.map((page, index) => (
                            <Route key={index} path={page.url} element={page.component} />
                        ))}
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            <Footer />
        </>
    )
}

export default App
