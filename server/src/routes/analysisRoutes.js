import express from 'express';
import { analyzeStock } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/analyze', analyzeStock);

export default router;