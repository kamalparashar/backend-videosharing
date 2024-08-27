import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Comment } from '../models/comment.model.js'

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = await Comment.aggregate
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    const comment = await Comment.create({
        video: videoId,
        content: content
    })

    if(!comment){
        throw new ApiError(500, "Something went wrong while adding comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully.")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const comment = await Comment.findByIdAndDelete({_id: commentId})

    if(!comment){
        throw new ApiError(500, "Error while deleting comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully.")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    const comment = await Comment.findByIdAndUpdate(commentId, 
        {
            $set: {
                content: content
            }
        },
        {new: true}
    )

    if(!comment){
        throw new ApiError(500, "Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully.")
    )
})

export {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
}