import { Router } from 'express';
import Data from './data.js';

const weather = Router();
const data = new Data();

data.load();

weather.get('/', (req, res) => {
  res.status(200).json({ test: 'hi' });
});

export default weather;
