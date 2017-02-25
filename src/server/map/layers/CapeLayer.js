/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import Layer from './Layer.js';

class CapeLayer extends Layer {

  async isSupportedSource(dataSourceName) {
    return dataSourceName === 'gfs' || dataSourceName === 'hrrr';
  }

  async getTile(outputPath, dataSource, tileX, tileY, tileZ) {
    console.log(`Generating CAPE tile for ${tileX}/${tileY}/${tileZ}`);

    const data = dataSource.getData('cape', 0);

    // longitude and latitude of upper-left, bottom-right tile corners
    // latitude: NORTH-SOUTH, y coordinate
    // longitude: WEST-EAST, x coordinate
    const leftLongitude = Layer.tileToLongitude(tileX, tileZ);
    const rightLongitude = Layer.tileToLongitude(tileX + 1, tileZ);
    const topLatitude = Layer.tileToLatitude(tileY, tileZ);
    const bottomLatitude = Layer.tileToLatitude(tileY + 1, tileZ);

    const angularTileWidth = Math.abs(rightLongitude - leftLongitude);
    const angularTileHeight = Math.abs(topLatitude - bottomLatitude);
    const angularPixelWidth = angularTileWidth / 256;
    const angularPixelHeight = angularTileHeight / 256;

    const image = pureimage.make(256, 256);
    const ctx = image.getContext('2d');

    for (let yPixel = 0; yPixel < 256; yPixel += 1) {
      for (let xPixel = 0; xPixel < 256; xPixel += 1) {
        const pixelLatitude = topLatitude - (angularPixelHeight * yPixel);
        const pixelLongitude = leftLongitude + (angularPixelWidth * xPixel);

        const pixelData = data.bilinearInterpolation(pixelLongitude, pixelLatitude);
        const val = 0x00000088 + (pixelData * (2 ** 24)); // eslint-disable-line no-
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.setFont('Source Sans Pro', 20);
    ctx.fillText(`Tile ${tileX}/${tileY}/${tileZ}`, 10, 50);

    return await new Promise(resolve => {
      pureimage.encodePNG(image, fs.createWriteStream(outputPath), err => resolve(!err));
    });
  }

}

export default CapeLayer;
