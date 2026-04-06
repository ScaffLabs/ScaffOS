export const fetchPerformanceMetrics = async () => {
    const response = await fetch('/api/performance');
    return response.json();
};

export const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    const response = await fetch(`/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
    return response.json();
};