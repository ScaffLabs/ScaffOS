import React from 'react';
import Chart from './Chart';
import OrderEntry from './OrderEntry';
import PositionManager from './PositionManager';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1>Trading Dashboard</h1>
            <Chart />
            <OrderEntry />
            <PositionManager />
        </div>
    );
};

export default Dashboard;