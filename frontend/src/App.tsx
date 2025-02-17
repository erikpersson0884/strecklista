import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Components/Header/Header';
import ShopPage from './Components/ShopPage/ShopPage';
import Inventory from './Components/Inventory/InventoryPage';
import BalancePage from './Components/BalancePage/BalancePage';
import NotFound from './Components/NotFound/NotFound';

import { InventoryProvider } from './Contexts/InventoryContext';
import { CartProvider } from './Contexts/CartContext';
import { UsersProvider } from './Contexts/UsersContext';
import { AuthProvider } from './Contexts/AuthContext';
import PurchasesPage from './Components/PurchasesPage/PurchasesPage';
import { PurchasesProvider } from './Contexts/PurchasesContext';


function App() {

    return (
        <AuthProvider>
        <InventoryProvider>
        <CartProvider>
        <UsersProvider>
        <PurchasesProvider>
            <BrowserRouter basename='/strecklista/'>
                <Header />

                <Routes>
                    <Route path="/" element={<ShopPage />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path='/balance' element={<BalancePage />} />
                    <Route path="/purchases" element={<PurchasesPage />} />
                    {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </PurchasesProvider>
        </UsersProvider>
        </CartProvider>
        </InventoryProvider>
        </AuthProvider>
      
    )
}

export default App
