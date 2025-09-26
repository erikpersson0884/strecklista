import React, { useState, useEffect } from 'react';

import editIcon from '../../../assets/images/edit.svg';
import deleteIcon from '../../../assets/images/delete.svg';
import refillIcon from '../../../assets/images/refill.svg';

import './InventoryItem.css';
import { useInventory } from '../../../contexts/InventoryContext';
import DeleteProductPopup from './DeleteProductPopup';

interface InventoryItemProps {
    product: ProductT;
    openRefill: () => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ product, openRefill }) => {
    const { updateProduct } = useInventory();

    const [ expanded, setExpanded ] = useState(false);
    const [ updatedProduct, setUpdatedProduct ] = useState(product);
    const [ isChanged, setIsChanged ] = useState(false);
    const [ deletePopupOpen, setDeletePopupOpen ] = useState(false);


    useEffect(() => {
        product.name !== updatedProduct.name ||
        product.internalPrice !== updatedProduct.internalPrice ||
        product.icon !== updatedProduct.icon ||
        product.available !== updatedProduct.available
            ? setIsChanged(true)
            : setIsChanged(false);
            
    }, [updatedProduct, product]);

    const handleUpdate = async () => {
        const successfull: boolean = await updateProduct(updatedProduct);
        if (successfull) {
            setUpdatedProduct(updatedProduct);
            setExpanded(false);
        } else {
            console.error("Failed to update product");
        }
    };

    const handleCancel = () => {
        setUpdatedProduct(product);
        setExpanded(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUpdatedProduct(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
        }));
    };

    if (!expanded) return ( // return product preview if not expanded
        <>
            <li className='inventory-item inventory-item-preview'>
                <p className='product-name'>{product.name}</p>

                <button onClick={() => setExpanded(true)}>
                    <img src={editIcon} alt='Redigera' height={10}/>
                </button>
                {/* <div className='amount-container'>
                    <p>Antal i lager: {product.amountInStock} st</p> */}
                    <button onClick={openRefill}>
                        <img src={refillIcon} alt='Påfyllnad' height={10}/>
                    </button>
                {/* </div> */}
                <button className='delete-button' onClick={() => setDeletePopupOpen(true)}>
                    <img src={deleteIcon} alt='Delete' height={10}/>
                </button>
            </li>

            <DeleteProductPopup
                isOpen={deletePopupOpen}
                onClose={() => setDeletePopupOpen(false)}
                product={product}
            ></DeleteProductPopup>
        </>
    );

    return (
        <li className="inventory-item inventory-item-expanded">
            <div className='inputs-container'>
                <div className='inputdiv'>
                    <label htmlFor="name">Namn: </label>
                    <input
                        type="text"
                        name="name"
                        placeholder='Produktnamn'
                        value={updatedProduct.name}
                        onChange={handleChange}
                    />
                </div>
                
                <div className='inputdiv'>
                    <label htmlFor="price">Pris: </label>
                    <input
                        type="number"
                        name="internalPrice"
                        placeholder='Pris'
                        value={updatedProduct.internalPrice}
                        onChange={handleChange}
                    />
                </div>
                <div className='inputdiv'>
                    <label htmlFor="icon">Bildlänk: </label>
                    <input
                        type="text"
                        name="icon"
                        placeholder='Bildlänk'
                        value={updatedProduct.icon}
                        onChange={handleChange}
                    />
                </div>



                <div>
                    <label htmlFor="available">Tillgänglig: </label>
                    <input
                            type="checkbox"
                            name="available"
                            checked={updatedProduct.available}
                            onChange={handleChange}
                        />
                </div>
            </div>

            <hr />

            <div className='action-buttons'>
                <button 
                    className={isChanged ? "do-button" : "disabled-button"}  
                    onClick={handleUpdate}
                    disabled={!isChanged}
                > 
                    Uppdatera
                </button>
                <button className='cancel-button' onClick={handleCancel}> 
                    Avbryt
                </button>
            </div>
        </li>
    ) 

};

export default InventoryItem;
