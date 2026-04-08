async monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB, Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB, Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

setInterval(this.monitorMemoryUsage.bind(this), 60000); // every 60 seconds