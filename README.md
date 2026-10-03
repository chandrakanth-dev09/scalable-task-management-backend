# Scalable Task Management Backend

A production-ready REST API for task management built with Node.js, Express.js, and MySQL. Features JWT authentication, input validation, and a clean MVC architecture.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 (Promise-based)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment**: dotenv

## Project Structure

```
scalable-task-management-backend/
├── config/
│   ├── db.js                 # Database connection pool
│   └── schema.sql            # Database schema
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── taskController.js     # Task operations logic
├── middleware/
│   ├── authMiddleware.js     # JWT validation
│   ├── validationMiddleware.js # Request validation
│   └── errorMiddleware.js    # Centralized error handling
├── models/
│   ├── User.js               # User model
│   └── Task.js               # Task model
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── taskRoutes.js         # Task endpoints
│   └── healthRoutes.js       # Health check endpoint
├── utils/
│   ├── asyncHandler.js       # Async error wrapper
│   └── response.js           # Response formatting utilities
├── server.js                 # Main application entry point
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Database Schema

### Users Table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR 100)
- email (VARCHAR 255, UNIQUE)
- password (VARCHAR 255)
- created_at (TIMESTAMP)
```

### Tasks Table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- title (VARCHAR 255)
- description (TEXT)
- status (ENUM: pending, completed)
- priority (ENUM: low, medium, high)
- due_date (DATETIME)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Indexes**:
- user_id (for quick user lookups)
- status (for filtering)
- due_date (for sorting)

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Step 1: Clone & Install Dependencies

```bash
cd scalable-task-management-backend
npm install
```

### Step 2: Database Setup

1. Create a new MySQL database:
```bash
mysql -u root -p
CREATE DATABASE task_management_db;
EXIT;
```

2. Import the schema:
```bash
mysql -u root -p task_management_db < config/schema.sql
```

### Step 3: Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_management_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 4: Start the Server

**Development** (with hot reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns API status

### Authentication

#### Register User
- **POST** `/api/auth/register`
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - **Response** (201):
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "userId": 1,
        "token": "eyJhbGc..."
      }
    }
    ```

#### Login User
- **POST** `/api/auth/login`
  - **Body**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - **Response** (200):
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "userId": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "token": "eyJhbGc..."
      }
    }
    ```

### Tasks

**All task endpoints require Authorization header**:
```
Authorization: Bearer <token>
```

#### Create Task
- **POST** `/api/tasks`
  - **Body**:
    ```json
    {
      "title": "Complete project",
      "description": "Finish the REST API",
      "priority": "high",
      "dueDate": "2026-03-15T10:00:00Z"
    }
    ```
  - **Response** (201): Created task object

#### Get All Tasks
- **GET** `/api/tasks?page=1&limit=10&status=pending&priority=high&sort=due_date&order=asc`
  - **Query Parameters**:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10, max: 100)
    - `status`: Filter by status (pending/completed)
    - `priority`: Filter by priority (low/medium/high)
    - `sort`: Sort by field (due_date/created_at/priority/status)
    - `order`: Sort order (asc/desc)
  - **Response** (200):
    ```json
    {
      "success": true,
      "message": "Tasks retrieved successfully",
      "data": [...],
      "pagination": {
        "total": 25,
        "page": 1,
        "limit": 10,
        "totalPages": 3
      }
    }
    ```

#### Get Single Task
- **GET** `/api/tasks/:id`
  - **Response** (200): Task object
  - **Response** (404): Task not found

#### Update Task
- **PUT** `/api/tasks/:id`
  - **Body** (all fields optional):
    ```json
    {
      "title": "Updated title",
      "description": "Updated description",
      "priority": "medium",
      "dueDate": "2026-04-01T10:00:00Z",
      "status": "completed"
    }
    ```
  - **Response** (200): Updated task object

#### Mark Task as Completed
- **PATCH** `/api/tasks/:id/complete`
  - **Response** (200): Completed task object

#### Delete Task
- **DELETE** `/api/tasks/:id`
  - **Response** (200): Success message
  - **Response** (404): Task not found

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized / Invalid Token
- `404`: Not Found
- `409`: Conflict (e.g., Email already exists)
- `500`: Internal Server Error

## Validation Rules

### Registration
- **name**: Required, non-empty string
- **email**: Required, valid email format
- **password**: Required, minimum 6 characters

### Task Creation
- **title**: Required, non-empty string
- **description**: Optional, string
- **priority**: Optional, must be 'low', 'medium', or 'high'
- **dueDate**: Optional, valid ISO 8601 datetime

### Task Update
- All fields optional, but at least one must be provided
- Same validation rules as creation

## Example Usage

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create Task (replace TOKEN with actual JWT token)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My Task","priority":"high"}'

# Get All Tasks with Pagination
curl http://localhost:3000/api/tasks?page=1&limit=10 \
  -H "Authorization: Bearer TOKEN"

# Get Single Task
curl http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer TOKEN"

# Update Task
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status":"completed"}'

# Mark as Completed
curl -X PATCH http://localhost:3000/api/tasks/1/complete \
  -H "Authorization: Bearer TOKEN"

# Delete Task
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer TOKEN"
```

## Performance Optimizations

1. **Connection Pooling**: MySQL connection pool with configurable limits
2. **Selective Queries**: Only fetches required columns (no SELECT *)
3. **Indexed Queries**: Database indexes on frequently queried fields
4. **Pagination**: Built-in pagination to handle large datasets
5. **Async/Await**: Non-blocking I/O operations throughout

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: express-validator on all inputs
4. **Error Hiding**: Generic error messages to prevent information leakage
5. **SQL Prevention**: Parameterized queries prevent SQL injection
6. **CORS Ready**: Can be easily extended with CORS middleware

## Development Tips

- Use Postman collection for API testing
- Check logs for detailed error information
- Ensure `.env` is in `.gitignore` for security
- Update `JWT_SECRET` in production
- Monitor database connection pool usage
- Use pagination for large datasets

## License

MIT

## Support

For issues or questions, please check:
1. Database connectivity
2. Environment variables are properly set
3. MySQL schema is imported correctly
4. JWT token is included in Authorization header for protected routes
