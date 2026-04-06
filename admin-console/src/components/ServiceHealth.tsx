import React, { useEffect, useState } from 'react';

const ServiceHealth: React.FC = () => {
    const [serviceStatus, setServiceStatus] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Mock fetching service health status
        const fetchServiceHealth = async () => {
            const status = await new Promise<{ [key: string]: string }>((resolve) => {
                setTimeout(() => resolve({ auth: 'healthy', monitoring: 'healthy', alertSystem: 'unhealthy' }), 1000);
            });
            setServiceStatus(status);
        };
        fetchServiceHealth();
    }, []);

    return (
        <div>
            <h1>Service Health</h1>
            <ul>
                {Object.entries(serviceStatus).map(([service, status]) => (
                    <li key={service}>{service}: {status}</li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceHealth;