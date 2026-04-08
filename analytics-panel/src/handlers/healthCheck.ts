export const healthCheckHandler = (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date(),
    };
    res.status(200).json(healthStatus);
};
