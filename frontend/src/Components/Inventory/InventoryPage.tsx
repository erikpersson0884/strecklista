import React from 'react';
import './InventoryPage.css';

import InventoryItem from './InventoryItem/InventoryItem';
import { useInventory } from '../../Contexts/InventoryContext';
import AddProductPopup from './AddProductPopup';

const InventoryPage: React.FC = () => {
    const { products } = useInventory();
    const [showAddProductPopup, setShowAddProductPopup] = React.useState(false);
    

    return (
        <>
        <ul className='inventory-page noUlFormatting'>    
            {products.map((product) => (
                <InventoryItem key={product.id} product={product} />
            ))}

            <button className='add-button' onClick={() => setShowAddProductPopup(!showAddProductPopup)}>
                <img src='/images/add.svg' alt='Add product' />
                <p>Lägg till vara</p>
            </button>
        </ul>

        <AddProductPopup showPopupDiv={showAddProductPopup} setShowPopupDiv={setShowAddProductPopup} />
        </>
    );
};



export default InventoryPage;