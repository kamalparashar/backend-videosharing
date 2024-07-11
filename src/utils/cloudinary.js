import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    })

    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath)  return null
            //upload file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            console.log("cloudinary response after uploading image successfully",response);
            fs.unlinkSync(localFilePath)
            console.log("file uploaded successfully on cloudinary", response.url)
            return response
        }
        catch(error) {
            fs.unlinkSync(localFilePath)    //remove the locally saved temp file as failure occurred
           console.log("Error while uploading on cloudinary: ",error)
           return null
       };
    }

    const deleteFromCloudinary = async(public_id) => {
        try {
            const response = await cloudinary.uploader.destroy(public_id, {
                resource_type: "auto",
                invalidate: true
            })
            return response
        } catch (error) {
            console.log("Eroor while deleting asset from cloudinary: ", error)
            return null
        }
    }

export {uploadOnCloudinary, deleteFromCloudinary};