import express from 'express';
const app = express();

import bulk from './bulk.js';
import single from './single.js';
import init from './init-db.js';

// Routes
app.use('/bulk', bulk);
app.use('/single', single);
app.use('/init-db', init);

export default app;
