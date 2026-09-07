import React from 'react'
import './BarcodeShopPage.css'
import CartPanel from '@/components/cartPanel/CartPanel'
import UserPanel from '@/components/userPanel/UserPanel'
import InventoryPanel from '@/components/inventoryPanel/InventoryPanel'
import Footer from '@/layouts/footer/Footer'

const BarcodeShopPage: React.FC = () => {
    return (
        <div className='barcode-shop-page page'>
            <div className='left-panel'>
                <UserPanel />
                <InventoryPanel />
                <Footer />
            </div>

            <CartPanel />
        </div>
    );
}

export default BarcodeShopPage;
