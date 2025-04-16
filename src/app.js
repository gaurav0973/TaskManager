import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config({
    path: "./.env"
});

const app = express();

// Global middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRoute from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", authRoute)

export default app;
