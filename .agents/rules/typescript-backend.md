# Backend TypeScript Standards

## 1. Type Safety and any Ban
- **Ban `any`**: Do not use `any` in any backend file. If a type cannot be determined statically, use `unknown` and assert it using type guards or validation libraries (e.g., Zod, Joi) at the system boundaries.
- **Explicit Types**: Declare explicit types for function parameters, object literals, and function returns. Avoid relying entirely on type inference for complex variables.

## 2. Express Request and Response Typing
- **Type Express Handlers**: Enforce strict typing for Express request and response parameters. Define custom request interfaces that extend `Request` to represent typed bodies, query params, and route parameters.
  ```typescript
  import { Request, Response } from 'express';

  export interface CreateIdeaBody {
    title: string;
    description: string;
    tags: string[];
  }

  export interface CreateIdeaRequest extends Request {
    body: CreateIdeaBody;
  }

  export const createIdea = async (
    req: CreateIdeaRequest,
    res: Response
  ): Promise<Response> => { ... };
  ```
- **Response Payloads**: Do not send generic responses. Define interface types for the payloads returned in API response bodies.
- **Typed Express Locals**: When using middleware to inject data (e.g., authenticated user details) onto `res.locals` or `req.user`, extend the Express types globally or define a strictly typed request interface (e.g., `AuthenticatedRequest`).

## 3. Service Layer Method Signatures
- **Mandatory Return Types**: All methods and helper functions within the Services layer must explicitly define their return types. If the method performs asynchronous tasks, the return type must be a typed `Promise`.
  ```typescript
  // Correct
  public async findIdeaById(id: string): Promise<IIdea | null> { ... }

  // Incorrect
  public async findIdeaById(id: string) { ... }
  ```
- **Pure DTO Input/Output**: Ensure Service parameters are plain objects, primitives, or interfaces. Do not pass Express Request/Response objects into service methods.
