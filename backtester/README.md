## API Reference
### Backtest
- **POST /api/backtest**
  - **Request Body:**
    ```json
    {
      "strategyParams": {
        "slippage": 0.01,
        "buyThreshold": 0.5,
        "sellThreshold": 0.5
      },
      "historicalData": [
        { "timestamp": 1620000000, "price": 100 },
        { "timestamp": 1620000060, "price": 101 }
      ]
    }
    ```
  - **Response:**
    - **201 Created**
      ```json
      {
        "id": "<backtest-id>",
        "result": {
          "totalReturns": 1,
          "trades": 1,
          "winRate": 100,
          "performanceMetrics": "Simulated 1 trades with a win rate of 100"
        }
      }
      ```
    - **400 Bad Request** if input is invalid.

### Get Backtest Result
- **GET /api/backtest/:id**
  - **Response:**
    - **200 OK**
      ```json
      {
        "id": "<backtest-id>",
        "strategyParams": { ... },
        "historicalData": [ ... ],
        "result": { ... }
      }
      ```
    - **404 Not Found** if the result does not exist.