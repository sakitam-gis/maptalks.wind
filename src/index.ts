// @ts-ignore
import * as maptalks from 'maptalks';
import { mat4 } from 'gl-matrix';
import WindGL from './core/index';
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

function getZoom(res: number): number {
  return 19 - Math.log(res / MAX_RES) / Math.LN2;
}

class WindLayer extends maptalks.CanvasLayer {
  private datas: {
    data: {
      source: string;
      date: Date;
      width: number;
      height: number;
      uMin: number;
      uMax: number;
      vMin: number;
      vMax: number;
    },
    image: any,
  };
  private wind: WindGL | null;
  constructor(id: any, datas: any, options = {}) {
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
  setWindData(datas: {
    data: {
      source: string;
      date: Date;
      width: number;
      height: number;
      uMin: number;
      uMax: number;
      vMin: number;
      vMax: number;
    },
    image: any,
  }) {
    this.datas = datas;
    if (this.wind) {
      this.wind.setWind(this.datas.data, this.datas.image);
    }
  }

  draw() {
    this.renderScene();
  }

  /**
   * inter
   */
  drawOnInteracting() {
    this.renderScene();
  }

  renderScene() {
    // @ts-ignore
    const map = this.getMap();
    if (!map) return;
    // const projMatrix = map.projMatrix.slice();
    const zoom = getZoom(map.getResolution());
    const projMatrix = map.projViewMatrix.slice();
    const worldSize = Math.pow(2, zoom);
    // @ts-ignore
    const mercatorMatrix = mat4.scale([], projMatrix,
      [worldSize, worldSize, worldSize]); // TODO: get view matrix
    // @ts-ignore
    const renderer = this._getRenderer();
    if (!this.wind) {
      if (!renderer.gl) return;
      // @ts-ignore
      const { fadeOpacity, speedFactor, dropRate, dropRateBump, colorRamp, numParticles } = this.options;
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
      this.wind.prepareToDraw();
      const bounds = map.getExtent();
      const eastIter = Math.max(0, Math.ceil((bounds.xmax - 180) / 360));
      const westIter = Math.max(0, Math.ceil((bounds.xmin + 180) / -360));
      this.wind.render(mercatorMatrix, 0);
      for (let i = 1; i <= eastIter; i++) {
        this.wind.render(mercatorMatrix, i);
      }
      for (let i = 1; i <= westIter; i++) {
        this.wind.render(mercatorMatrix, -i);
      }
    }
    renderer.completeRender();
  }

  onResize() {
    if (this.wind) {
      this.wind.resize();
    }
    super.onResize();
  }

  remove() {
    super.remove();
  }
}

// @ts-ignore
WindLayer.registerRenderer('webgl', Renderer);

export {
  WindLayer,
};
