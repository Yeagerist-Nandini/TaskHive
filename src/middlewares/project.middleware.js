import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";


export const IsUserAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;

        //what if user is admin in one project but not in other project?
        //can access "role" becoz of projectMember reference
        const user = await User.findById(userId).select("role");

        if (user.role !== "admin") {
            throw new ApiError(403, "You are not authorized");
        }

        next();
    } catch (error) {
        throw next(new ApiError(500, "Internal server error"));   
    }
}