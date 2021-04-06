import { CanvasLayer, Coordinate } from 'maptalks';
import WindGL from './core/index';
import Renderer from './render/renderer';

const _options = {
  renderer: 'gl',
  doubleBuffer: false,
  animation: true,
  wrapX: true,
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

  draw(gl: WebGLRenderingContext) {
    const map = this.getMap();
    if (!map) return;

    if (!this.wind) {
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
      const scale = map.getResolution(map.getGLZoom());
      // const proj = map.getSpatialReference().getTransformation().transform([], scale);
      const proj = map.getSpatialReference().getTransformation();
      // @tip this.matrix[0] * (coordinates.x - this.matrix[2]) / scale, this.matrix[1] * (coordinates.y - this.matrix[3]) / scale

      const projObject = map.getProjection().fullExtent;
      const projectionExtent = [
        projObject.left,
        projObject.bottom,
        projObject.right,
        projObject.top,
      ];
      const worlds = this.getWrappedWorlds();
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < worlds.length; i++) {
        this.wind.render(map.projViewMatrix, worlds[i], {
          transformMatrix: proj.matrix,
          transformScale: scale,
          projectionExtent,
        });
      }
    }
  }

  public getWrappedWorlds() {
    const map = this.getMap();
    const projObject = map.getProjection().fullExtent;
    const projectionExtent = [
      projObject.left,
      projObject.bottom,
      projObject.right,
      projObject.top,
    ];
    const projExtent = map.getProjExtent();
    const extent = [
      projExtent.xmin,
      projExtent.ymin,
      projExtent.xmax,
      projExtent.ymax,
    ];
    let startX = extent[0];
    const worldWidth = projectionExtent[2] - projectionExtent[0];
    const projWorldWidth = Math.abs(
      map.coordToPoint(
        map
          .getProjection()
          .unprojectCoords(
            new Coordinate([projectionExtent[0], projectionExtent[1]]),
          ),
        map.getGLZoom(),
      ).x -
      map.coordToPoint(
        map
          .getProjection()
          .unprojectCoords(
            new Coordinate([projectionExtent[2], projectionExtent[3]]),
          ),
        map.getGLZoom(),
      ).x,
    );
    let world = 0;

    const result = [];

    if (this.options.wrapX) {
      while (startX < projectionExtent[0]) {
        --world;
        result.push(world * projWorldWidth);
        startX += worldWidth;
      }
      world = 0;
      startX = extent[2];
      while (startX > projectionExtent[2]) {
        ++world;
        result.push(world * projWorldWidth);
        startX -= worldWidth;
      }
    }

    result.push(0);

    return result;
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

WindLayer.registerRenderer('gl', Renderer);

export {
  WindLayer,
};
