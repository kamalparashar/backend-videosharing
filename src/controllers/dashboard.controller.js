import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Video } from '../models/video.model.js'
import mongoose from 'mongoose'

const getChannelStats = asyncHandler(async (req, res) => {
    const videosInfo = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                totalViews: { $sum: "$views" },
                totalSubscribers: { $size: "$subscribers" },
                totalLikes: { $size: "$likes" }
            }
        },
        {
            $project: {
                owner: 1,
                totalViews: 1,
                totalvideos: { $literal: 1 }, // Assuming you want to count the videos
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ]);

    if (!videosInfo) {
        throw new ApiError(500, "Something went wrong while getting stats of videos");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videosInfo[0], "Stats fetched successfully."));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user?._id})

    if(!videos){
        throw new ApiError(500, "Something went wrong while fetching videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos fetched successfully.")
    )
})

export {
    getChannelStats,
    getChannelVideos
}