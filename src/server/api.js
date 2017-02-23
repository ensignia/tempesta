/* eslint-disable no-console */
import { Router } from 'express';
import fs from 'fs';
import Data from './weather/data.js';

const api = Router();

const data = new Data();
data.load();

api.get('/map/gfs/:z/:x/:y/tile.png', async (req, res) => {
  try {
    const path = await data.getTile('gfs', 'cape', req.params.x, req.params.y, req.params.z);

    res.writeHead(200, {
      'Content-Type': 'image/png',
    });
    fs.createReadStream(path).pipe(res);
  } catch (error) {
    console.log(error);
    // something went wrong
    res.status(500).end();
  }
});

export default api;
