## API Reference
### Health Check
- **GET** `/api/health`
  - **Response:** `200 OK`
  - **Description:** Checks the health of the service.

### Positions
- **GET** `/api/positions`
  - **Response:** `200 OK`
  - **Description:** Retrieves all positions.

- **POST** `/api/positions`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number }`
  - **Response:** `201 Created`
  - **Description:** Creates a new position.

- **PUT** `/api/positions/:id`
  - **Request Body:** `{ "quantity": number }`
  - **Response:** `204 No Content`
  - **Description:** Updates a position by ID.

- **DELETE** `/api/positions/:id`
  - **Response:** `204 No Content`
  - **Description:** Deletes a position by ID.

### Orders
- **POST** `/api/orders`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number, "type": "buy|sell" }`
  - **Response:** `201 Created`
  - **Description:** Submits a new order.