import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Playlist } from "../models/playlist.model.js"
import mongoose from "mongoose"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const playlist = await Playlist.create({
        name: name,
        description: description
    })

    if(!playlist){
        new ApiError(500, "Error while creating Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist created successfully.")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const playlists = await Playlist.find({owner: userId})
    
    if(!playlists){
        throw new ApiError(500, "Something went wrong while fetching your playlists")
    }

    return  res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "Playlists fetched successfully.")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(500, "Something went wrong while getting playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully.")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(500, "Something went wrong while deleting the playlist")
    }

    // if(playlist.deletedCount === 0){

    // }


    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully.")
    )
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params
    const {name, descripiton} = req.body

    const playlist = await Playlist.findByIdAndUpdate(playlistId, 
        {
            $set: {
                name: name,
                description: descripiton
            }
        },
        {new: true}
    )

    if(!playlist){
        throw new ApiError(500, "Something went wrong while updating playlist details")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully.")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.updateOne({_id: playlistId},
        {
            $addToSet: {
                videos: videoId
            }
        }
    )

    if(!playlist){
        throw new ApiError(500, "Something went wrong while adding video to playlist.")
    }
    

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video added to playlist successfully")
    )
})

const deleteVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.updateOne({_id: playlistId}, {
        $pull: {
            videos: videoId
        }
    })

    if(!playlist){
        throw new ApiError(500, "Something went wrong while removing video from playlist.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video deleted successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    deleteVideoFromPlaylist
}