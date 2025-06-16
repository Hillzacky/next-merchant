import express from 'express';
const router = express.Router();
import { getMultipleData } from '../maps.js';

router.get('/:search', async (req, res) => {
    const { search } = req.params;
    try {
        getMultipleData(search);
        res.json({"status": "complete"});
    } catch (error) {
        console.error('Error fetching bulk data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default router;
