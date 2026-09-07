import {FC} from 'react';
import './ProductIcon.css'
import placeholderItemIcon from '@/assets/images/grocery.svg'


interface ProductIconProps {
    item: Item;
    className?: string;
}

const ProductIcon: FC<ProductIconProps> = ({ item, className }) => {
    return (
        <div className={`product-icon ${className? className : ""}`}>
            <img src={item.icon !== "" ? item.icon : placeholderItemIcon} alt={item.name} height={20} />
        </div>
    )
}

export default ProductIcon;
