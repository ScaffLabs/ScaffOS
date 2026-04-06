import React, { useState } from 'react';
import { fetchComparisonData } from '../api/analytics';

export const ComparisonTool: React.FC = () => {
    const [strategyA, setStrategyA] = useState('');
    const [strategyB, setStrategyB] = useState('');
    const [comparisonResult, setComparisonResult] = useState(null);

    const handleCompare = async () => {
        const result = await fetchComparisonData(strategyA, strategyB);
        setComparisonResult(result);
    };

    return (
        <div>
            <h1>Compare Strategies</h1>
            <input value={strategyA} onChange={(e) => setStrategyA(e.target.value)} placeholder='Strategy A' />
            <input value={strategyB} onChange={(e) => setStrategyB(e.target.value)} placeholder='Strategy B' />
            <button onClick={handleCompare}>Compare</button>
            {comparisonResult && <div>{JSON.stringify(comparisonResult)}</div>}
        </div>
    );
};