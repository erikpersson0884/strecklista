import './styles/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './layouts/header/Header';
import Footer from './layouts/footer/Footer';

import Providers from './Providers';

import { pages } from './utils/pages';
import NotFound from './pages/notFoundPage/NotFoundPage';
import LoginPage from './pages/loginPage/LoginPage';

import AuthCallback from './pages/loginPage/AuthCallback';

import { useAuth } from './contexts/AuthContext';


const App: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const baseName = '/strecklista/';
    return ( 
        <>
        {isAuthenticated ?
                
            <Providers >
                <BrowserRouter basename={baseName}>
                    <Header />
                    
                    <Routes>
                        {pages.map((page) =>
                            <Route key={page.url} path={page.url} element={page.component} />
                        )}                     
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>

                <Footer />
            </Providers>
        :
            <BrowserRouter basename={baseName}>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
    }
        </>

    )
}

export default App
