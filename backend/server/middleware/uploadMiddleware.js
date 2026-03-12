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
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

        // Create a unique public_id base
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const generatedId = `${baseName}_${uniqueSuffix}`;

        if (isPdf) {
            return {
                folder: 'sponsorship-platform',
                resource_type: 'raw',
                public_id: `${generatedId}.pdf` // Appending .pdf directly here ensures Cloudinary keeps the extension for raw files
            };
        }

        return {
            folder: 'sponsorship-platform',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
            resource_type: 'image',
            public_id: generatedId // Images don't necessarily need the extension in public_id
        };
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
        } else if (file.fieldname === 'image' || file.fieldname === 'logo') {
            // Impact gallery images + team member photos → images only
            const filetypes = /jpg|jpeg|png|webp|avif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = file.mimetype.startsWith('image/');
            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Error: Only image files (jpg, png, webp, avif) are accepted!'));
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
