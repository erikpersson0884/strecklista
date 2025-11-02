import React from 'react';
import './InventoryPage.css';

import { useInventory } from '../../contexts/InventoryContext';
import { useModalContext } from '../../contexts/ModalContext';

import AddProductPopup from '../../components/addProductPopup/AddProductPopup';
import RefillProductPopup from '../../components/refillProductPopup/RefillProductPopup';
import UpdateProductPopup from '../../components/updateProductPopup/UpdateProductPopup';
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog';

import editIcon from '../../assets/images/edit.svg';
import deleteIcon from '../../assets/images/delete-white.svg';
import refillIcon from '../../assets/images/refill.svg';


const InventoryPage: React.FC = () => {
    const { products, isLoading, deleteProduct } = useInventory();
    const { openModal } = useModalContext();

    const DeleteConfirmDialog: React.FC<{ item: IItem }> = ({ item }) => {
        return (
            <ConfirmDialog
                title="Radera produkt"
                confirmButtonText="Radera"
                onConfirm={() => deleteProduct(item.id)}
            >
                <p>Är du säker på att du vill radera produkten?</p>
                <p>Produkt: {item.name}</p>
            </ConfirmDialog>
        );
    };


    const InventoryItem: React.FC<{item: IItem;}> = ({ item }) => {
        return (
                <li className='inventory-item list-item'>
                    <p>{item.name}</p>

                    <button onClick={() => openModal(<UpdateProductPopup item={item} />)}>
                        <img src={editIcon} alt='Redigera' height={10}/>
                    </button>

                    <button onClick={() => openModal(<RefillProductPopup item={item} />)}>
                        <img src={refillIcon} alt='Påfyllnad' height={10}/>
                    </button>

                    <button onClick={() => openModal(<DeleteConfirmDialog item={item} />)}>
                        <img src={deleteIcon} alt='Delete' height={10}/>
                    </button>
                </li>
        );
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <ul className='page'>    
                {products.map((item) => (
                    <InventoryItem key={item.id} item={item} />
                ))}

                <li className='add-item-li list-item'>
                    <button onClick={() => openModal(<AddProductPopup />)}>
                        <p>Lägg till vara</p>
                    </button>
                </li>
            </ul>
        </>
    );
};

export default InventoryPage;
