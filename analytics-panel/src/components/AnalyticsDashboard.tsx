import React, { useEffect, useState } from 'react';
import { fetchPerformanceMetrics } from '../api/analytics';
import { DrawdownChart } from './DrawdownChart';

export const AnalyticsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const data = await fetchPerformanceMetrics();
                setMetrics(data);
            } catch (err) {
                setError('Failed to load metrics.');
            }
        };
        loadMetrics();
    }, []);

    if (error) return <div>{error}</div>;
    if (!metrics) return <div>Loading...</div>;

    return (
        <div>
            <h1>Strategy Performance</h1>
            <DrawdownChart data={metrics.drawdown} />
            <div>
                <h2>Additional Metrics</h2>
                <p>Max Drawdown: {metrics.maxDrawdown}</p>
                <p>Sharpe Ratio: {metrics.sharpeRatio}</p>
            </div>
        </div>
    );
};