import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath)  return null;
            //upload file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            console.log(response);
            console.log("file uploaded successfully on cloudinary", response.url);
            return response;
        }
        catch(error) {
            fs.unlinkSync(localFilePath)    //remove the locally saved temp file as failure occurred
           console.log("Error while uploading on cloudinary: ",error);
           return null;
       };
    }

export {uploadOnCloudinary};