import React, { useEffect, useState } from 'react';
import { fetchHealthStatus } from '../services/ServiceClient';

const ServiceHealth: React.FC = () => {
    const [serviceStatus, setServiceStatus] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchServiceHealth = async () => {
            setLoading(true);
            try {
                const status = await fetchHealthStatus();
                setServiceStatus(status);
            } catch (err) {
                setError('Error fetching service health status');
            } finally {
                setLoading(false);
            }
        };
        fetchServiceHealth();
    }, []);

    return (
        <div>
            <h1>Service Health</h1>
            {loading ? (<p>Loading...</p>) : error ? (
                <div style={{ color: 'red' }}>Error: {error}</div>
            ) : (
                <ul>
                    {Object.entries(serviceStatus).map(([service, status]) => (
                        <li key={service}>{service}: {status}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ServiceHealth;