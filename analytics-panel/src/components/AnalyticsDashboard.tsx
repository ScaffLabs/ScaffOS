import React, { useEffect, useState } from 'react';
import { fetchPerformanceMetrics } from '../api/analytics';
import { DrawdownChart } from './DrawdownChart';

export const AnalyticsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const loadMetrics = async () => {
            const data = await fetchPerformanceMetrics();
            setMetrics(data);
        };
        loadMetrics();
    }, []);

    if (!metrics) return <div>Loading...</div>;

    return (
        <div>
            <h1>Strategy Performance</h1>
            <DrawdownChart data={metrics.drawdown} />
            {/* Additional metrics display can go here */}
        </div>
    );
};