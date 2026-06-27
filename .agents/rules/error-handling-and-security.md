# Error Handling and Security Standards

## 1. Centralized Error Handling
- **Express Error Middleware**: Implement a centralized global error-handling middleware in Express. All routes and controllers must delegate unhandled exceptions to this middleware by calling `next(err)`.
- **No Stack Trace Leaks**: Do not expose stack traces, database schema logs, or internal server error messages to the client in production mode. Return a generic message (e.g., "Internal Server Error") for unhandled 500 errors, and log the detailed stack trace to a secure logging utility.
- **Custom Error Classes**: Define custom error classes that extend `Error` (e.g., `AppError`, `NotFoundError`, `UnauthorizedError`) with properties for `statusCode` and `isOperational` to distinguish known exceptions from system failures.

## 2. Standard API Response Structures
- **Uniform JSON Format**: Every API response must adhere to a standardized JSON schema. Do not return raw text, strings, or flat arrays at the root level of the response.
- **Response Format**:
  - Success Response:
    ```json
    {
      "success": true,
      "data": { ... },
      "message": "Resource retrieved successfully"
    }
    ```
  - Error Response:
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "The input field title is required."
      }
    }
    ```

## 3. Input Validation
- **Boundary Validation**: Validate all incoming inputs (query parameters, request body, headers, and route parameters) before they reach the controller logic or service layer.
- **Validation Middleware**: Use schema validation libraries (such as Zod, Joi, or class-validator) inside custom validation middlewares. If the validation fails, immediately return a `400 Bad Request` containing specific error details.

## 4. Secret Management
- **Environment Variables**: Store all api keys, database connection strings, JWT secret tokens, and ports inside `.env` configuration files. Do not hardcode secrets or credentials in the source code.
- **Validate Environment Variables**: Validate the presence of all required environment variables at server start-up. If any required variables are missing, terminate the process immediately with an informative error.
- **Git Ignore Secrets**: Ensure that the `.env` file is explicitly included in the `.gitignore` configuration and never committed to version control. Keep a `.env.example` file in the root containing fake values for developers to copy.
