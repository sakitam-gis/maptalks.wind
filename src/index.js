import * as maptalks from 'maptalks';
import WindGL from './render/index';
import Renderer from './render/renderer';

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
const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20)); // eslint-disable-line

function getZoom(res) {
  return 19 - Math.log(res / MAX_RES) / Math.LN2;
}

class WindLayer extends maptalks.CanvasLayer {
  static getTargetZoom(map) {
    return map.getMaxNativeZoom();
  }

  constructor(id, datas = {}, options = {}) {
    super(id, Object.assign(_options, options));
    this.datas = datas;
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

  _getViewState() {
    const map = this.getMap();
    const res = map.getResolution();
    const center = map.getCenter();
    const pitch = map.getPitch();
    const bearing = map.getBearing();
    return {
      latitude: center.y,
      longitude: center.x,
      zoom: getZoom(res),
      bearing,
      pitch,
    }
  }

  renderScene() {
    const map = this.getMap()
    const renderer = this._getRenderer();
    console.log(map, WindGL); // eslint-disable-line
    renderer.completeRender();
  }

  remove() {
    super.remove();
  }
}

WindLayer.registerRenderer('webgl', Renderer);

export default WindLayer;
