import * as maptalks from 'maptalks';
import { mat4 } from 'gl-matrix';
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

export function wrap(n: number, min: number, max: number): number {
  const d = max - min;
  const w = ((n - min) % d + d) % d + min;
  return (w === min) ? max : w;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function mercatorXfromLng(lng: number) {
  return (180 + lng) / 360;
}

export function mercatorYfromLat(lat: number) {
  return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
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
    const mercatorMatrix = this.calcMatrices(map);
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
      const extent = map.getExtent();
      const min = extent.getMin();
      const max = extent.getMax();
      const eastIter = Math.max(0, Math.ceil((max.x - 180) / 360));
      const westIter = Math.max(0, Math.ceil((min.x + 180) / -360));
      // const fullExtent = map.getFullExtent();
      // const extent = map.getProjExtent();
      // const fullMin = Math.min(fullExtent.xmax, fullExtent.xmin);
      // const min = Math.min(extent.xmax, extent.xmin);
      // const fullMax = Math.max(fullExtent.xmax, fullExtent.xmin);
      // const max = Math.max(extent.xmax, extent.xmin);
      // const total = fullMax - fullMin;
      // const eastIter = Math.max(0, Math.ceil((max - 180) / 360));
      // const westIter = Math.max(0, Math.ceil((min + 180) / -360));
      this.wind.render(mercatorMatrix, 0);
      for (let i = 1; i <= eastIter; i++) {
        this.wind.render(mercatorMatrix, i);
      }
      for (let i = 1; i <= westIter; i++) {
        this.wind.render(mercatorMatrix, -i);
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

  project(lnglat: any, worldSize: number) {
    const lat = clamp(lnglat.y, -90, 90);
    return new maptalks.Point(
      mercatorXfromLng(lnglat.x) * worldSize,
      mercatorYfromLat(lat) * worldSize);
  }

  calcMatrices(map: any) {
    const size = map.getSize();
    const zoom = map.getZoom();
    const p = map.getPitch();
    const bearing = map.getBearing();
    const fov = map.getFov() * Math.PI / 180; // 0.6435011087932844
    const { width, height } = size;
    const pitch = clamp(p, 0, 85) / 180 * Math.PI;
    const angle = -wrap(bearing, -180, 180) * Math.PI / 180;
    const scale = Math.pow(2, zoom - 1);

    const worldSize = 512 * scale;

    const cameraToCenterDistance = 0.5 / Math.tan(fov / 2) * height;

    // Find the distance from the center point [width/2, height/2] to the
    // center top point [width/2, 0] in Z units, using the law of sines.
    // 1 Z unit is equivalent to 1 horizontal px at the center of the map
    // (the distance between[width/2, height/2] and [width/2 + 1, height/2])
    const halfFov = fov / 2;
    const groundAngle = Math.PI / 2 + pitch;
    const topHalfSurfaceDistance = Math.sin(halfFov) *
      cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);
    const center = this.project(map.getCenter(), worldSize);
    // const _center = map._prjToPoint(map._getPrjCenter(), map.getMaxZoom());
    // console.log(_center);
    const x = center.x;
    const y = center.y;

    // Calculate z distance of the farthest fragment that should be rendered.
    const furthestDistance = Math.cos(Math.PI / 2 - pitch) * topHalfSurfaceDistance + cameraToCenterDistance;
    // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
    const farZ = furthestDistance * 1.01;

    // matrix for conversion from location to GL coordinates (-1 .. 1)
    const m = new Float64Array(16);
    mat4.perspective(m, fov, width / height, 1, farZ);

    mat4.scale(m, m, [1, -1, 1]);
    mat4.translate(m, m, [0, 0, -cameraToCenterDistance]);
    mat4.rotateX(m, m, pitch);
    mat4.rotateZ(m, m, angle);
    mat4.translate(m, m, [-x, -y, 0]);

    // The mercatorMatrix can be used to transform points from mercator coordinates
    // ([0, 0] nw, [1, 1] se) to GL coordinates.
    // const mercatorMatrix = mat4.scale([], m, [worldSize, worldSize, worldSize]);
    // scale vertically to meters per pixel (inverse of ground resolution):
    // mat4.scale(m, m, [1, 1, mercatorZfromAltitude(1, this.center.lat) * this.worldSize, 1]);
    return mat4.scale([], m, [worldSize, worldSize, worldSize]);
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
