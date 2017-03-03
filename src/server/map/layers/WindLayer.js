/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import Layer from './Layer.js';

class WindLayer extends Layer {

  async isSupportedSource(dataSourceName) {
    return dataSourceName === 'gfs';
  }

  async getTile(outputPath, dataSource, tileX, tileY, tileZ) {
    console.log(`Generating Wind tile for ${tileX}/${tileY}/${tileZ}`);

    const dataU = dataSource.getData('windU', 0);
    const dataV = dataSource.getData('windV', 0);

    const { // Use object destructuring, only get what you need :)
      leftLongitude,
      topLatitude,
      angularPixelWidth,
      angularPixelHeight,
    } = Layer.getTileInfo(tileX, tileY, tileZ);

    const image = pureimage.make(Layer.TILE_SIZE, Layer.TILE_SIZE);
    const ctx = image.getContext('2d');

    for (let yPixel = 0; yPixel < Layer.TILE_SIZE; yPixel += 1) {
      for (let xPixel = 0; xPixel < Layer.TILE_SIZE; xPixel += 1) {
        const pixelLatitude = topLatitude - (angularPixelHeight * yPixel);
        const pixelLongitude = leftLongitude + (angularPixelWidth * xPixel);

        const pixelValue = dataU.simpleDiscreteMapping(pixelLatitude, pixelLongitude);
        const val = this.colorer.render(pixelValue, 5, 0x0000FF00, 0xFF000000, true, 0x88);
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    return await new Promise(resolve => {
      pureimage.encodePNG(image, fs.createWriteStream(outputPath), err => resolve(!err));
    });
  }

}

export default WindLayer;
