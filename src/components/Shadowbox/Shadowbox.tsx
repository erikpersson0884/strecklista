import React from 'react';
import './Shadowbox.css';

interface ShadowboxProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const Shadowbox: React.FC<ShadowboxProps> = ({ children, style, onClick }) => {

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick && onClick();
    };

    return (
        <div className="shadowbox" style={style} onClick={handleClick}>
            {children}
        </div>
    );
};

export default Shadowbox;
