import * as maptalks from 'maptalks';
import WindGL from './render/index';
import Renderer from './render/renderer';
import {
  calcMatrices,
} from './helper/gl-utils';
// import { getTargetZoom } from './helper';

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
    if (this.wind) {
      this.wind.setWind(this.datas.data, this.datas.image);
    }
  }

  draw() {
    this.renderScene();
  }

  drawOnInteracting() {
    this.renderScene();
  }

  renderScene() {
    const map = this.getMap();
    if (!map) return;
    const viewMatrix = calcMatrices(map);
    const renderer = this._getRenderer();
    if (!this.wind) {
      if (!renderer.gl) return;
      const {
        fadeOpacity,
        speedFactor,
        dropRate,
        dropRateBump,
        colorRamp,
        numParticles,
      } = this.options;
      this.wind = new WindGL(renderer.gl, {
        fadeOpacity,
        speedFactor,
        dropRate,
        dropRateBump,
        colorRamp,
        numParticles,
      });
    }

    if (this.wind) {
      this.wind.render(viewMatrix);
    }
    renderer.completeRender();
  }

  onResize() {
    if (this.wind) {
      this.wind.resize()
    }
    // super.onResize()
  }

  remove() {
    super.remove();
  }
}

WindLayer.registerRenderer('webgl', Renderer);

export {
  WindLayer, // eslint-disable-line
};
