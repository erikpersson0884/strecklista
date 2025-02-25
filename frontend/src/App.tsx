import './styles/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './layouts/header/Header';

import ShopPage from './pages/shopPage/ShopPage';
import Inventory from './pages/inventoryPage/InventoryPage';
import BalancePage from './pages/balancePage/BalancePage';
import PurchasesPage from './pages/purchasesPage/PurchasesPage';
import NotFound from './pages/notFoundPage/NotFoundPage';


const App: React.FC = () => {
    // const { isAuthenticated } = useAuth();
    return (    
        <>
            {
                // !isAuthenticated ? 
                false ? 
                    <div className='login-div'>
                        <p>Inte inloggad</p>
                        <button>Logga in</button>
                    </div>
                :
                <BrowserRouter basename='/strecklista/'>
                    <Header />

                    <Routes>
                        <Route path="/" element={<ShopPage />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path='/balance' element={<BalancePage />} />
                        <Route path="/purchases" element={<PurchasesPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            }      
        </>
    )
}

export default App
