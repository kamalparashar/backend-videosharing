import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if(!title || !description){
        throw new ApiError(400, "All fields are required")
    }

    let videoFileLocalPath, thumbnailLocalPath

    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = req.files.videoFile[0].path
    }
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if(!videoFileLocalPath){
        throw new ApiError(400, "videoFile is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    
    if(!videoFile){
        throw new ApiError(400, "videoFile is required")
    }
    if(!thumbnail){
        throw new ApiError(400, "thumbnail is required")
    }

    const video = await Video.create({
        title: title,
        description: description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, video, "Video published successfully!")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Id is required")
    }
    
    //validating videoID
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "INVALID VIDEO ID")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video fetched successfully!")
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const sortField = sortBy && sortBy.trim() ? sortBy : "createdAt"

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {[sortField]:sortType === 'asc' ? 1 : -1}
    }

    const match = {
        ...(query && { $text: { $search: query } }),
        ...(userId && { userId })
    };

    const aggregate = Video.aggregate([
        { $match: match },
        { $sort: options.sort }
    ]);

    const videos = await Video.aggregatePaginate(aggregate, options)

    if(!videos){
        throw new ApiError(500, "Something went wrong while fetching videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const {title, description } = req.body
    const { videoId } = req.params
    
    if(!title || !description){
        throw new ApiError(400, "All fields are required!")
    }
    if(!mongoose.isValidObjectId(videoId)){
        return new ApiError(400, "INVALID videoID")
    }

    const newThumbnailLocalPath = req.file?.path

    const thumbnail = await uploadOnCloudinary(newThumbnailLocalPath)
    
    const oldThumbnail = await Video.findById(videoId)
    const oldThumbnailUrl = oldThumbnail?.thumbnail.split("/")
    const oldThumbnailPublicId = oldThumbnailUrl[oldThumbnailUrl?.length - 1].split(".")[0]

    const video = await Video.findByIdAndUpdate(videoId, 
        {
            $set:{
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    )
    
    if(!video){
        throw new ApiError(500, "Something went wrong while updating video")
    }

    const response = await deleteFromCloudinary(oldThumbnailPublicId)
    if(!response){
        throw new ApiError(500, "Error occurred while deleting old thumbnail")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video updated successfully.")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400, "VideoId is required")
    }

    const oldvideo = await Video.findById(videoId)

    const oldThumbnailUrl = oldvideo?.thumbnail.split("/")
    const oldThumbnailPublicId = oldThumbnailUrl[oldThumbnailUrl?.length - 1].split(".")[0]
    
    const oldVideoUrl = oldvideo?.videoFile.split("/")
    console.log(oldVideoUrl)
    const oldVideoPublicId = oldVideoUrl[oldVideoUrl?.length - 1].split(".")[0]
    console.log(oldVideoPublicId)
    const deletedVideo = await Video.deleteOne({_id: videoId})
    
    if(!deletedVideo){
        throw new ApiError(500, "Something went wrong while deleting the video")
    }
    console.log(deletedVideo)
    const thumbnail_res = await deleteFromCloudinary(oldThumbnailPublicId, 'image')
    const video_res = await deleteFromCloudinary(oldVideoPublicId, 'video')

    if(!thumbnail_res){
        throw new ApiError(500, "Error while deleting thumbnail")
    }
    if(!video_res){
        throw new ApiError(500, "Error while deleting videoFile")
    }
    console.log(thumbnail_res)
    console.log(video_res)
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Video deleted successfully!")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const video = await Video.findById({videoId})
    
    const video = await Video.findByIdAndUpdate(videoId,
        [{
            $set: {
                isPublished: {$eq: [false,"$isPublished"]}  // $eq: isEqual; matches values in array 
            }                                               // if they match return true else false
        }],
        {new: true}
    )

    if(!video){
        throw new ApiError("No video exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Publish status toggled successfully.") 
    )
})

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}