import express from 'express';
import multer from 'multer';
import {
  getMyProfile,
  updateProfile,
  updateAnthem,
  uploadVoiceClip,
  listUsers,
  getUserById
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.originalname.match(/\.(mp3|wav)$/)) {
      return cb(new Error('Only .mp3 and .wav files are allowed'));
    }
    cb(null, true);
  }
});

// Wrapper to handle async middleware correctly
const asyncMiddleware = (fn: Function) => (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply asyncMiddleware to authenticate
const authMiddleware = asyncMiddleware(authenticate);

router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateProfile);
router.post('/me/anthem', authMiddleware, updateAnthem);
router.post('/me/voice-clip', authMiddleware, upload.single('voice'), uploadVoiceClip);
router.get('/', listUsers);
router.get('/:id', getUserById);

export default router;