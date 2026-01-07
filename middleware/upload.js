import multer from 'multer';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = file.originalname.replace(ext, '').replace(/\s+/g, '-').toLowerCase();
        cb(null, `${Date.now()}-${base}${ext}`);
    }
})

function fileFilter(req, file, cb) {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
}

export default multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024}, // 2MB limit
    fileFilter
});