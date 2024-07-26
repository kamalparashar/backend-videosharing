import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content){
        throw new ApiError(400, "Field is required");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content,
    })

    if(!tweet){
        throw new ApiError(500, "Something went wrong while uploading tweet")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{tweet},"Tweet created successfully!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params
    const tweets = await Tweet.find({owner: userId})

    if(!tweets){
        throw new ApiError(500, "Some error occurred while fetching tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params
    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }

    const tweet = await Tweet.deleteOne({tweetId})
    if(!tweet){
        throw new ApiError(500, "Error occurred while deleting tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Tweet deleted successfully!")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params
    const newContent = req.body.content
    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }
    if(!newContent){
        throw new ApiError(400, "content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, 
        {
            $set:{
                content: newContent
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    deleteTweet,
    updateTweet
}
