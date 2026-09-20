import {FC} from 'react';
import './Icon.css'
import placeholderItemIcon from '@/assets/images/grocery.svg'


interface IconProps {
    src: string;
    alt?: string;
    className?: string;
}

const Icon: FC<IconProps> = ({ src, alt, className }) => {
    return (
        <div className={`icon ${className? className : ""}`}>
            <img src={src !== "" ? src : placeholderItemIcon} alt={`${alt} icon`} />
        </div>
    )
}

export default Icon;
