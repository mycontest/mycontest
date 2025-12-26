# MyContest API Server

Universal REST API for the MyContest platform.

## Architecture

```
server/
├── api/
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── problem.controller.js
│   │   ├── contest.controller.js
│   │   ├── discussion.controller.js
│   │   └── notification.controller.js
│   └── routes/          # API routes
│       ├── auth.routes.js
│       ├── problem.routes.js
│       ├── contest.routes.js
│       ├── discussion.routes.js
│       ├── notification.routes.js
│       └── index.js
├── config/
│   ├── database.js      # Database configuration & helpers
│   └── index.js         # App configuration
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── validate.js      # Joi validation middleware
│   ├── errorHandler.js  # Error handling
│   └── rateLimit.js     # Rate limiting
├── services/            # Business logic
│   ├── auth.service.js
│   ├── problem.service.js
│   ├── contest.service.js
│   ├── discussion.service.js
│   └── notification.service.js
├── models/
│   └── schemas.js       # Joi validation schemas
├── utils/
│   ├── response.js      # Standard API response format
│   └── asyncHandler.js  # Async error wrapper
├── constants/
│   └── index.js         # Constants (status codes, messages, etc.)
├── server.js            # Application entry point
└── package.json
```

## Layer Responsibilities

### Routes Layer
- Define HTTP routes (GET, POST, PUT, DELETE)
- Apply middleware (validation, auth)
- Delegate to controllers

### Controllers Layer
- Handle HTTP requests/responses
- Call service functions
- Return standardized responses using `ApiResponse`

### Services Layer
- Contain all business logic
- Perform database operations
- Handle data transformations
- Return data or throw errors

### Middleware Layer
- Authentication (`authCheck`, `authRequired`, `authAdmin`)
- Validation (Joi schemas)
- Error handling
- Rate limiting

## API Response Format

All API responses use the standardized `ApiResponse` utility:

```javascript
// Success response
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Paginated response
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Error response
{
  "success": false,
  "message": "Error message",
  "errors": [...],
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Usage Examples

### Using ApiResponse in Controllers

```javascript
const ApiResponse = require('../utils/response');

// Success
return ApiResponse.success(res, user, 'User found');

// Created
return ApiResponse.created(res, newProblem, 'Problem created');

// Not Found
return ApiResponse.notFound(res, 'Problem not found');

// Bad Request
return ApiResponse.badRequest(res, 'Validation error', errors);

// Paginated
return ApiResponse.paginated(res, problems, pagination);
```

### Creating a New Service

```javascript
const { dbQueryOne, dbQueryMany } = require('../config/database');

class MyService {
  async getAll() {
    return await dbQueryMany('SELECT * FROM table');
  }

  async getById(id) {
    const result = await dbQueryOne('SELECT * FROM table WHERE id = ?', [id]);
    if (!result) {
      throw { statusCode: 404, message: 'Not found' };
    }
    return result;
  }
}

module.exports = new MyService();
```

### Creating a New Controller

```javascript
const myService = require('../../services/my.service');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

class MyController {
  getAll = asyncHandler(async (req, res) => {
    const items = await myService.getAll();
    return ApiResponse.success(res, items);
  });

  getById = asyncHandler(async (req, res) => {
    const item = await myService.getById(req.params.id);
    return ApiResponse.success(res, item);
  });
}

module.exports = new MyController();
```

### Creating a New Route

```javascript
const express = require('express');
const router = express.Router();
const myController = require('../controllers/my.controller');
const { authRequired } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { mySchema } = require('../../models/schemas');

router.get('/', myController.getAll);
router.get('/:id', myController.getById);
router.post('/', authRequired, validate(mySchema.create), myController.create);

module.exports = router;
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=mycontest_db
DB_CONNECTION_LIMIT=10

SESSION_SECRET=your-secret-key
SESSION_MAX_AGE=86400000

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

BCRYPT_ROUNDS=10
```

## Scripts

```bash
npm run dev      # Start with nodemon
npm run start    # Start production server
npm run test     # Run tests
```

## Security Features

- **bcrypt** password hashing
- **helmet** security headers
- **CORS** configuration
- **Rate limiting** on all endpoints
- **Joi validation** on all inputs
- **httpOnly** session cookies
- **Parameterized queries** to prevent SQL injection

## Error Handling

All errors are caught and handled by the global error handler:

```javascript
// Database errors
if (err.code === 'ER_DUP_ENTRY') {
  return ApiResponse.error(res, 'Duplicate entry', 409);
}

// Custom errors
throw { statusCode: 404, message: 'Not found' };

// Joi validation errors (automatic)
// Handled by validation middleware
```

## Development Tips

1. **Always use asyncHandler** for async route handlers
2. **Use ApiResponse** for all API responses
3. **Throw errors** with statusCode from services
4. **Keep business logic** in services, not controllers
5. **Use constants** instead of magic strings/numbers
6. **Add Joi schemas** for all new endpoints
7. **Follow naming conventions**:
   - `getAll`, `getById`, `create`, `update`, `delete`
   - `authRequired`, `authAdmin`
   - `validate`, `asyncHandler`

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- auth.test.js
```

## Health Check

```bash
curl http://localhost:5000/api/v1/health
```

Response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "2.0.0"
}
```
