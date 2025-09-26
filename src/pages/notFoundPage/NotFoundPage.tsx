import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>
                Wow, you found the super secret 404 page, you may go back home, but first have a look at this cute boy
            </p>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC37YYUjhlKwR43veT8g28rfPH_dP9aaDbbw&s" alt="404" />
            
            <Link to="/">
                <button>Go Home</button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
