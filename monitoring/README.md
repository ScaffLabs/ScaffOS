### API Reference

#### Health Check
- **Method**: GET
- **Path**: /health
- **Request**: No body required
- **Response**:
  - **Body**: `{ "status": "UP" }`
  - **Status Codes**:
    - `200`: Service is running
    - `500`: Internal server error

#### Dashboard
- **Method**: GET
- **Path**: /dashboard
- **Request**: No parameters
- **Response**:
  - **Body**: Array of dashboard entries (e.g., `[{ "id": "1", "data": { "value": 100 } }, ...]`)
  - **Status Codes**:
    - `200`: Successfully retrieved entries
    - `204`: No entries available
    - `500`: Internal server error

#### Create Dashboard Entry
- **Method**: POST
- **Path**: /dashboard
- **Request Body**:
  ```json
  {
    "id": "your_entry_id",
    "value": 123
  }
  ```
- **Response**:
  - **Body**: `{ "message": "Entry created", "id": "your_entry_id" }`
  - **Status Codes**:
    - `201`: Entry successfully created
    - `400`: Invalid input data

#### Update Dashboard Entry
- **Method**: PUT
- **Path**: /dashboard/:id
- **Request Body**:
  ```json
  {
    "value": 456
  }
  ```
- **Response**:
  - **Status Codes**:
    - `204`: Entry successfully updated
    - `400`: Invalid input data
    - `404`: Entry not found

#### Delete Dashboard Entry
- **Method**: DELETE
- **Path**: /dashboard/:id
- **Response**:
  - **Status Codes**:
    - `204`: Entry successfully deleted
    - `404`: Entry not found
