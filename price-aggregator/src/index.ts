app.post('/prices', validatePriceData, handleValidationErrors, async (req, res, next) => {
    try {
        const priceData: PriceData = req.body;
        const newPrice = await storage.create(priceData);
        res.status(201).json(newPrice);
    } catch (error) {
        next(error);
    }
});

app.get('/prices', async (req, res, next) => {
    try {
        const prices = await storage.findAll();
        if (prices.length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(prices);
    } catch (error) {
        next(error);
    }
});