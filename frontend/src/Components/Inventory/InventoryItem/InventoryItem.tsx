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
        setIsChanged(JSON.stringify(updatedProduct) !== JSON.stringify(product));
    }, [updatedProduct, product]);

    const handleUpdate = () => {
        updateProduct(updatedProduct.id, updatedProduct);
    };

    const handleCancel = () => {
        setUpdatedProduct(product);
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

    return (
        <li className="inventory-item">
            <div className='input-container'>
                <div className='product-info'>
                    <input
                        type="text"
                        name="name"
                        placeholder='Produktnamn'
                        value={updatedProduct.name}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder='Pris'
                        value={updatedProduct.price}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="imageUrl"
                        placeholder='Bildlänk'
                        value={updatedProduct.imageUrl}
                        onChange={handleChange}
                    />
                    <div className='amount-container'>
                        <p>Antal i lager: {product.amountInStock} st</p>
                        <button onClick={openRefill}>
                            Fyll på
                        </button>
                    </div>
                </div>

                <div className='product-actions'>
                    <input
                        type="checkbox"
                        name="available"
                        checked={updatedProduct.available}
                        onChange={handleChange}
                    />
                    <button className='delete-button' onClick={handleDelete}>
                        <img src='images/delete-white.svg' alt='Delete' height={10}/>
                    </button>
                </div>
            </div>

            {isChanged && (
                <div className='action-buttons'>
                    <button onClick={handleUpdate}> Uppdatera
                    </button>
                    <button className='cancel-button' onClick={handleCancel}> Avbryt
                    </button>
                </div>
            )}
        </li>
    );
};

export default InventoryItem;
