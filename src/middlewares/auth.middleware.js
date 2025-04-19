import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error"

export const isLoggedIn = (req,res,next) => {
    try {
        const token = req.cookies?.access_token;

        if(!token){
            throw new ApiError(401, "Authentication Failed")
        }

        const payload = jwt.verify(access_token,process.env.ACCESS_TOKEN_SECRET)
        req.user = payload;

    } catch (error) {
        throw new ApiError(500, "Internal server error", [error])
    }

    next();
}