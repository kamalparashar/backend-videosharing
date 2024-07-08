import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.genrateAccessToken() 
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validate - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    //get user details 
    const {username, fullName, email, password} = req.body

    //validation
    if(
        [username, fullName, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "Required Field is empty")
    }

    //check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    //check for avatar and coverImage
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // creating user and removing password and refresh token field from response
    const user = await User.create({
        username: username.toLowerCase(), 
        fullName, 
        email, 
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //checking for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while regestering user")
    }
    //returning response
    return res.status(201).json(
        new ApiResponse(200, "User Registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> username or email and password
    // validate - empty
    // find user
    // verify/match password
    // generate access and refresh tokens 
    // send cookie
    // return response

    const {username, email, password} = req.body
    // either username or email
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refreshToken")
        }
    
        if(!(incomingRefreshToken===user.refreshToken)){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            http: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})

export {registerUser, loginUser, logoutUser, refreshAccessToken}