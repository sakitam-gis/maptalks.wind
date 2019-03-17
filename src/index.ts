// @ts-ignore
import * as maptalks from 'maptalks';
// import { mat4 } from '@mapbox/gl-matrix';
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
// const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20)); // eslint-disable-line
//
// function getZoom(res) {
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
  private program: WebGLProgram | null | undefined;
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

  drawOnInteracting() {
    this.renderScene();
  }

  initRender(map: any, gl: WebGLRenderingContext) {
    const vertexSource = `
        uniform mat4 u_matrix;
        void main() {
            // gl_Position = u_matrix * vec4(0.5, 0.5, 0.0, 0.0);
            gl_Position = u_matrix * vec4(0.25, 0.25, 0, 1);
            gl_PointSize = 20.0;
        }`;

    const fragmentSource = `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 255.0, 1.0);
        }`;

    // @ts-ignore
    const vertexShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    // @ts-ignore
    const fragmentShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram();
    // @ts-ignore
    gl.attachShader(this.program, vertexShader);
    // @ts-ignore
    gl.attachShader(this.program, fragmentShader);
    // @ts-ignore
    gl.linkProgram(this.program);
    console.log(map);
  }

  render(gl: WebGLRenderingContext, matrix: []) {
    // @ts-ignore
    gl.useProgram(this.program);
    // @ts-ignore
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'u_matrix'), false, matrix);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  renderScene() {
    // @ts-ignore
    const map = this.getMap();
    if (!map) return;
    const projViewMatrix = map.projViewMatrix.slice();
    // const worldSize = 512 * map.getGLScale();
    // const mercatorMatrix = mat4.scale([], projViewMatrix,
    // [worldSize, worldSize, worldSize]); // TODO: get view matrix
    // @ts-ignore
    const renderer = this._getRenderer();
    if (!this.wind) {
      if (!renderer.gl) return;
      this.initRender(map, renderer.gl);
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

    // if (this.wind) {
    //   this.wind.render(projViewMatrix);
    // }
    this.render(renderer.gl, projViewMatrix);
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
  // WindGL,
  WindLayer,
};
