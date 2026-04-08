setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
    if (memoryUsage.heapUsed > 0.8 * memoryUsage.heapTotal) {
        console.warn('Memory usage is high! Consider optimizing.');
    }
}, 5000);