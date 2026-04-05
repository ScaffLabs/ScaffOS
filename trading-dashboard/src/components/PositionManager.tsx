import React, { useEffect, useState } from 'react';
import { fetchPositions } from '../api/portfolioApi';

const PositionManager: React.FC = () => {
    const [positions, setPositions] = useState<any[]>([]);

    useEffect(() => {
        const loadPositions = async () => {
            const result = await fetchPositions();
            setPositions(result);
        };
        loadPositions();
    }, []);

    return (
        <div>
            <h2>Your Positions</h2>
            {positions.map((position) => (
                <div key={position.id}>{position.symbol} - {position.quantity}</div>
            ))}
        </div>
    );
};

export default PositionManager;