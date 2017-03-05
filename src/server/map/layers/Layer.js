import path from 'path';
import Colorer from '../rendering/Colorer.js';
import { server } from '../../../config.js';

class Layer {

  constructor(data) {
    this.data = data;
    this.colorer = new Colorer();
  }

  static TILE_SIZE = 256;

  /** Converts a google maps tile number to the longitude value
  of its upper left corner */
  static tileToLongitude(x, z) {
    return (((x / (2 ** z)) * 360) - 180);
  }

  /** Converts a google maps tile number to the latitude value
  of its upper left corner */
  static tileToLatitude(y, z) {
    const n = Math.PI - (2 * Math.PI * (y / (2 ** z)));
    return ((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  // bounds of tile and angular tile/pixel metrics
  static getTileInfo(tileX, tileY, tileZ) {
    const leftLongitude = Layer.tileToLongitude(tileX, tileZ);
    const rightLongitude = Layer.tileToLongitude(tileX + 1, tileZ);
    const topLatitude = Layer.tileToLatitude(tileY, tileZ);
    const bottomLatitude = Layer.tileToLatitude(tileY + 1, tileZ);
    const angularTileWidth = Math.abs(rightLongitude - leftLongitude);
    const angularTileHeight = Math.abs(topLatitude - bottomLatitude);
    const angularPixelWidth = angularTileWidth / Layer.TILE_SIZE;
    const angularPixelHeight = angularTileHeight / Layer.TILE_SIZE;

    return {
      leftLongitude,
      rightLongitude,
      topLatitude,
      bottomLatitude,
      angularTileWidth,
      angularTileHeight,
      angularPixelWidth,
      angularPixelHeight,
    };
  }

  static getFullPath(imageName) {
    return path.join(__dirname, server.dataDirectory, 'tiles/', imageName);
  }

  getData() {
    return this.data;
  }
}

export default Layer;
