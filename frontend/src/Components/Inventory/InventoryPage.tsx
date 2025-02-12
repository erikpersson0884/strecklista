import React from 'react';
import './InventoryPage.css';

import InventoryItem from './InventoryItem/InventoryItem';
import { useInventory } from '../../Contexts/InventoryContext';

const InventoryPage: React.FC = () => {
    const { products } = useInventory();
    

    return (
        <ul className='inventory-page noUlFormatting'>    
            {products.map((product, index) => (
                <InventoryItem key={index} product={product} />
            ))}
        </ul>
    );
};

export default InventoryPage;