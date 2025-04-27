import express from "express"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import noteRoutes from "./routes/note.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1",healthCheckRouter);
app.use("/api/v1",noteRoutes);
app.use("/api/v1",authRoutes);
app.use("/api/v1",projectRoutes);
app.use("/api/v1",taskRoutes);


export default app; 