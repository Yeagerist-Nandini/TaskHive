import express from "express"
// router imports
import healthCheckRouter from './routes/healthcheck.routes.js'

const app = express();

app.use("/api/v1",healthCheckRouter);

export default app;