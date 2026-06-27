import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Load and parse dynamic OpenAPI definition from yaml file
const swaggerDocument = yaml.load(path.join(process.cwd(), 'docs/openapi.yaml'));

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
