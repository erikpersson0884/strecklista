import {FC} from 'react';
import './Icon.css'
import placeholderItemIcon from '@/assets/images/grocery.svg'


interface ProductIconProps {
    item: Item | User;
    className?: string;
}

const Icon: FC<ProductIconProps> = ({ item, className }) => {
    return (
        <div className={`icon ${className? className : ""}`}>
            <img src={item.icon !== "" ? item.icon : placeholderItemIcon} alt={`${item.name} icon`} height={20} />
        </div>
    )
}

export default Icon;
