## API Reference

### Performance Metrics
- **Method**: GET
- **Path**: `/api/performance`
- **Response**: `200 OK`
```json
{
    "drawdown": [10, 20, 30],
    "maxDrawdown": 30,
    "sharpeRatio": 1.5
}
```

### Strategy Management
- **Method**: GET
- **Path**: `/api/strategies`
- **Query Parameters**: `limit`, `offset`, `name`
- **Response**: `200 OK`
```json
[
    { "name": "Strategy A" },
    { "name": "Strategy B" }
]
```

- **Method**: POST
- **Path**: `/api/strategies`
- **Request Body**: `{ "name": "string", "parameters": { ... } }`
- **Response**: `201 Created`
```json
{
    "id": "strategyId",
    "name": "Strategy A",
    "parameters": { ... }
}
```

- **Method**: PUT
- **Path**: `/api/strategies/:id`
- **Request Body**: `{ "name": "string", "parameters": { ... } }`
- **Response**: `200 OK`
```json
{
    "id": "strategyId",
    "name": "Strategy A",
    "parameters": { ... }
}
```

- **Method**: DELETE
- **Path**: `/api/strategies/:id`
- **Response**: `204 No Content`

### Health Check
- **Method**: GET
- **Path**: `/api/health`
- **Response**: `200 OK`
```json
{
    "status": "ok",
    "timestamp": "2023-10-01T12:00:00Z"
}
```