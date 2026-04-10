import rateLimit from 'express-rate-limit';

const createRateLimiter = (maxRequests: number, windowMs: number) => {
    return rateLimit({
        windowMs, // Time window in milliseconds
        max: maxRequests, // Limit each IP to maxRequests per windowMs
        message: 'Too many requests, please try again later.',
        handler: (req, res) => {
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests, please try again later.',
            });
        },
    });
};

// Create a rate limiter for general usage
const generalLimiter = createRateLimiter(100, 1 * 60 * 1000); // 100 requests per minute

// Create a separate rate limiter for API key usage
const apiKeyLimiter = createRateLimiter(50, 1 * 60 * 1000); // 50 requests per minute per API key

// Create a rate limiter specific to dashboard endpoints
const dashboardLimiter = createRateLimiter(20, 1 * 60 * 1000); // 20 requests per minute for dashboard endpoints

export { generalLimiter, apiKeyLimiter, dashboardLimiter };