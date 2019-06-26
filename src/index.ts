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

// from https://github.com/maptalks/maptalks.mapboxgl/blob/5db0b124981f59e597ae66fb68c9763c53578ac2/index.js#L201
// const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20)); // eslint-disable-line
//
// function getZoom(res: number) {
//   return 19 - Math.log(res / MAX_RES) / Math.LN2;
// }

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

  // calcLayerMatrices(map: any) {
  //   const size = map.getSize();
  //   const scale = map.getGLScale();
  //
  //   const worldSize = 512 * scale;
  //   // const center = map._prjToPoint(map._getPrjCenter(), map.getMaxZoom());
  //   const fov = map.getFov() * Math.PI / 180;
  //   const cameraToCenterDistance = 0.5 / Math.tan(fov / 2) * size.height * scale;
  //   const center = this.project(map.getCenter(), worldSize);
  //   const x = center.x;
  //   const y = center.y;
  //
  //   const m = mat4.create();
  //   mat4.perspective(m, fov, size.width / size.height, 1, cameraToCenterDistance + 1E9);
  //   mat4.scale(m, m, [1, -1, 1]);
  //   mat4.translate(m, m, [0, 0, -cameraToCenterDistance]);
  //   mat4.rotateX(m, m, map.getPitch() * Math.PI / 180);
  //   mat4.rotateZ(m, m, -map.getBearing() * Math.PI / 180);
  //   mat4.translate(m, m, [-x, -y, 0]);
  //
  //   return mat4.scale([], m, [worldSize, worldSize, worldSize]);
  // }

  renderScene() {
    // @ts-ignore
    const map = this.getMap();
    if (!map) return;
    // const mercatorMatrix = this.calcLayerMatrices(map);
    const mercatorMatrix = this.calcMatrices(map);
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
      // this.wind.render(mercatorMatrix, 0);
      // from https://github.com/astrosat/windgl/blob/3ad0ae3bdd/src/layer.js#L157
      const extent = map.getExtent();
      const min = extent.getMin();
      const max = extent.getMax();
      const eastIter = Math.max(0, Math.ceil((max.x - 180) / 360));
      const westIter = Math.max(0, Math.ceil((min.x + 180) / -360));
      this.wind.render(mercatorMatrix, 0);
      // tslint:disable-next-line:no-increment-decrement
      for (let i = 1; i <= eastIter; i++) {
        this.wind.render(mercatorMatrix, i);
      }
      // tslint:disable-next-line:no-increment-decrement
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
