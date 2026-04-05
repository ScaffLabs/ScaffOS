import React, { useEffect, useState } from 'react';
import { fetchChartData } from '../api/chartApi';

const Chart: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const result = await fetchChartData();
            setData(result);
        };
        loadData();
    }, []);

    return <div>{/* Chart rendering logic here using data */}</div>;
};

export default Chart;