import React from 'react';
import './Header.css';

import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="page-header">
            <img src="images/prit25.png" alt="logo" height={100} />
            
            {/* <nav> */}
                <Link to="/">Strecka</Link>
                <Link to="/inventory">Inventory</Link>
                <Link to="/balance">Tillgodo</Link>
                <Link to="/purchases">Purchases</Link>

            {/* </nav> */}
        </header>
    );
};

export default Header;
