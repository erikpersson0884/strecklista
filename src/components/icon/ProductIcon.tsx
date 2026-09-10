import {FC} from 'react';
import Icon from '@/components/icon/Icon'


interface ProductIconProps {
    item: Item | User;
    alt?: string;
    className?: string;
}
const ProductIcon: FC<ProductIconProps> = ({ item, alt, className }) => {
    return <Icon src={item.icon} alt={alt ?? item.name} className={className} />
}

export default ProductIcon;
