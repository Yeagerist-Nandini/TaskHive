import { asyncHandler } from "../utils/async-handler.js";
import {ProjectNote} from "../models/note.models.js"
import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"

const getNotes = asyncHandler(async (req, res) => {
    const {projectId} = req.params;

    const notes = await ProjectNote.find({project: projectId});

    if(!notes){
        throw new ApiError(404, "notes not found");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, notes, "Notes fetched successfully!"));
});

const getNoteById = asyncHandler(async (req, res) => {
    const {noteId} = req.params;

    const note = await ProjectNote.findById(noteId);

    if(!note){
        throw new ApiError(404, "note not found");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, note, "Note fetched successfully!"));
});

const createNote = asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    /////TODO : validation
    const {content} = req.body;

    const note = await ProjectNote.create({
        project: projectId,
        createdBy: req.user._id,
        content
    })

    if(!note){
        throw new ApiError(500, "note creation failed");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, note, "Note created successfully!"));
});

const updateNote = asyncHandler(async (req, res) => {
    const {noteId} = req.params;
    const {content} = req.body;

    const note = await ProjectNote.findByIdAndUpdate(
        noteId,
        {
            $set:{
                content
            },
        },
        { new: true }
    )

    if(!note){
        throw new ApiError(500, "note updation failed");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, note, "Note updated successfully!"));
});

const deleteNote = asyncHandler(async (req, res) => {
    const {noteId} = req.params;

    const note = await ProjectNote.findByIdAndDelete(noteId);

    if(!note){
        throw new ApiError(500, "note deletion failed");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, note, "Note deleted successfully!"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
