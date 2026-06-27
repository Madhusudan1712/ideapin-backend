# MongoDB and Mongoose Coding Standards

## 1. Schema Typing and Interfaces
- **Strict Interfaces**: Every Mongoose schema must be backed by a corresponding TypeScript interface that inherits from Mongoose's `Document` or is used to construct a `HydratedDocument`.
  ```typescript
  import { Schema, model, Document } from 'mongoose';

  export interface IUser extends Document {
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }

  const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
  }, { timestamps: true });
  ```
- **Implicit Fields**: Do not duplicate fields that are managed automatically by Mongoose, such as `_id` or `__v`, in the TypeScript interface unless explicitly necessary.

## 2. Timestamps and Schema Settings
- **Mandatory Timestamps**: Always enable the `{ timestamps: true }` option in Schema configurations. Do not manually declare or update `createdAt` or `updatedAt` fields.
- **Strict Mode**: Leave Mongoose `strict` mode enabled (which is the default) to prevent unsanitized fields from being saved to the database.

## 3. Query Sanitization and Security
- **Ban Unsanitized Queries**: Do not pass raw, unvalidated client input directly into query functions (e.g., `findOne(req.body)`). Always extract parameters explicitly or sanitize inputs to prevent query injection attacks (e.g., NoSQL injection via `$gt` or `$ne`).
- **Use Typed Filters**: Construct query filter objects using the specific interface types to enforce static type-checking at compile-time:
  ```typescript
  const filter: FilterQuery<IUser> = { email: userEmail };
  const user = await UserModel.findOne(filter);
  ```

## 4. Indexing Standards
- **Explicit Indexing**: Define indexes on fields that are frequently queried, sorted, or used as lookup keys.
- **Unique Indexes**: Ensure fields requiring uniqueness (e.g., `email`, `slug`) have `unique: true` set at the schema level.
- **Compound Indexes**: Declare compound indexes at the schema options level if queries regularly filter by multiple fields together (e.g., filtering ideas by category AND tag).
- **Index Naming**: Provide clear names for custom compound indexes to facilitate database debugging and maintenance.

## 5. Reference Population
- **Select Specific Fields**: Never call `.populate()` without passing a second argument specifying which fields to select. Avoid fetching passwords, hash salts, or large unnecessary object blobs.
  ```typescript
  // Correct
  await IdeaModel.findById(id).populate('author', 'username avatar');

  // Incorrect
  await IdeaModel.findById(id).populate('author');
  ```
- **Limit Deep Nesting**: Limit populating references to a maximum of 2 levels deep to prevent query performance degradation. If deep data fetching is required, refactor to execute a separate query or use Mongo aggregates.
