import React, { useState, useEffect } from 'react';
import { Product } from '../../../Types';
import './InventoryItem.css';
import { useInventory } from '../../../Contexts/InventoryContext';

interface InventoryItemProps {
    product: Product;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ product }) => {
    const { updateProduct, removeProduct } = useInventory();
    const [updatedProduct, setUpdatedProduct] = useState(product);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        setIsChanged(JSON.stringify(updatedProduct) !== JSON.stringify(product));
    }, [updatedProduct, product]);

    const handleUpdate = () => {
        updateProduct(updatedProduct.id, updatedProduct);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUpdatedProduct(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <li className="inventory-item">
            <div className='input-container'>
                <div className='product-info'>
                    <input
                        type="text"
                        name="name"
                        value={updatedProduct.name}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="price"
                        value={updatedProduct.price}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="imageUrl"
                        value={updatedProduct.imageUrl}
                        onChange={handleChange}
                    />
                </div>

                <div className='product-actions'>
                    <input
                        type="checkbox"
                        name="available"
                        checked={updatedProduct.available}
                        onChange={handleChange}
                    />
                    <button onClick={() => removeProduct(product.id)}>
                        <img src='/images/delete-white.svg' alt='Delete' height={10}/>
                    </button>
                </div>
            </div>

            {isChanged && (
                <button onClick={handleUpdate}> Uppdatera
                </button>
            )}
        </li>
    );
};

export default InventoryItem;
