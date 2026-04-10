## API Reference
### Health Check
- **Method:** GET
- **Path:** /health
- **Response:** `{ status: 'healthy' }`
- **Status Codes:** 200 OK

### User Management
- **Create User**
  - **Method:** POST
  - **Path:** /api/users
  - **Request Body:** `{ username: string, email: string }`
  - **Response:** User object
  - **Status Codes:** 201 Created, 409 Conflict

- **Get All Users**
  - **Method:** GET
  - **Path:** /api/users
  - **Response:** Array of User objects
  - **Status Codes:** 200 OK

- **Update User**
  - **Method:** PUT
  - **Path:** /api/users/:id
  - **Request Body:** `{ username?: string, email?: string }`
  - **Response:** 204 No Content
  - **Status Codes:** 204 No Content, 404 Not Found

- **Delete User**
  - **Method:** DELETE
  - **Path:** /api/users/:id
  - **Response:** 204 No Content
  - **Status Codes:** 204 No Content, 404 Not Found

### Error Handling
- **Validation Errors**: Returns 400 status with error details.
- **Not Found**: Returns 404 status when a user is not found.
- **Internal Server Errors**: Returns 500 status for unexpected errors.