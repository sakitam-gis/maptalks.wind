import { CanvasLayer } from 'maptalks';
import WindGL from './core/index';
import Renderer from './render/renderer';

const _options = {
  renderer: 'webgl',
  doubleBuffer: false,
  animation: true,
  glOptions: {
    antialias: false,
    depth: false,
    stencil: false,
    alpha: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  },
};

class WindLayer extends CanvasLayer {
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

  setOptions(options = {}) {
    this.options = Object.assign(this.options, options);
    if (this.wind) {
      this.wind.setOptions(this.options);
    }
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

  prepareToDraw() {
    return [];
  }

  draw(ctx: CanvasRenderingContext2D, gl: WebGLRenderingContext) {
    const map = this.getMap();
    if (!map) return;
    const center = map.getCenter();
    const size = map.getSize();
    const zoom = map.getZoom();
    const p = map.getPitch();
    const bearing = map.getBearing();
    const fov = map.getFov();

    const extent = map.getProjExtent();
    const min = extent.getMin();
    const max = extent.getMax();
    const proj = map.getSpatialReference().getProjection();
    const metersPerDegree = proj.metersPerDegree || (6378137 * Math.PI / 180);

    const mercatorMatrix = WindGL.calcMatrices([
      center.x, center.y,
    ], zoom, p, bearing, fov, size);
    if (!this.wind) {
      if (!ctx) return;
      const { fadeOpacity, speedFactor, dropRate, dropRateBump, colorRamp, numParticles } = this.options;
      this.wind = new WindGL(gl, {
        fadeOpacity,
        speedFactor,
        dropRate,
        dropRateBump,
        colorRamp,
        numParticles,
      });
    }

    if (this.wind) {
      const projCenter = map._getPrjCenter();
      const xmin = (min.x - projCenter.x) / metersPerDegree;
      const xmax = (max.x - projCenter.x) / metersPerDegree;
      const eastIter = Math.max(0, Math.ceil((xmax - 180) / 360));
      const westIter = Math.max(0, Math.ceil((xmin + 180) / -360));
      this.wind.render(mercatorMatrix, 0);
      for (let i = 1; i <= eastIter; i++) {
        this.wind.render(mercatorMatrix, i);
      }
      for (let j = 1; j <= westIter; j++) {
        this.wind.render(mercatorMatrix, -j);
      }
    }

    ctx.drawImage(gl.canvas, 0, 0);

    this.completeRender();
  }

  /**
   * inter
   */
  drawOnInteracting(ctx: CanvasRenderingContext2D, gl: WebGLRenderingContext) {
    this.draw(ctx, gl);
  }

  onResize() {
    super.onResize();
  }

  remove() {
    super.remove();
  }
}

WindLayer.registerRenderer('webgl', Renderer);

export {
  WindLayer,
};
