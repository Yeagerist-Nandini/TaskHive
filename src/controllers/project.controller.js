import { asyncHandler } from "../utils/async-handler.js"
import {Project} from "../models/project.models.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { User } from "../models/user.models.js";


//user will be authenticated via middleware for all these functions 

const getProjects = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const projects = await ProjectMember
    .find({ user: userId })
    .populate({ path: 'project' });

  if (!projects) {
    throw new ApiError(404, "Projects not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projects, "Projects fechted successfully!")
    );
});


const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project fetched successfully!")
    )
});


const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  ////////////TODO: validation banao iska using express-validator
  // only name is required not description
  if (!name) {
    throw new ApiError(500, "Name is required");
  }

  const { _id } = req.user;

  const project = await Project.create({
    name,
    description,
    createdBy: _id
  });

  if (!project) {
    throw new ApiError(500, "Project creation failed!")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project created successfully!")
    );
});


const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.params;
  const { projectId } = req.params;

  /////TODO validate name via validators

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }, // returns the updated document
  );

  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project Updated Successfully!")
    );
});


const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findOneAndDelete({_id: projectId});

  if (!project) {
    throw new ApiError(500, "Deleted project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project Deleted Successfully!"));
});


//----------------------------------------------------------------------
const getProjectMember = asyncHandler(async (id) => {
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    avatar: user.avatar,
    username: user.username,
    email: user.email,
    fullname: user.fullname
  }
})

const getProjectMembers = asyncHandler(async (req, res) => {
  // get project members
  const { projectId } = req.params;

  const projectMembers = await ProjectMember.find({ project: projectId });

  if (!projectMembers) {
    throw new ApiError(404, "Project Members not found!");
  }

  let users = projectMembers.map((projectMember) => getProjectMember(projectMember.user));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        users,
        "Project members fetched successfully!"
      )
    )
});



const addMemberToProject = asyncHandler(async (req, res) => {
  // get other fields
  const { projectId } = req.params;
  const { email, role } = req.body;
  //////TODO: validate those (role should be those 3 only)

  //get the user we want to add
  const memberUser = await User.findOne({ email });
  if (!memberUser) {
    throw new ApiError(404, "User with this email not found!");
  }

  // create project member
  const projectMember = await ProjectMember.create({
    user: memberUser,
    project: projectId,
    role: role
  });

  if (!projectMember) {
    throw new ApiError(404, "Project Member creation failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectMember, "User added to project successfully!"));
});


const deleteMember = asyncHandler(async (req, res) => {
  const projectMemberId = req.params;
  const deletedMember = await ProjectMember.findByIdAndDelete(projectMemberId);

  if (!deletedMember) {
    throw new ApiError(404, "Member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedMember, "Member deleted!"));
});


const updateMemberRole = asyncHandler(async (req, res) => {
  const projectMemberId = req.params;
  const { role } = req.body;
  ///////TODO: validate role

  const updatedMember = await ProjectMember.findByIdAndUpdate(
    projectMemberId,
    {
      $set: {
        role,
      },
    },
    { new: true }, // return updated document
  )

  if (!updatedMember) {
    throw new ApiError(404, "Member not found");
  }


  return res
    .status(200)
    .json(new ApiResponse(200, updatedMember, "Member role updated!"));
});


export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjects,
  getProjectMembers,
  updateMemberRole,
  updateProject,
};
