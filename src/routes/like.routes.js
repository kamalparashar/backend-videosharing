import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { 
    getLikedVideos, 
    toggleVideoLike, 
    toggleTweetLike, 
    toggleCommentLike 
} from '../controllers/like.controller.js'

const router = Router()

router.use(verifyJWT)

router.route("/").get(getLikedVideos)

router.route("/L/V/:videoId").post(toggleVideoLike)
router.route("/L/C/:commentId").post(toggleCommentLike)
router.route("/L/T/:tweetId").post(toggleTweetLike)

export default router