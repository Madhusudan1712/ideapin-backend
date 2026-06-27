import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get("/", (req, res) => {
    res.send("ideapin API running");
});

// Centralized error handling
app.use(errorHandler as ErrorRequestHandler);

export default app;
