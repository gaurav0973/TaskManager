import { User } from "../models/user.models.js"
import { ApiError } from "./api-error.js"

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(400, "User does not exists")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save()
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }

}

export {generateAccessAndRefreshToken}