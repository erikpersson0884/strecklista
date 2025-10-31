import React from 'react';
import './Header.css';

import prit25image from '../../assets/images/prit25.png';
import menuIcon from '../../assets/images/menu-icon.svg';

import { Link } from 'react-router-dom';
import Modal from '../../components/modal/Modal';



const Header: React.FC = () => {
    const [navOpen, setNavOpen] = React.useState(false);

    const pages = [
        { url: '/', linkText: 'Strecka'},
        { url: '/inventory', linkText: 'Utbud'},
        { url: '/balance', linkText: 'Tillgodo' },
        { url: '/transactions', linkText: 'Transaktioner'},
    ]
    

    return (
        <>
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

                <nav className={'header-nav'}>
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

            <Modal isOpen={navOpen} onClose={() => setNavOpen(false)}>
                <nav aria-label="Mobile navigation" className={'mobile-header-nav'}> 
                    {pages.map((page, index) => (
                        <React.Fragment key={page.url}>
                            <Link 
                                to={page.url}
                                key={page.url} 
                                onClick={() => setNavOpen(false)}
                            >
                                {page.linkText}
                            </Link>
                            {index < pages.length - 1 && <hr />}
                        </React.Fragment>
                    ))}
                </nav>
            </Modal>
        </>
    );
};

export default Header;
