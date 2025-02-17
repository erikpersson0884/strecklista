import React from 'react';
import './InventoryPage.css';

import { Product } from '../../Types';
import InventoryItem from './InventoryItem/InventoryItem';
import { useInventory } from '../../Contexts/InventoryContext';
import AddProductPopup from './AddProductPopup';
import RefillProductPopup from './RefillProductPopup';

const InventoryPage: React.FC = () => {
    const { products } = useInventory();
    const [showAddProductPopup, setShowAddProductPopup] = React.useState(false);

    const [showrefillPopup, setShowRefillPopup] = React.useState<boolean>(false);
    const [productToRefill, setProductToRefill] = React.useState<Product | null>(null);
    

    return (
        <>
        <ul className='inventory-page noUlFormatting'>    
            {products.map((product) => (
                <InventoryItem key={product.id} product={product} openRefill={() => {
                    setShowRefillPopup(true)
                    setProductToRefill(product)
                }}
                />
            ))}

            <button className='add-button' onClick={() => setShowAddProductPopup(!showAddProductPopup)}>
                <img src='images/add.svg' alt='Add product' />
                <p>Lägg till vara</p>
            </button>
        </ul>

        <AddProductPopup showPopupDiv={showAddProductPopup} setShowPopupDiv={setShowAddProductPopup} />

        {productToRefill && (
            <RefillProductPopup 
                product={productToRefill} 
                showPopupDiv={showrefillPopup} 
                setShowPopupDiv={setShowRefillPopup} 
            />
        )}
        </>
    );
};



export default InventoryPage;