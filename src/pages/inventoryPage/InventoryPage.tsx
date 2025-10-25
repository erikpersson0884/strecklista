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
    const [ productToRefill, setProductToRefill ] = React.useState<IItem | null>(null);
    const [ productToDelete, setProductToDelete ] = React.useState<IItem | null>(null);
    const [ productToUpdate, setProductToUpdate ] = React.useState<IItem | null>(null);


    const InventoryItem: React.FC<{item: IItem;}> = ({ item }) => {
        return (
                <li className='inventory-item list-item'>
                    <p>{item.name}</p>

                    <button onClick={() => setProductToUpdate(item)}>
                        <img src={editIcon} alt='Redigera' height={10}/>
                    </button>

                    <button onClick={() => setProductToRefill(item)}>
                        <img src={refillIcon} alt='Påfyllnad' height={10}/>
                    </button>

                    <button onClick={() => setProductToDelete(item)}>
                        <img src={deleteIcon} alt='Delete' height={10}/>
                    </button>
                </li>
        );
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <ul className='page noUlFormatting'>    
                {products.map((item) => (
                    <InventoryItem key={item.id} item={item} />
                ))}

                <li className='add-item-li list-item'>
                    <button onClick={() => setShowAddProductPopup(!showAddProductPopup)}>
                        <p>Lägg till vara</p>
                    </button>
                </li>
            </ul>

            <AddProductPopup 
                isOpen={showAddProductPopup} 
                closePopup={() => setShowAddProductPopup(false)}
            />

            <UpdateProductPopup 
                item={productToUpdate} 
                onClose={() => setProductToUpdate(null)}
            />

            <RefillProductPopup 
                item={productToRefill} 
                onClose={() => setProductToRefill(null)}
            />

            <DeleteProductPopup
                item={productToDelete}
                onClose={() => setProductToDelete(null)}
            />
        </>
    );
};



export default InventoryPage;