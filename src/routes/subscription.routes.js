import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { 
    getSubscribedChannels, 
    getSubscribers, 
    toggleSubscription 
} from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router
.get("/subscribers/:channelId", getSubscribers)
.get("/subscriptions/:subscriberId", getSubscribedChannels)

router.patch("/toggle/subscribe/:channelId", toggleSubscription)

export default router