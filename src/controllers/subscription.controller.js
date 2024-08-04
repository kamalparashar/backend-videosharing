import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Subscription } from '../models/subscription.model.js'

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const sub = await Subscription.find({channel: channelId})
    
    if(sub.length !== 0){
       const response = await Subscription.deleteOne(sub._id)

       if(!response){
            throw new ApiError(500, "Error occurred while  Unsubscription")
       }

       return res
       .status(200)
       .json(
            new ApiResponse(200, {}, "subscription toggled successfully")
        )
    }

    const subscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!subscription){
        throw new ApiError(500, "Error while Subscribing.")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, subscription, "subscription toggled successfully")
    )
})

const getSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subscription.find({channel: channelId})
    if(!subscribers){
        throw new ApiError(500, {}, "Error occurred while getting subscribers")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "subscribers fetched successfully.")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    const channels = await Subscription.find({subscriber: subscriberId})

    if(!channels){
        throw new ApiError(500, {}, "Error while getting channels")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channels, "channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getSubscribers,
    getSubscribedChannels
}