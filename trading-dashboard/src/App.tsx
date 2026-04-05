import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { TradingContextProvider } from './context/TradingContext';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    return (
        <Router>
            <TradingContextProvider>
                <Switch>
                    <Route path='/' component={Dashboard} />
                </Switch>
            </TradingContextProvider>
        </Router>
    );
};

export default App;