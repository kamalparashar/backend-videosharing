import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Like } from '../models/like.model.js'
import mongoose from 'mongoose'

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likeCount: { 
                    $size: "$videos"
                }
            }
        },
        {
            $project: {
                likedBy: 1,
                videos: 1,
                likeCount: 1
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(500, "Error occurred while fetching liked videos")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos[0].videos, "liked videos fetched successfully!")
    )
})

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const unlikeVideo = await Like.deleteOne({video: videoId})

    if(!unlikeVideo){
        throw new ApiError(500, "Error while toggling like")
    }

    if(unlikeVideo.deletedCount === 0){
        const likedVideo = await Like.create({
            likedBy: req.user?._id,
            video: videoId,
            comment: null,
            tweet: null
        })

        if(!likedVideo){
            throw new ApiError(500, "Something went wrong while liking the video")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "video liked successfully.")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "unliked video successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    const unlikeComment = await Like.deleteOne({comment: commentId})

    if(unlikeComment.deletedCount === 0){
        const likeComment = await Like.create({
            likedBy: req.user?._id,
            comment: commentId,
            video: null,
            tweet: null
        })

        if(!likeComment){
            throw new ApiError(500, "Something went wrong while liking comment.")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeComment, "comment liked successfully")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "comment unliked successfully.")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    const unlikeTweet = await Like.deleteOne({tweet: tweetId})

    if(unlikeTweet.deletedCount === 0){
        const likeTweet = await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId,
            video: null,
            comment: null
        })

        if(!likeTweet){
            throw new ApiError(500, "Something went wrong while liking tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeTweet, "liked tweet successfully")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "unliked tweet successfully")
    )
})

export {
    getLikedVideos,
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike
}