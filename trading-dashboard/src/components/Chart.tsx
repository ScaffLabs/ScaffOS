import React, { useEffect, useState } from 'react';
import { fetchChartData } from '../api/chartApi';
import { Line } from 'react-chartjs-2';

const Chart: React.FC = () => {
    const [data, setData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchChartData();
                setData({
                    labels: result.map((item: any) => item.date),
                    datasets: [{
                        label: 'Price',
                        data: result.map((item: any) => item.price),
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 2,
                        fill: false,
                    }]
                });
            } catch (err) {
                setError('Failed to load chart data.');
            }
        };
        loadData();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return <Line data={data} />;
};

export default Chart;