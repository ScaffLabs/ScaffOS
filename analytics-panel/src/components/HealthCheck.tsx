import React, { useEffect, useState } from 'react';
import { healthCheck } from '../api/analytics';

export const HealthCheck: React.FC = () => {
    const [health, setHealth] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const data = await healthCheck();
                setHealth(data);
            } catch (err) {
                setError('Failed to check health.');
            }
        };
        checkHealth();
    }, []);

    if (error) return <div>{error}</div>;
    if (!health) return <div>Loading health status...</div>;

    return (
        <div>
            <h1>Service Health</h1>
            <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
    );
};
