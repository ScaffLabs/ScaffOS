import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Configuration from './components/Configuration';
import ServiceHealth from './components/ServiceHealth';

const App: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path='/' exact component={Dashboard} />
                <Route path='/configuration' component={Configuration} />
                <Route path='/service-health' component={ServiceHealth} />
            </Switch>
        </Router>
    );
};

export default App;