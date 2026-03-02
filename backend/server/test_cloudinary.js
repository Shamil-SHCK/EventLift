import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testUpload = async () => {
    try {
        console.log("Testing Cloudinary Data:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret_length: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
        });

        // Using a tiny base64 image as a mock file
        const res = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAEFjZFNlZSBQcm8gOC4xLjEzNe7kNAAAAA1JREFUGFdj+P//PwMQAwMGAQGIsqIAAAAASUVORK5CYII=", {
            folder: 'sponsorship-platform-test'
        });

        console.log("Upload Success! URL:", res.secure_url);

        // Cleanup the test image
        await cloudinary.uploader.destroy(res.public_id);
        console.log("Test image cleaned up.");
    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
    }
};

testUpload();
