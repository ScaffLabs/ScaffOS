import React, { useEffect, useState } from 'react';
import { fetchChartData } from '../api/chartApi';
import { Line } from 'react-chartjs-2';
import { ServiceError } from '../utils/errors';

const Chart: React.FC = () => {
    const [data, setData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
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
                if (err instanceof ServiceError) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred while loading chart data.');
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();

        const ws = new WebSocket('ws://localhost:3001/chart');
        ws.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setData(prevData => {
                const newLabels = [...prevData.labels, newData.date];
                const newChartData = [...prevData.datasets[0].data, newData.price];
                return {
                    ...prevData,
                    labels: newLabels,
                    datasets: [{
                        ...prevData.datasets[0],
                        data: newChartData
                    }]
                };
            });
        };

        ws.onerror = () => {
            setError('WebSocket connection error.');
        };

        return () => ws.close();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return <Line data={data} />;
};

export default Chart;