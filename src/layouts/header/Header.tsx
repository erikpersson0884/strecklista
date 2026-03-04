import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import usersApi from '../../api/usersApi';
import { useAuth } from '../../contexts/AuthContext';
import fallbackLogo from '../../assets/images/bird.png';
import menuIcon from '../../assets/images/menu-icon.svg';

const Header: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [ navOpen, setNavOpen ] = React.useState(false)
    const [ groupAvatarUrl, setGroupAvatarUrl ] = React.useState<string>(fallbackLogo)

    const pages = [
        { url: '/', linkText: 'Strecka'},
        { url: '/inventory', linkText: 'Utbud'},
        { url: '/balance', linkText: 'Tillgodo' },
        { url: '/transactions', linkText: 'Transaktioner'},
    ]


    React.useEffect(() => {
        const getGroupAvatar = async () => {
            const groupInfo = await usersApi.getGroupInfo()
            if (groupInfo.avatarUrl) setGroupAvatarUrl(groupInfo.avatarUrl)
        }
        if (isAuthenticated) getGroupAvatar() // Helps with for example testing
    }, [])
    
    return (
        <header className="page-header">
            <div>
                <Link to="/">
                    <img className= "logo" src={groupAvatarUrl} height={100} alt="logo" onError={(e) => e.currentTarget.src = fallbackLogo} />
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

            <nav className={`header-nav ${navOpen ? 'nav-open' : ''}`}>
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
    )
}

export default Header
