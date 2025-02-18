import React from 'react';
import { Product as ProductT } from '../../../Types';
import './Product.css';

import { useCart } from '../../../Contexts/CartContext';



const Product: React.FC<{ product: ProductT }> = ({ product }) => {
    
    const {addProduct} = useCart();

    return (
        <div className="product" onClick={() => addProduct(product)}>
            <div className='product-image'>
                <img src={product.imageUrl} alt={product.name} />
            </div>


            <div className='product-info'>
                <h2>{product.name}</h2>
                <div className='product-stats'>
                    <p>{product.price.toFixed(2)}:-</p>
                    <p>{product.amountInStock} i lager</p>
                </div>
            </div>
        </div>
    );
};

export default Product;