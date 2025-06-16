import express from 'express';
const router = express.Router();
import fetch from 'node-fetch';

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { API_KEY, CONNECTION_STRING } = process.env;
    try {
        const response = await fetch(`${NEON_CONNECTION_STRING}/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const message = `HTTP error ${response.status} - ${await response.text()}`;
            throw new Error(message);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching single data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default router;

