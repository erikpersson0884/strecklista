import React, { useState, useEffect } from 'react';
import { Product } from '../../../Types';
import './InventoryItem.css';
import { useInventory } from '../../../Contexts/InventoryContext';

interface InventoryItemProps {
    product: Product;
    openRefill: () => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ product, openRefill }) => {
    const { updateProduct, removeProduct } = useInventory();
    const [updatedProduct, setUpdatedProduct] = useState(product);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        product.name !== updatedProduct.name ||
        product.price !== updatedProduct.price ||
        product.imageUrl !== updatedProduct.imageUrl ||
        product.available !== updatedProduct.available
            ? setIsChanged(true)
            : setIsChanged(false);
            
    }, [updatedProduct, product]);

    const handleUpdate = () => {
        updateProduct(updatedProduct.id, updatedProduct);
        setExpanded(false);
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

    const handleDelete = () => {
            window.confirm('Är du säker på att du vill ta bort produkten?') && removeProduct(product.id);
    };

    const [ expanded, setExpanded ] = useState(false);

    return (
        expanded ? 
            <li className="inventory-item inventory-item-expanded">
                {/* <button className='close-button' onClick={() => setExpanded(false)}>X</button> */}

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
                            name="price"
                            placeholder='Pris'
                            value={updatedProduct.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='inputdiv'>
                        <label htmlFor="imageUrl">Bildlänk: </label>
                        <input
                            type="text"
                            name="imageUrl"
                            placeholder='Bildlänk'
                            value={updatedProduct.imageUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className='amount-container'>
                        <p>Antal i lager: {product.amountInStock} st</p>
                        <button onClick={openRefill}>
                            Fyll på
                        </button>
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
                    <button className='cancel-button' onClick={handleCancel}> Avbryt
                    </button>
                </div>
            </li>
        :
            <li className='inventory-item inventory-item-preview'>
                <p className='product-name'>{product.name}</p>
{/* 
                <p>{product.amountInStock} st</p>
                <p>{product.price} kr</p> */}


                <button onClick={() => setExpanded(true)}>
                    <img src='images/edit.svg' alt='Redigera' height={10}/>
                </button>
                <button className='delete-button' onClick={handleDelete}>
                    <img src='images/delete.svg' alt='Delete' height={10}/>
                </button>
            </li>
    );
};

export default InventoryItem;
