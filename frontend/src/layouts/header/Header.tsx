import React from 'react';
import './Header.css';

import prit25image from '../../assets/images/prit25.png';
import menuIcon from '../../assets/images/menu-icon.svg';

import { Link } from 'react-router-dom';



const Header: React.FC = () => {
    const [navOpen, setNavOpen] = React.useState(false);

    const pages = [
        { url: '/', linkText: 'Strecka'},
        { url: '/inventory', linkText: 'Inventory'},
        { url: '/balance', linkText: 'Tillgodo' },
        { url: '/transactions', linkText: 'Transactions'},
    ]
    

    return (
        <header className="page-header">
            <div>
                <Link to="/">
                    <img src={prit25image} alt="logo" height={100} className= "logo"/>
                </Link>

                <Link to="/">
                    <h1>Strecklista</h1>
                </Link>

                <button 
                    className="open-nav-button" 
                    onClick={() => setNavOpen(!navOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={navOpen}
                >
                    <img src={menuIcon} alt="menu" height={50} />
                </button>
            </div>

            <nav className={'header-nav' + (navOpen ? ' open-nav' : '')}> 
                {pages.map((page) => 
                    <Link 
                        to={page.url} 
                        key={page.url} 
                        onClick={() => setNavOpen(false)}
                    >
                        {page.linkText}
                    </Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
