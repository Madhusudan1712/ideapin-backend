import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Load and serve OpenAPI specification documentation
const swaggerPath = path.join(process.cwd(), 'swagger.json');
let swaggerDocument = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
} catch (error) {
  console.error('Failed to load swagger.json:', error);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get("/", (req, res) => {
    res.send("ideapin API running");
});

// Centralized error handling
app.use(errorHandler as ErrorRequestHandler);

export default app;
