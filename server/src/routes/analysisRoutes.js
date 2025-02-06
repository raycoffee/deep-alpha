import express from 'express';
import { analyzeStock } from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';
import { getUserChats } from '../controllers/analysisController.js';
import { getChat } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/analyze', protect, analyzeStock);
router.get('/chats', protect, getUserChats);
router.get('/chats/:chatId', protect, getChat);

export default router;