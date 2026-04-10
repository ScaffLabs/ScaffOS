export const retry = async (fn: Function, retries: number = 3, delay: number = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
        }
    }
};

export const circuitBreaker = (fn: Function, failureThreshold: number = 5, cooldownPeriod: number = 30000) => {
    let failureCount = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return async (...args: any[]) => {
        if (isOpen) {
            if (Date.now() - lastFailureTime > cooldownPeriod) {
                isOpen = false; // Reset the circuit
                failureCount = 0;
            } else {
                throw new Error('Circuit is open');
            }
        }
        try {
            const result = await fn(...args);
            failureCount = 0; // Reset on success
            return result;
        } catch (error) {
            failureCount++;
            lastFailureTime = Date.now();
            if (failureCount >= failureThreshold) {
                isOpen = true;
            }
            throw error;
        }
    };
};
