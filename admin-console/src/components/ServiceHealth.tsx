import React, { useEffect, useState } from 'react';

const ServiceHealth: React.FC = () => {
    const [serviceStatus, setServiceStatus] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetching service health status from the backend.
        const fetchServiceHealth = async () => {
            try {
                const response = await fetch('/api/health'); // Replace with actual endpoint
                if (!response.ok) throw new Error('Failed to fetch service health');
                const status = await response.json();
                setServiceStatus(status);
            } catch (err) {
                // Capturing any errors during the fetch process
                setError(err.message);
            }
        };
        fetchServiceHealth();
    }, []);

    return (
        <div>
            <h1>Service Health</h1>
            {error ? (
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