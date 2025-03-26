import React from 'react';
import { Product as ProductT } from '../../../Types';
import './Product.css';

import favouriteIcon from '../../../assets/images/favourite.svg';
import favouriteIconFilled from '../../../assets/images/favourite-filled.svg';


import { useCart } from '../../../contexts/CartContext';

interface ProductProps {
    product: ProductT;
}

const Product: React.FC<ProductProps> = ({ product }) => {
    const { addProductToCart } = useCart();
    const toggleFavourite = (product: ProductT) => {
        // TODO: Implement a way to toggle favourites
        // This is a placeholder implementation
    }

    return (
        <div className="product" onClick={() => addProductToCart(product)}>
            <button className='favourite-button' onClick={(e) => {e.stopPropagation(); toggleFavourite(product)}}>

                {product.favorite ? 
                    <img 
                        src={favouriteIconFilled}
                        alt="heart" 
                        height={20}
                    />
                    :
                    <img 
                        src={favouriteIcon}
                        alt="heart" 
                        height={20}
                    />
                }
            </button>

            <div className='product-image'>
                <img src={product.icon} alt={product.name} />
            </div>

            <div className='product-info'>
                <h2>{product.name}</h2>

                <div className='product-stats'>
                    <p>{product.amountInStock} i lager</p>
                    <p>{product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}:-</p>
                </div>
            </div>
        </div>
    );
};

export default Product;
