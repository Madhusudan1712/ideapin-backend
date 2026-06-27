# Clean Code and Optimization Standards

## 1. Simplicity & Readability
- **Favor Readability Over Cleverness**: Write simple, explicit code. Avoid obscure syntax tricks or extremely compressed expressions that hinder peer review and long-term maintenance.
- **Single-Purpose Functions**: Keep functions small and modular. A single function should focus on doing one task and doing it well. If a function handles multiple operations, split it into smaller helper functions.
- **Nesting Depth Limit**: Enforce a maximum nesting depth of **3 levels** for conditionals, switch blocks, and loops.
- **Guard Clauses & Early Returns**: Use early returns to check for invalid conditions or edge cases immediately. This removes deep `if-else` blocks and keeps the main execution path clean.
  ```typescript
  // Correct
  export const deleteIdea = async (ideaId: string, userId: string): Promise<void> => {
    const idea = await IdeaModel.findById(ideaId);
    if (!idea) throw new NotFoundError('Idea not found');
    if (idea.author.toString() !== userId) throw new UnauthorizedError('Unauthorized action');

    await idea.deleteOne();
  };
  ```

## 2. DRY and SOLID Principles
- **Never Duplicate Queries**: Do not repeat Mongoose queries or aggregation structures across different endpoints. If multiple services or controllers perform the same query, abstract it into a static method on the Model or a helper service method.
- **Extract Reusable Utilities**: Relocate generic calculations, text parsing, currency formatting, or token generation tasks to pure utility files within `src/utils/` or helper service layers.

## 3. Asynchronous Code and Performance
- **Parallel Promise Execution**: Avoid executing independent asynchronous operations in a sequential waterfall. Use `Promise.all()` or `Promise.allSettled()` to execute independent Promises concurrently.
  ```typescript
  // Correct (Concurrent execution)
  const [user, userIdeas] = await Promise.all([
    UserModel.findById(userId),
    IdeaModel.find({ author: userId })
  ]);

  // Incorrect (Sequential waterfall delay)
  const user = await UserModel.findById(userId);
  const userIdeas = await IdeaModel.find({ author: userId });
  ```
- **Avoid Blocking the Event Loop**: Never execute heavy synchronous operations (such as processing giant arrays with expensive loops, performing synchronous file-system calls `fs.readFileSync`, or complex CPU-bound algorithms) on the main thread. Delegate CPU-intensive tasks to worker threads or compute them off-line.
- **Use Streams for Large Data**: When serving large files, processing massive CSVs, or fetching huge datasets, stream the data using Node.js streams or chunked responses instead of buffering everything in memory.

## 4. Naming Conventions
- **Verb-First Function Names**: Use descriptive, active, verb-first naming patterns for all functions and method names. Do not use generic names like `getData`, `process`, or `execute`.
  - Use `fetchUserById` or `findUserById` instead of `getUser`.
  - Use `calculateTotalOrderValue` instead of `getTotal`.
  - Use `verifyUserCredentials` instead of `login`.
  - Use `removeIdea` or `deleteIdeaById` instead of `remove`.
- **Descriptive Variables**: Choose intention-revealing names for parameters and variables. Avoid single-character variables (e.g., `i`, `x`) except for simple index loops.
