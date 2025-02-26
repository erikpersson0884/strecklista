import React from 'react';
import './Header.css';

import prit25image from '../../assets/images/prit25.png';
import menuIcon from '../../assets/images/menu-icon.svg';

import { Link } from 'react-router-dom';

const links = [
    { to: '/', text: 'Strecka' },
    { to: '/inventory', text: 'Inventory' },
    { to: '/balance', text: 'Tillgodo' },
    { to: '/purchases', text: 'Purchases' },
]


const Header: React.FC = () => {

    const [navOpen, setNavOpen] = React.useState(false);

    return (
        <header className="page-header">
            <div>
                <Link to="/">
                    <img src={prit25image} alt="logo" height={100} className= "logo"/>
                </Link>

                <Link to="/">
                    <h1>Strecklista</h1>
                </Link>

                <HeaderNav className='inline-header-nav'/>

                <button className="open-nav-button" onClick={() =>  setNavOpen(!navOpen)}>
                    <img src={menuIcon} alt="menu" height={50} />
                </button>
            </div>

            {navOpen &&
                <>
                    <hr />
                    <HeaderNav className='mobile-header-nav' setNavOpen={setNavOpen}/>
                </> 
                }


        </header>
    );
};

interface HeaderNavProps {
    className: string;
    setNavOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderNav: React.FC<HeaderNavProps> = ({className, setNavOpen}) => {
    return (
        <nav className={'' + className}> 
        
            {links.map(link => 
                <Link 
                    to={link.to} 
                    key={link.to} 
                    onClick={() => setNavOpen && setNavOpen(false)}
                >
                    {link.text}
                </Link>
            )}
        </nav>
    );
};

export default Header;
