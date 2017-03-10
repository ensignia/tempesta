/* eslint-disable no-console */
import {Router} from 'express';
import toobusy from 'toobusy-js';
import Data from '../map/Data.js';
import fetch from '../../app/core/fetch';
import {api} from '../../config.js';

const DARK_SKY_BASE_URL = 'https://api.darksky.net/forecast/';

export default class ApiMiddleware {

  constructor() {
    this.router = Router();
    this.data = new Data();

    this.router.get('/map', (req, res) => {
      res.status(200).json(this.data.getMeta());
    });

    this.router.get('/map/:layer/:z/:x/:y/tile.png', async(req, res) => {
      if (toobusy()) {
        return res.status(503).send('Server too busy right now :(');
      }

      try {
        // path to tile image
        await this.data.getTile(
          req.params.layer.toLowerCase(),
          parseInt(req.params.x, 10),
          parseInt(req.params.y, 10),
          parseInt(req.params.z, 10),
          req.query,
          req,
          res);
      } catch (error) {
        console.log(error);
        // something went wrong
        res.status(500).end();
      }
    });

    this.router.get('/weather/:latitude,:longitude', async(req, res) => {
      try {
        const response = await fetch(`${DARK_SKY_BASE_URL}${api.darksky}/${req.params.latitude},${req.params.longitude}?exclude=[minutely,hourly]`);

        res.status(200);
        response.body.pipe(res);
      } catch (error) {
        console.log(error);
        // something went wrong
        res.status(500).json({error: 'Failed to get data'});
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
    this.router.get('/lightning/:since', (req, res) => {
      try {
        const lightningDataSource = this.data.getDataSource('lightning');
        const to = new Date();
        const since = new Date(parseInt(req.params.since, 10)) || to;

        res.status(200).json({
          meta: { since: since.getTime(), to: to.getTime() },
          data: lightningDataSource.getLightningBetween(since, to),
        });
      } catch (error) {
        console.log(error);
        res.status(500).end();
      }
    });
  }
}
