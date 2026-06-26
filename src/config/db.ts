import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("DB Connection Error:", error);
        process.exit(1);
    }
};