/* eslint-disable no-console */
import { Router } from 'express';
import fs from 'fs';
import Data from './map/Data.js';
import fetch from '../app/core/fetch';
import { api } from '../config.js';

const DARK_SKY_BASE_URL = 'https://api.darksky.net/forecast/';

const router = Router();

const data = new Data();

router.get('/map', (req, res) => {
  res.status(200).json(data.getMeta());
});

router.get('/map/:dataSource/:layer/:forecastHour/:z/:x/:y/tile.png', async (req, res) => {
  try {
    // path to tile image
    const path = await data.getTile(
      req.params.dataSource.toLowerCase(),
      req.params.layer.toLowerCase(),
      req.params.forecastHour,
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

/**
 * GET lightning
 * Query parameters:
 * -  since: The unix time to get lightning data since
 * Response:
 * - Json object, example:
 * {
 *  meta: { since: 1000000, to: 2000000 },
 *  data: [
 *    {latitude: 0.5, longitude: 0.5, time: 1500000},
 *    ...
 *  ],
 * }
 * It is expected that the client will make the following request using the to attribute
 * as the since attribute, therefore it should be assumed one is inclusive (to) and the other
 * exclusive (since)
 */
router.get('/lightning', (req, res) => {
  try {
    const lightningDataSource = data.getDataSource('lightning');
    const to = new Date();
    const since = new Date(parseInt(req.query.since, 10)) || to;

    res.status(200).json({
      meta: { since, to },
      data: lightningDataSource.getLightningBetween(since, to),
    });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

export default router;
