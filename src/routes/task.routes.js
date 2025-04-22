import { Router } from "express";
import {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask} from '../controllers/task.controller.js'
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router()
 
router.get("/projects/:projectId/tasks", isLoggedIn, getTasks);
 
router.get("/projects/:projectId/tasks/:taskId", isLoggedIn, getTaskById);

router.post("/projects/:projectId/tasks", isLoggedIn, createTask);

router.patch("/projects/:projectId/tasks/:taskId", isLoggedIn, updateTask);

router.delete("/projects/:projectId/tasks/:taskId", isLoggedIn, deleteTask);

router.post("/tasks/:taskId/subtasks", isLoggedIn, createSubTask);

router.patch("/tasks/:taskId/subtasks/:subtaskId", isLoggedIn, updateSubTask);

router.delete("/tasks/:taskId/subtasks/:subtaskId", isLoggedIn, deleteSubTask);

export default router