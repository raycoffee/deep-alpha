// server.js
import express from 'express';
import dotenv from 'dotenv';
import analysisRoutes from './src/routes/analysisRoutes.js';

// Load environment variables
dotenv.config();

const app = express();


app.use(express.json());


app.use('/api/analysis', analysisRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});