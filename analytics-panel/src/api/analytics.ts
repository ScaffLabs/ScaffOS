export const fetchPerformanceMetrics = async () => {
    try {
        const response = await fetch('/api/performance');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        throw error;
    }
};

export const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        const response = await fetch(`/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch comparison data:', error);
        throw error;
    }
};