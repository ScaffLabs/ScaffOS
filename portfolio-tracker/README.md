### API Reference

#### POST /api/portfolios
- **Request Body:** `{ "name": string, "positions": [{ "symbol": string, "quantity": number, "averagePrice": number }] }`
- **Response:** `201 Created` with portfolio object
- **Status Codes:**
  - `201`: Portfolio created successfully
  - `400`: Bad request due to validation errors

#### GET /api/portfolios/:id
- **Response:** `200 OK` with portfolio object or `404 Not Found`
- **Status Codes:**
  - `200`: Portfolio found
  - `404`: Portfolio not found

#### PUT /api/portfolios/:id
- **Request Body:** `{ "name": string, "positions": [{ "symbol": string, "quantity": number, "averagePrice": number }] }`
- **Response:** `200 OK` with updated portfolio object or `400 Bad Request`
- **Status Codes:**
  - `200`: Portfolio updated successfully
  - `400`: Invalid update request

#### GET /health
- **Response:** `200 OK` with service health status.
- **Status Codes:**
  - `200`: Service is up
  - `503`: Service is down
