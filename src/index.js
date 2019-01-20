import * as maptalks from 'maptalks';
import WindGL from './render/index';
import Renderer from './render/renderer';
import {
  calcMatrices,
} from './helper/gl-utils';
import { getTargetZoom } from './helper';

const _options = {
  renderer: 'webgl',
  doubleBuffer: true,
  animation: true,
  glOptions: {
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  },
};

// from https://github.com/maptalks/maptalks.mapboxgl/blob/5db0b124981f59e597ae66fb68c9763c53578ac2/index.js#L201
// const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20)); // eslint-disable-line
//
// function getZoom(res) {
//   return 19 - Math.log(res / MAX_RES) / Math.LN2;
// }

class WindLayer extends maptalks.CanvasLayer {
  constructor(id, datas = {}, options = {}) {
    super(id, Object.assign(_options, options));
    this.datas = datas;

    /**
     * wind instance
     * @type {null}
     */
    this.wind = null;
  }

  /**
   * get data
   * @returns {*}
   */
  getWindData() {
    return this.datas;
  }

  /**
   * set data
   * @param datas
   */
  setWindData(datas) {
    this.datas = datas;
    this.renderScene();
  }

  draw() {
    this.renderScene();
  }

  drawOnInteracting() {
    this.renderScene();
  }

  _getPosition(pixel) {
    const { width, height } = this.getMap().getSize();
    const [halfWidth, halfHeight] = [width / 2, height / 2];
    const x = (pixel.x - halfWidth) / halfWidth;
    const y = (halfHeight - pixel.y) / halfHeight;
    return [
      x, y,
    ]
  }

  _getViewPort(bbox) {
    const map = this.getMap();
    const targetZ = getTargetZoom(map);
    const pixel1 = map.coordinateToPoint(new maptalks.Coordinate([
      bbox[0], bbox[1],
    ]), targetZ);
    const pixel2 = map.coordinateToPoint(new maptalks.Coordinate([
      bbox[2], bbox[3],
    ]), targetZ);
    const a = this._getPosition(pixel1);
    const b = this._getPosition(pixel2);
    return [
      a[0], a[1], b[0], b[1],
    ]
  }

  renderScene() {
    const map = this.getMap();
    if (!map) return;
    const extent = map.getExtent();
    const viewMatrix = calcMatrices(map);
    const bbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
    const viewPort = this._getViewPort(bbox);
    const renderer = this._getRenderer();
    if (this.wind) {
      this.wind.setView(viewPort, viewMatrix);
      this.wind.resize();
    } else {
      if (!renderer.gl) return;
      this.wind = new WindGL(renderer.gl);
      this.wind.setView(viewPort, viewMatrix);
      this.wind.resize();
    }

    if (this.wind && this.datas && this.datas.data && this.datas.image) {
      this.wind.setWind(this.datas.data, this.datas.image);
      this.wind.draw();
    }
    renderer.completeRender();
  }

  remove() {
    super.remove();
  }
}

WindLayer.registerRenderer('webgl', Renderer);

export {
  WindLayer, // eslint-disable-line
};
