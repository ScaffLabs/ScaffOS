import React, { useState } from 'react';
import { fetchComparisonData } from '../api/analytics';

export const ComparisonTool: React.FC = () => {
    const [strategyA, setStrategyA] = useState('');
    const [strategyB, setStrategyB] = useState('');
    const [comparisonResult, setComparisonResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            <input value={strategyA} onChange={(e) => setStrategyA(e.target.value)} placeholder='Strategy A' />
            <input value={strategyB} onChange={(e) => setStrategyB(e.target.value)} placeholder='Strategy B' />
            <button onClick={handleCompare} disabled={loading}>Compare</button>
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {comparisonResult && <div>{JSON.stringify(comparisonResult)}</div>}
        </div>
    );
};