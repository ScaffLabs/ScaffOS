import React, { useEffect, useState } from 'react';
import { fetchComparisonData, getStrategies } from '../api/analytics';
import { ValidationError } from '../errors/customErrors';

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
                setError('Failed to load strategies: ' + err.message);
            }
        };
        loadStrategies();
    }, []);

    const handleCompare = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!strategyA || !strategyB) {
                throw new ValidationError('Both strategies must be selected.');
            }
            const result = await fetchComparisonData(strategyA, strategyB);
            setComparisonResult(result);
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else {
                setError('Failed to compare strategies: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Compare Strategies</h1>
            <div>
                <select value={strategyA} onChange={(e) => setStrategyA(e.target.value)}>
                    <option value='' disabled>Select Strategy A</option>
                    {strategies.map(strategy => <option key={strategy} value={strategy}>{strategy}</option>)}
                </select>
                <select value={strategyB} onChange={(e) => setStrategyB(e.target.value)}>
                    <option value='' disabled>Select Strategy B</option>
                    {strategies.map(strategy => <option key={strategy} value={strategy}>{strategy}</option>)}
                </select>
                <button onClick={handleCompare} disabled={loading}>Compare</button>
            </div>
            {loading && <div>Loading comparison...</div>}
            {error && <div>{error}</div>}
            {comparisonResult && <div>Better Strategy: {comparisonResult.betterStrategy}</div>}
        </div>
    );
};