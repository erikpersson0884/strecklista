import './styles/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './layouts/header/Header';

import Providers from './Providers';

import ShopPage from './pages/shopPage/ShopPage';
import Inventory from './pages/inventoryPage/InventoryPage';
import BalancePage from './pages/balancePage/BalancePage';
import PurchasesPage from './pages/purchasesPage/PurchasesPage';
import NotFound from './pages/notFoundPage/NotFoundPage';
import LoginPage from './pages/loginPage/LoginPage';

import AuthCallback from './pages/loginPage/AuthCallback';

import { useAuth } from './contexts/AuthContext';


const App: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return ( 
        <>   
            {
                !isAuthenticated ? 
                <BrowserRouter basename='/strecklista/'>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/callback" element={<AuthCallback />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
                :
                <Providers >
                    <BrowserRouter basename='/strecklista/'>
                        <Header />

                        <Routes>
                            <Route path="/" element={<ShopPage />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path='/balance' element={<BalancePage />} />
                            <Route path="/purchases" element={<PurchasesPage />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </Providers>
            }      
        </>
    )
}

export default App
