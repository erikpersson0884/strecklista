import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './Components/Header/Header';
import ShopPage from './Components/ShopPage/ShopPage';
import Inventory from './Components/Inventory/InventoryPage';
import BalancePage from './Components/BalancePage/BalancePage';
import NotFound from './Components/NotFound/NotFound';


import { useAuth } from './Contexts/AuthContext';
import PurchasesPage from './Components/PurchasesPage/PurchasesPage';

const App: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (    
        <>
            {
                !isAuthenticated ? 
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
