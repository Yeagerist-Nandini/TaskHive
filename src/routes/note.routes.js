import { Router } from "express";
import {
    createNote, 
    deleteNote, 
    getNoteById, 
    getNotes, 
    updateNote
} from '../controllers/note.controller.js'
import isLoggedIn from '../middlewares/auth.middleware.js'

const router = Router();

router.get('/projects/:projectId/notes', isLoggedIn, getNotes);

router.get('/projects/:projectId/notes/:noteId', isLoggedIn, getNoteById);

router.post('/projects/:projectId/notes', isLoggedIn, createNote);

router.patch('/projects/:projectId/notes/:noteId', isLoggedIn, updateNote);

router.delete('/projects/:projectId/notes/:noteId', isLoggedIn, deleteNote);


export default router