import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validate - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // create user object - create entry in db
    // remove password ans refresh token fiedl from response
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

export {registerUser}

