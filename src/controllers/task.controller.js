import {Task} from '../models/task.models.js'
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import {SubTask} from '../models/subtask.models.js'


const getTasks = asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    
    const tasks = await Task.find({project: projectId});
    if(!tasks){
        throw new ApiError(404, "Error while fetching tasks");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, tasks, "Tasks fetched successfully!"));
});


const getTaskById = asyncHandler(async (req, res) => {
    const {taskId} = req.params;

    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(400, "Error while fetching task");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, task, "Task fetched successfully!"));
});


const createTask = asyncHandler(async (req, res) => {
    /////////////TODO : validation
    const {title, description, assignedTo, status, attachments} = req.body;
    const {_id} = req.user;
    const {projectId} = req.params;

    const task = await Task.create({
        title,
        description,
        assignedTo,
        status,
        attachments,
        assignedBy : _id,
        project: projectId
    });

    if(!task){
        throw new ApiError(404, "Task creation failed");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, task, "Task created successfully"))
});


const updateTask = asyncHandler( async (req, res) => {
    const {title, description, assignedTo, status, attachments} = req.body;
    
    const {taskId} = req.params;

    const task = await Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                title,
                description,
                assignedTo,
                status,
                attachments
            },
        },
        { new: true } // returns the updated document
    );

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    return res
           .status(200)
           .json(new ApiResponse(200, task, "Task updated successfully"))
});


const deleteTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params;
    const task = await Task.findByIdAndDelete(taskId);

    if(!task){
        throw new ApiError(404,"Task not found");
    }

    return res 
           .status(200)
           .json(new ApiResponse(200, task, "Task deleted successfully!"))
})


const createSubTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params;
    const {title} = req.body;
    
    const subtask = await SubTask.create({
        title,
        task: taskId,
        isCompleted: false,
        createdBy : req.user._id
    });

    if(!subtask){
        throw new ApiError(404,"Subtask creation failed");
    }

    return res 
           .status(200)
           .json(new ApiResponse(200, subtask, "Subtask created successfully!"))
});


const updateSubTask = asyncHandler(async (req, res) => {
    const {subtaskId} = req.params;
    const {title, isCompleted} = req.body;

    const subtask = await SubTask.findByIdAndUpdate(
        subtaskId,
        {
            $set: {
                title,
                isCompleted,
            },
        },
        { new: true }
    );

    if(!subtask){
        throw new ApiError(404,"Subtask not found");
    }

    return res 
           .status(200)
           .json(new ApiResponse(200, subtask, "Subtask updated successfully!"))
});


const deleteSubTask = asyncHandler(async (req, res) => {
    const {subtaskId} = req.params;
    const subtask = await SubTask.findByIdAndDelete(subtaskId);

    if(!subtask){
        throw new ApiError(404,"Subtask not found");
    }

    return res 
           .status(200)
           .json(new ApiResponse(200, subtask, "Subtask deleted successfully!"))
});


export {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
};
