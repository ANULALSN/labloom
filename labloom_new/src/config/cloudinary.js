const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'labloom_uploads',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
            // PDFs must be uploaded as 'raw' or 'image' with pdf format on Cloudinary
            // Using 'auto' lets Cloudinary determine the best resource_type
            resource_type: isPdf ? 'raw' : 'image',
            // Prevent fl_attachment flag which forces download instead of inline viewing
            flags: isPdf ? undefined : undefined,
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
            'application/pdf'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, WebP) and PDFs are allowed'));
        }
    }
});

module.exports = { cloudinary, upload };
