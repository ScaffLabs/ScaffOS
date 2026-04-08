import React, { useEffect, useState } from 'react';
import { fetchComparisonData, getStrategies } from '../api/analytics';

export const ComparisonTool: React.FC = () => {
    const [strategies, setStrategies] = useState<string[]>([]);
    const [strategyA, setStrategyA] = useState('');
    const [strategyB, setStrategyB] = useState('');
    const [comparisonResult, setComparisonResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStrategies = async () => {
            try {
                const data = await getStrategies();
                setStrategies(data);
            } catch (err) {
                setError('Failed to load strategies.');
            }
        };
        loadStrategies();
    }, []);

    const handleCompare = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchComparisonData(strategyA, strategyB);
            setComparisonResult(result);
        } catch (err) {
            setError('Failed to compare strategies.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Compare Strategies</h1>
            <select value={strategyA} onChange={(e) => setStrategyA(e.target.value)}>
                <option value='' disabled>Select Strategy A</option>
                {strategies.map(strategy => <option key={strategy} value={strategy}>{strategy}</option>)}
            </select>
            <select value={strategyB} onChange={(e) => setStrategyB(e.target.value)}>
                <option value='' disabled>Select Strategy B</option>
                {strategies.map(strategy => <option key={strategy} value={strategy}>{strategy}</option>)}
            </select>
            <button onClick={handleCompare} disabled={loading || !strategyA || !strategyB}>Compare</button>
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {comparisonResult && <div>{JSON.stringify(comparisonResult)}</div>}
        </div>
    );
};
