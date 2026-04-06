import React from 'react';
import { Line } from 'react-chartjs-2';

interface DrawdownChartProps {
    data: number[];
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({ data }) => {
    const chartData = {
        labels: data.map((_, index) => index + 1),
        datasets: [{
            label: 'Drawdown',
            data,
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
        }],
    };

    return <Line data={chartData} />;
};