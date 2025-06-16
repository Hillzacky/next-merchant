import express from 'express';
const router = express.Router();
import { up } from '../db.js';

router.get('/init-db', async (req, res) => {
    const { API_KEY, CONNECTION_STRING } = process.env;
    try {
        const data = await up();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Failed' });
    }
});

export default router;