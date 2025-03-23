import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import prit25image from '../../assets/images/prit25.png';
import menuIcon from '../../assets/images/menu-icon.svg';

const links = [
    { to: '/', text: 'Strecka' },
    { to: '/inventory', text: 'Inventory' },
    { to: '/balance', text: 'Tillgodo' },
    { to: '/purchases', text: 'Purchases' },
];

const Header: React.FC = () => {
    const [navOpen, setNavOpen] = React.useState(false);

    return (
        <header className="page-header">
            <div className="header-container">
                <Link to="/">
                    <img src={prit25image} alt="Logo" className="logo" />
                </Link>

                <Link to="/">
                    <h1>Strecklista</h1>
                </Link>

                {/* Normal navigation, visibility controlled by CSS */}
                <nav className={`header-nav ${navOpen ? "open" : ""}`}>
                    {links.map(({ to, text }) => (
                        <Link key={to} to={to} onClick={() => setNavOpen(false)}>
                            {text}
                        </Link>
                    ))}
                </nav>

                <button 
                    className="nav-toggle" 
                    onClick={() => setNavOpen(!navOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={navOpen}
                >
                    <img src={menuIcon} alt="Menu" />
                </button>
            </div>
        </header>
    );
};

export default Header;
