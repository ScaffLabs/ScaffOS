import React, { useEffect, useState } from 'react';
import { fetchChartData, validateChartData } from '../api/chartApi';
import { Line } from 'react-chartjs-2';
import { ServiceError } from '../utils/errors';

const Chart: React.FC = () => {
    const [data, setData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchChartData();
                validateChartData(result);
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
                    setError('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return <Line data={data} />;
};

export default Chart;