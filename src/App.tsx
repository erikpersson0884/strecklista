import './styles/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './layouts/header/Header';
import Footer from './layouts/footer/Footer';

import Providers from './Providers';

import ShopPage from './pages/shopPage/ShopPage';
import InventoryPage from './pages/inventoryPage/InventoryPage';
import BalancePage from './pages/balancePage/BalancePage';
import TransactionsPage from './pages/transactionsPage/TransactionsPage';
import NotFound from './pages/notFoundPage/NotFoundPage';
import LoginPage from './pages/loginPage/LoginPage';

import ProfilePage from './pages/profilePage/profilePage';

import AuthCallback from './pages/loginPage/AuthCallback';

import { useAuth } from './contexts/AuthContext';


const App: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    const pages = [
        { url: '/', component: <ShopPage /> },
        { url: '/inventory', component: <InventoryPage /> },
        { url: '/balance', component: <BalancePage /> },
        { url: '/transactions', component: <TransactionsPage /> },
        { url: '/profile', component: <ProfilePage /> },
    ]
    
    if (isLoading) {
        return <p>Loading...</p>;
    } 
    else if (isAuthenticated) {
        return(
            <Providers>
                <BrowserRouter>
                    <Header />
                    
                    <Routes>
                        {pages.map((page) => (
                            <Route key={page.url} path={page.url} element={page.component} />
                        ))}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>

                <Footer />
            </Providers>
        )
    } 
    else return (
        <BrowserRouter>
            <Routes>
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/" element={
                    <>
                        <LoginPage />
                        <Footer />
                    </>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
