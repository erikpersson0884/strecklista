import React from 'react';
import './Product.css';

import favouriteIcon from '../../../assets/images/favourite.svg';
import favouriteIconFilled from '../../../assets/images/favourite-filled.svg';

import { useCart } from '../../../contexts/CartContext';
import { useInventory } from '../../../contexts/InventoryContext';

interface ProductProps {
    product: ProductT;
}

const Product: React.FC<ProductProps> = ({ product }) => {
    const { addProductToCart, items } = useCart(); 
    const { toggleFavourite } = useInventory();

    const internalPrice: string = product.internalPrice % 1 === 0 ? product.internalPrice.toFixed(0) : product.internalPrice.toFixed(2)

    return (
        <div className="product" onClick={() => addProductToCart(product)}>
            <button className='favourite-button' onClick={(e) => {e.stopPropagation(); toggleFavourite(product.id)}}>
                <img 
                    src={product.favorite ? favouriteIconFilled : favouriteIcon}
                    alt="heart" 
                    height={20}
                />
            </button>

            {items.find(item => item.id === product.id) && (
                <div className='items-indicator'>
                    <p>{items.find(i => i.id === product.id)?.quantity}</p>
                </div>
            )}

            <div className='product-image'>
                <img src={product.icon} alt={product.name} />
            </div>

            <div className='product-info'>
                <h2>{product.name}</h2>

                <div className='product-stats'>
                    <p>{product.amountInStock} i lager</p>
                    <p>{internalPrice}:-</p>
                </div>
            </div>
        </div>
    );
};

export default Product;
