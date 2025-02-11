import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './Components/Header/Header';
import ShopPage from './Components/ShopPage/ShopPage';

import { InventoryProvider } from './Contexts/InventoryContext';
import { CartProvider } from './Contexts/CartContext';


function App() {

    return (
        <InventoryProvider>
            <CartProvider>
                <BrowserRouter>
                    <Header />

                    <Routes>
                        <Route path="/" element={<ShopPage />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </InventoryProvider>
      
    )
}

export default App
