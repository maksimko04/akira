import multer from 'multer';

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error("INCORRECT_FIELD"), false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage,
  imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Максимум 5 MB
  },
}).single('avatar'); // Назва поля у FormData

export const uploadFilesMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('attachments', 10);