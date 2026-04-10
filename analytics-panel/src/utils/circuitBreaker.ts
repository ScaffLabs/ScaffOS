class CircuitBreaker {
    private failureCount = 0;
    private successCount = 0;
    private thresholdFailures = 5;
    private thresholdSuccesses = 2;
    private isOpen = false;
    private cooldownPeriod = 30000; // 30 seconds
    private lastFailureTime = 0;

    public execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.isOpen) {
            if (Date.now() - this.lastFailureTime > this.cooldownPeriod) {
                this.isOpen = false;
            } else {
                return Promise.reject(new Error('Circuit is open')); // Reject if circuit is open
            }
        }
        return operation().then(result => {
            this.successCount++;
            if (this.successCount >= this.thresholdSuccesses) {
                this.reset(); // Reset if enough successes
            }
            return result;
        }).catch(err => {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            if (this.failureCount >= this.thresholdFailures) {
                this.open(); // Open circuit on failures
            }
            return Promise.reject(err);
        });
    }

    private open() {
        this.isOpen = true;
        this.failureCount = 0;
        this.successCount = 0;
    }

    private reset() {
        this.successCount = 0;
        this.failureCount = 0;
    }
}

export default CircuitBreaker;