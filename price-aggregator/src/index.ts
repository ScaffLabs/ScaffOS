import express from 'express';
import { Server } from 'ws';
import http from 'http';
import { PriceAggregator } from './priceAggregator';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const priceAggregator = new PriceAggregator();

app.get('/prices', (req, res) => {
  res.json(priceAggregator.getCurrentPrices());
});

wss.on('connection', (ws) => {
  priceAggregator.subscribe(ws);
});

server.listen(3000, () => {
  console.log('Price aggregator service running on port 3000');
});