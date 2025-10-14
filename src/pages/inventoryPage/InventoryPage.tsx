import React from 'react';
import './InventoryPage.css';

import { useInventory } from '../../contexts/InventoryContext';

import AddProductPopup from '../../components/addProductPopup/AddProductPopup';
import RefillProductPopup from '../../components/refillProductPopup/RefillProductPopup';
import UpdateProductPopup from '../../components/updateProductPopup/UpdateProductPopup';
import DeleteProductPopup from '../../components/deleteProductPopup/DeleteProductPopup';

import editIcon from '../../assets/images/edit.svg';
import deleteIcon from '../../assets/images/delete-white.svg';
import refillIcon from '../../assets/images/refill.svg';


const InventoryPage: React.FC = () => {
    const { products, isLoading } = useInventory();

    const [ showAddProductPopup, setShowAddProductPopup ] = React.useState<boolean>(false);
    const [ productToRefill, setProductToRefill ] = React.useState<IProduct | null>(null);
    const [ productToDelete, setProductToDelete ] = React.useState<IProduct | null>(null);
    const [ productToUpdate, setProductToUpdate ] = React.useState<IProduct | null>(null);


    const InventoryItem: React.FC<{product: IProduct;}> = ({ product }) => {
        return (
                <li className='inventory-item'>
                    <p>{product.name}</p>

                    <button onClick={() => setProductToUpdate(product)}>
                        <img src={editIcon} alt='Redigera' height={10}/>
                    </button>

                    <button onClick={() => setProductToRefill(product)}>
                        <img src={refillIcon} alt='Påfyllnad' height={10}/>
                    </button>

                    <button onClick={() => setProductToDelete(product)}>
                        <img src={deleteIcon} alt='Delete' height={10}/>
                    </button>
                </li>
        );
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <ul className='inventory-page page noUlFormatting'>    
                {products.map((product) => (
                    <InventoryItem key={product.id} product={product} />
                ))}

                <button className='add-product-button' onClick={() => setShowAddProductPopup(!showAddProductPopup)}>
                    <p>Lägg till vara</p>
                </button>
            </ul>

            <AddProductPopup 
                isOpen={showAddProductPopup} 
                closePopup={() => setShowAddProductPopup(false)}
            />

            <UpdateProductPopup 
                product={productToUpdate} 
                onClose={() => setProductToUpdate(null)}
            />

            <RefillProductPopup 
                product={productToRefill} 
                onClose={() => setProductToRefill(null)}
            />

            <DeleteProductPopup
                product={productToDelete}
                onClose={() => setProductToDelete(null)}
            />
        </>
    );
};



export default InventoryPage;