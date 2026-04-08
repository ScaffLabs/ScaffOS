import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ComparisonTool } from './components/ComparisonTool';
import { HealthCheck } from './components/HealthCheck';

const App: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path='/' exact component={AnalyticsDashboard} />
                <Route path='/comparison' component={ComparisonTool} />
                <Route path='/health' component={HealthCheck} />
            </Switch>
        </Router>
    );
};

export default App;
