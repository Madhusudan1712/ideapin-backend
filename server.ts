import dotenv from "dotenv";
import { validateEnv } from "./src/config/validateEnv";
import app from "./src/app";
import { connectDB } from "./src/config/db";

dotenv.config();
validateEnv();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});