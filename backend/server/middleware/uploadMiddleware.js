import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Set up Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sponsorship-platform', // Folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        resource_type: 'auto' // Important for handling PDFs vs Images
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        // Enforce validations per field
        if (file.fieldname === 'poster') {
            const filetypes = /jpg|jpeg|png|webp|avif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = file.mimetype.startsWith('image/');

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Error: Event Poster must be an Image!'));
            }
        } else if (file.fieldname === 'brochure' || file.fieldname === 'verificationDocument') {
            const extname = path.extname(file.originalname).toLowerCase() === '.pdf';
            const mimetype = file.mimetype === 'application/pdf';

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error(`Error: ${file.fieldname === 'brochure' ? 'Event Brochure' : 'Verification Document'} must be a PDF!`));
            }
        } else {
            // Default generic fallback
            const filetypes = /pdf|jpg|jpeg|png/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Error: Invalid file type!'));
            }
        }
    },
});

export default upload;
