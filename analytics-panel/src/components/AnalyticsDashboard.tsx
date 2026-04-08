import React, { useEffect, useState } from 'react';
import { fetchPerformanceMetrics } from '../api/analytics';
import { DrawdownChart } from './DrawdownChart';
import { PerformanceMetrics } from '../types';
import { ServiceError } from '../errors/customErrors';

export const AnalyticsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchPerformanceMetrics();
                setMetrics(data);
            } catch (err) {
                if (err instanceof ServiceError) {
                    setError('Error fetching metrics: ' + err.message);
                } else {
                    setError('Unexpected error: ' + err);
                }
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, []);

    if (loading) return <div>Loading metrics...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!metrics) return <div>No metrics available</div>;

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