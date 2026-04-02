import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.status(200).send('Order Engine is healthy!');
});

app.listen(PORT, () => {
  console.log(`Order Engine listening on port ${PORT}`);
});