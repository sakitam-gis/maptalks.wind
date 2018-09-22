import * as maptalks from 'maptalks';
import GLRenderer from './GLRenderer';
import WindGL from './webgl-wind';
const _options = {
  'renderer': 'webgl',
  'doubleBuffer': true,
  'animation': true,
  'glOptions': {
    'alpha': true,
    'antialias': true,
    'preserveDrawingBuffer': true
  }
};

class WindLayer extends maptalks.CanvasLayer {
  static getTargetZoom (map) {
    return map.getMaxNativeZoom();
  }

  constructor (id, datas = {}, options = {}) {
    super(id, Object.assign(_options, options));
    this.datas = datas;
  }

  /**
   * get data
   * @returns {*}
   */
  getWindData () {
    return this.datas;
  }

  /**
   * set data
   * @param datas
   */
  setWindData (datas) {
    this.datas = datas;
    this.renderScene();
  }

  draw () {
    this.renderScene();
  }

  drawOnInteracting () {
    this.renderScene();
  }

  renderScene () {
    const map = this.getMap();
    if (!map) return;
    const extent = map.getExtent();
    const viewMatrix = map.projMatrix;
    const bbox = [extent['xmin'], extent['ymin'], extent['xmax'], extent['ymax']];
    const renderer = this._getRenderer();
    if (this.wind) {
      this.wind.setView(bbox, viewMatrix);
      this.wind.resize();
    } else {
      if (!renderer.gl) return;
      this.wind = new WindGL(renderer.gl);
      this.wind.setView(bbox, viewMatrix);
      this.wind.resize();
    }

    if (this.wind && this.datas && this.datas.data && this.datas.image) {
      this.wind.setWind(this.datas.data, this.datas.image);
      this.wind.draw();
    }
    renderer.completeRender();
  }
}

WindLayer.registerRenderer('webgl', GLRenderer);

export {
  WindLayer
};
