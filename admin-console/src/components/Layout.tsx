import React from 'react';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div>
            <nav>
                <Link to='/'>Dashboard</Link>
                <Link to='/configuration'>Configuration</Link>
                <Link to='/service-health'>Service Health</Link>
            </nav>
            <main>{children}</main>
        </div>
    );
};

export default Layout;