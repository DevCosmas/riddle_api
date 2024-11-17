import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import AppError from './app.error';

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './dist/icons');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter function to restrict file types allowed for upload
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype ===
      'image/webp                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    const err = new AppError('Invalid file type', 400);
    cb(err, false);
  }
};

// Initializing multer with configured storage, fileFilter, and size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const uploadIcon = upload.single('icon');

export default uploadIcon;
