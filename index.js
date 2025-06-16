import express from 'express';
import api from './pages/api/api.js';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', api);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
