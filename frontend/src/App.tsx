import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './Components/Header/Header';
import ShopPage from './Components/ShopPage/ShopPage';
import Inventory from './Components/Inventory/InventoryPage';
import BalancePage from './Components/BalancePage/BalancePage';

import { InventoryProvider } from './Contexts/InventoryContext';
import { CartProvider } from './Contexts/CartContext';
import { UsersProvider } from './Contexts/UsersContext';


function App() {

    return (
        <InventoryProvider>
            <CartProvider>
                <UsersProvider>
                <BrowserRouter>
                    <Header />

                    <Routes>
                        <Route path="/" element={<ShopPage />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path='/balance' element={<BalancePage />} />
                    </Routes>
                </BrowserRouter>
                </UsersProvider>
            </CartProvider>
        </InventoryProvider>
      
    )
}

export default App
