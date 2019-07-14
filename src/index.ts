import { CanvasLayer } from 'maptalks';
import WindGL from './core/index';
import Renderer from './render/renderer';

const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));
function getMapBoxZoom(res: number) {
  return 19 - Math.log(res / MAX_RES) / Math.LN2;
}

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
    // const zoom = map.getZoom();
    const zoom = getMapBoxZoom(map.getResolution());
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

  getValue(coordinates: any) {
    if (this.wind && this.wind.framebuffer) {
      // from: https://github.com/liubgithub/maptalks.wind/blob/master/src/WindLayerRenderer.js#L574
      const data = this.datas.data;
      const t = coordinates.x % 180;
      const pixelX = ((t + 180) / 360) * data.width;
      if (coordinates.y < -90 || coordinates.y > 90) {
        throw new Error('Invalid y for coordinate');
      }
      const pixelY = ((90 - coordinates.y) / 180) * data.height;
      // end
      // const xy = this.map.coordinateToContainerPoint(coordinates);
      const gl = this.wind.gl;
      // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
      gl.pixelStorei(gl.PACK_ALIGNMENT || 0x0D05, 4);

      // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
      const pixels = new Uint8Array(4);
      gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels;
    }
    return null;
  }
}

WindLayer.registerRenderer('webgl', Renderer);

export {
  WindLayer,
};
