const express = require('express');
const router = express.Router();
const { up } = require('../db.js');

router.get('/init-db', async (req, res) => {
    const { id } = req.params;
    const { API_KEY, CONNECTION_STRING } = process.env;
    try {
        const data = up();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Failed' });
    }
});

module.exports = router;