/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import Layer from './Layer.js';

class CapeLayer extends Layer {

  async isSupportedSource(dataSourceName) {
    return dataSourceName === 'gfs' || dataSourceName === 'hrrr';
  }

  /** Fulfills tile data request with dataSource argument, tiles dumped
  into the outputPath directory */
  async getTile(outputPath, dataSource, forecastHour, tileX, tileY, tileZ) {
    console.log(`Generating CAPE tile for ${tileX}/${tileY}/${tileZ}`);

    const data = dataSource.getData('cape', forecastHour);

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

        const pixelValue = data.bilinearInterpolation(pixelLatitude, pixelLongitude);
        const val = this.colorer.render(pixelValue, 2500, 0x0000FF00, 0xFF000000, true, 0xFF);
        // const val = this.colorer.renderCM(pixelValue, 2500, 'jet', 15);
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    return await new Promise(resolve => {
      pureimage.encodePNG(image, fs.createWriteStream(outputPath), err => resolve(!err));
    });
  }

}

export default CapeLayer;
