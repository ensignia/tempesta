/* eslint-disable no-console */
import { Router } from 'express';
import fs from 'fs';
import Data from './map/Data.js';
import fetch from '../app/core/fetch';
import { api } from '../config.js';

const DARK_SKY_BASE_URL = 'https://api.darksky.net/forecast/';

const router = Router();

const data = new Data();

router.get('/map/:dataSource/:layer/:z/:x/:y/tile.png', async (req, res) => {
  try {
    // path to tile image
    const path = await data.getTile(
      req.params.dataSource.toLowerCase(),
      req.params.layer.toLowerCase(),
      parseInt(req.params.x, 10),
      parseInt(req.params.y, 10),
      parseInt(req.params.z, 10));

    // transmit tile
    if (path != null) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      });
      fs.createReadStream(path).pipe(res);
    } else {
      res.status(500).end();
    }
  } catch (error) {
    console.log(error);
    // something went wrong
    res.status(500).end();
  }
});

router.get('/weather/:latitude,:longitude', async (req, res) => {
  try {
    const response = await fetch(`${DARK_SKY_BASE_URL}${api.darksky}/${req.params.latitude},${req.params.longitude}?exclude=[minutely,hourly]`);

    res.status(200);
    response.body.pipe(res);
  } catch (error) {
    console.log(error);
    // something went wrong
    res.status(500).json({ error: 'Failed to get data' });
  }
});

router.get('lightning/:timestamp', async (req, res) => {
  try {
    const lightningData = data.getArrayData('lightning', parseInt(req.params.timestamp, 10));

    if (lightningData != null) {
      lightningData.pipe(res);
    } else {
      res.status(500).end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

export default router;
