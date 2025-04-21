import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controller.js";
import { IsUserAdmin } from "../middlewares/project.middleware.js";

const router = Router()

router.get("/projects", isLoggedIn, getProjects);

router.get("/projects/:projectId", isLoggedIn, getProjectById);

router.post("/create-project", isLoggedIn, IsUserAdmin, createProject);
//---
router.patch("/projects/:projectId", isLoggedIn, IsUserAdmin, updateProject);

router.delete("/projects/:projectId", isLoggedIn, IsUserAdmin, deleteProject);

router.get("/projects/:projectId/members", isLoggedIn, getProjectMembers);

router.post("/projects/:projectId/members", isLoggedIn, IsUserAdmin, addMemberToProject);

router.delete("/projects/:projectId/members/:projectMemberId", isLoggedIn, IsUserAdmin, deleteMember);

router.patch("/projects/:projectId/members/:projectMemberId", isLoggedIn, IsUserAdmin, updateMemberRole);

export default router