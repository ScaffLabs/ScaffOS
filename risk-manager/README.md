## API Reference
### GET /api/risk
- **Description**: Retrieve risk positions.
- **Query Parameters**:
  - `limit` (integer): Number of results to return.
  - `offset` (integer): Number of results to skip.
  - `sort` (string): Field to sort by.
  - `filter` (string): Field to filter by.
- **Responses**:
  - `200 OK`: Returns a list of risk positions.
    - **Response Body**: `[{ id: '1', asset: 'AAPL', position: 50 }, ...]`
  - `500 Internal Server Error`: An error occurred while fetching data.

### POST /api/risk
- **Description**: Create a new risk position.
- **Request Body**:
  - `asset` (string): The asset for the risk position.
  - `position` (number): The position size.
- **Responses**:
  - `201 Created`: Risk position created successfully.
    - **Response Body**: `{ id: 'new_id', asset: 'AAPL', position: 50 }`
  - `400 Bad Request`: Invalid input.
  - `500 Internal Server Error`: An error occurred while creating.

### PUT /api/risk/{id}
- **Description**: Update a risk position.
- **Parameters**:
  - `id` (string): Risk position ID.
- **Request Body**:
  - `position` (number): The updated position size.
- **Responses**:
  - `204 No Content`: Risk position updated successfully.
  - `404 Not Found`: Risk position not found.
  - `500 Internal Server Error`: An error occurred while updating.

### DELETE /api/risk/{id}
- **Description**: Delete a risk position.
- **Parameters**:
  - `id` (string): Risk position ID.
- **Responses**:
  - `204 No Content`: Risk position deleted successfully.
  - `404 Not Found`: Risk position not found.
  - `500 Internal Server Error`: An error occurred while deleting.