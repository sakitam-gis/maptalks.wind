// from https://github.com/mapbox/webgl-wind/blob/c1fa1316f7/src/index.js
import { mat4 } from 'gl-matrix';
import {
  bindTexture,
  createBuffer,
  createTexture,
  createProgram,
  bindAttribute,
  bindFramebuffer,
} from './utils';
import drawVert from '../shaders/draw.vertex.glsl';
import drawFrag from '../shaders/draw.fragment.glsl';

import screenVert from '../shaders/screen.vertex.glsl';
import screenFrag from '../shaders/screen.fragment.glsl';

import updateVert from '../shaders/update.vertex.glsl';
import updateFrag from '../shaders/update.fragment.glsl';

// const NO_TRANSFORM = {dx: 0, dy: 0, scale: 1};

function getColorRamp(colors: any) {
  const canvas = document.createElement('canvas');
  const ctx: any = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 1;
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  Object.keys(colors).forEach((stop: number | string) => {
    gradient.addColorStop(+stop, colors[stop]);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  return new Uint8Array(ctx.getImageData(0, 0, 256, 1).data);
}

const defaultRampColors = {
  0.0: '#3288bd',
  0.1: '#66c2a5',
  0.2: '#abdda4',
  0.3: '#e6f598',
  0.4: '#fee08b',
  0.5: '#fdae61',
  0.6: '#f46d43',
  1.0: '#d53e4f',
};

// tslint:disable-next-line:class-name
interface optionsTypes {
  fadeOpacity?: number;
  speedFactor?: number;
  dropRate?: number;
  dropRateBump?: number;
  colorRamp?: {};
  numParticles?: number;
}

class WindGL {

  set numParticles(numParticles) {
    const gl = this.gl;
    // we create a square texture where each pixel will hold a particle position encoded as RGBA
    const particleRes = Math.ceil(Math.sqrt(numParticles));
    this.particleStateResolution = particleRes;
    this._numParticles = particleRes * particleRes;

    const particleState = new Uint8Array(this._numParticles * 4);
    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < particleState.length; i++) {
      // randomize the initial particle positions
      particleState[i] = Math.floor(Math.random() * 256);
    }
    // textures to hold the particle state for the current and the next frame
    this.particleStateTexture0 = createTexture(
      gl, gl.NEAREST, particleState, particleRes, particleRes,
    );
    this.particleStateTexture1 = createTexture(
      gl, gl.NEAREST, particleState, particleRes, particleRes,
    );
    const particleIndices = new Float32Array(this._numParticles);
    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < this._numParticles; i++) { particleIndices[i] = i; }
    this.particleIndexBuffer = createBuffer(gl, particleIndices);
  }

  get numParticles() {
    return this._numParticles;
  }
  public matrix: any;
  public gl: WebGLRenderingContext;
  public fadeOpacity: number;
  public speedFactor: number;
  public dropRate: number;
  public dropRateBump: number;
  public windData: {
    source: string;
    date: Date;
    width: number;
    height: number;
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
  };
  public _numParticles: number;
  public options: optionsTypes;
  private drawProgram: any;
  private screenProgram: any;
  private updateProgram: any;
  private quadBuffer: WebGLBuffer|null;
  private framebuffer: WebGLFramebuffer|null;

  private screenTexture: WebGLTexture|null;
  private colorRampTexture: WebGLTexture|null;
  private backgroundTexture: WebGLTexture|null;
  private particleStateResolution: number;
  private particleIndexBuffer: WebGLBuffer|null;
  private particleStateTexture1: WebGLTexture|null;
  private particleStateTexture0: WebGLTexture|null;

  private windTexture: WebGLTexture|null;
  constructor(gl: WebGLRenderingContext, options: optionsTypes) {
    const { fadeOpacity, speedFactor, dropRate, dropRateBump, colorRamp, numParticles } = options;
    this.options = options;
    this.gl = gl;
    this.fadeOpacity = fadeOpacity || 0.895; // how fast the particle trails fade on each frame
    this.speedFactor = speedFactor || 0.25; // how fast the particles move
    this.dropRate = dropRate || 0.003; // how often the particles move to a random place
    // drop rate increase relative to individual particle speed
    this.dropRateBump = dropRateBump || 0.01;
    // this.numParticles = numParticles || 65536;

    this.drawProgram = createProgram(gl, drawVert, drawFrag);
    this.screenProgram = createProgram(gl, screenVert, screenFrag);
    this.updateProgram = createProgram(gl, updateVert, updateFrag);

    this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();
    // @ts-ignore
    this.windData = {};

    this.backgroundTexture = null;
    this.screenTexture = null;
    this.colorRampTexture = null;
    this.particleStateResolution = Infinity;
    this._numParticles = Infinity;

    this.particleIndexBuffer = null;
    this.particleStateTexture0 = null;
    this.particleStateTexture1 = null;

    this.windTexture = null;

    this.matrix = [];

    this.setColorRamp(colorRamp || defaultRampColors);
    this.numParticles = numParticles || 65536;
    this.resize();
  }

  setOptions(options: optionsTypes) {
    const { fadeOpacity, speedFactor, dropRate, dropRateBump, colorRamp, numParticles } = options;
    this.fadeOpacity = fadeOpacity || 0.996; // how fast the particle trails fade on each frame
    this.speedFactor = speedFactor || 0.25; // how fast the particles move
    this.dropRate = dropRate || 0.003; // how often the particles move to a random place
    // drop rate increase relative to individual particle speed
    this.dropRateBump = dropRateBump || 0.01;
    this.setColorRamp(colorRamp || defaultRampColors);
    this.numParticles = numParticles || 65536;
  }

  resize() {
    const gl = this.gl;
    const emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
    // screen textures to hold the drawn screen for the previous and the current frame
    this.backgroundTexture = createTexture(
      gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height,
    );
    this.screenTexture = createTexture(
      gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height,
    );
  }

  setColorRamp(colors: object) {
    // lookup texture for colorizing the particles according to their speed
    this.colorRampTexture = createTexture(
      this.gl, this.gl.LINEAR, getColorRamp(colors), 16, 16,
    );
  }

  setWind(data: {
    source: string;
    date: Date;
    width: number;
    height: number;
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
  },      image: any) {
    this.windData = data;
    this.windTexture = createTexture(this.gl, this.gl.LINEAR, image);
  }

  render(matrix: number[], dateLineOffset: number) {
    const gl = this.gl;
    const windData = this.windData;
    if (!gl || !windData) { return; }
    this.matrix = matrix;
    const blendingEnabled = gl.isEnabled(gl.BLEND);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
    bindTexture(gl, this.windTexture, 0);
    bindTexture(gl, this.particleStateTexture0, 1);
    this.drawScreen(matrix, dateLineOffset);
    this.updateParticles();
    if (blendingEnabled) { gl.enable(gl.BLEND); }
  }

  // @ts-ignore
  drawScreen(matrix: number[], dateLineOffset: number) {
    const gl = this.gl;
    // draw the screen into a temporary framebuffer to retain it as the background on the next frame
    bindFramebuffer(gl, this.framebuffer, this.screenTexture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.drawTexture(this.backgroundTexture, this.fadeOpacity);
    this.drawParticles(matrix, dateLineOffset);

    bindFramebuffer(gl, null);

    gl.enable(gl.BLEND);

    // 非预乘阿尔法
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 预乘阿尔法通道
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.drawTexture(this.screenTexture, 1.0);
    // this.drawParticles(matrix, dateLineOffset);

    gl.disable(gl.BLEND);
    // save the current screen as the background for the next frame
    const temp = this.backgroundTexture;
    this.backgroundTexture = this.screenTexture;
    this.screenTexture = temp;
  }

  drawTexture(texture: WebGLTexture | null, opacity: number) {
    const gl = this.gl;
    const program = this.screenProgram;
    gl.useProgram(program.program);
    bindAttribute(gl, this.quadBuffer, program.a_pos, 2);
    bindTexture(gl, texture, 2);

    gl.uniform1i(program.u_screen, 2);
    gl.uniform1f(program.u_opacity_border, 0.0);
    gl.uniform1f(program.u_opacity, opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawParticles(matrix: number[], dateLineOffset: number) {
    const gl = this.gl;
    const program = this.drawProgram;
    gl.useProgram(program.program);

    bindAttribute(gl, this.particleIndexBuffer, program.a_index, 1);
    bindTexture(gl, this.colorRampTexture, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);
    gl.uniform1i(program.u_color_ramp, 2);
    gl.uniform1f(program.u_particles_res, this.particleStateResolution);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);
    gl.uniform1f(program.u_dateline_offset, dateLineOffset);
    // 1、要修改的uniform属性的位置的对象 2、是否逆转矩阵 3、矩阵
    gl.uniformMatrix4fv(program.u_matrix, false, matrix);
    gl.drawArrays(gl.POINTS, 0, this._numParticles);
  }

  updateParticles() {
    const gl = this.gl;
    bindFramebuffer(gl, this.framebuffer, this.particleStateTexture1);
    gl.viewport(0, 0, this.particleStateResolution, this.particleStateResolution);
    const program = this.updateProgram;
    gl.useProgram(program.program);

    bindAttribute(gl, this.quadBuffer, program.a_pos, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);
    gl.uniform1f(program.u_rand_seed, Math.random());
    gl.uniform2f(program.u_wind_res, this.windData.width, this.windData.height);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);
    gl.uniform1f(program.u_speed_factor, this.speedFactor);
    gl.uniform1f(program.u_drop_rate, this.dropRate);
    gl.uniform1f(program.u_drop_rate_bump, this.dropRateBump);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // swap the particle state textures so the new one becomes the current one
    const temp = this.particleStateTexture0;
    this.particleStateTexture0 = this.particleStateTexture1;
    this.particleStateTexture1 = temp;
  }

  public static wrap(n: number, min: number, max: number): number {
    const d = max - min;
    const w = ((n - min) % d + d) % d + min;
    return (w === min) ? max : w;
  }

  public static clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }

  public static mercatorXfromLng(lng: number): number {
    return (180 + lng) / 360;
  }

  public static mercatorYfromLat(lat: number): number {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
  }

  public static project(lnglat: number[], worldSize: number): number[] {
    const lat = WindGL.clamp(lnglat[1], -90, 90);
    return [
      WindGL.mercatorXfromLng(lnglat[0]) * worldSize,
      WindGL.mercatorYfromLat(lat) * worldSize,
    ];
  }

  public static calcMatrices(
    viewCenter: number[],
    zoom: number,
    viewPitch: number,
    bearing: number,
    viewFov: number,
    size: {
      width: number;
      height: number;
      [key: string]: any;
    },
  ) {
    const p = viewPitch;
    const fov = viewFov * Math.PI / 180; // 0.6435011087932844
    const { width, height } = size;
    const pitch = WindGL.clamp(p, 0, 85) / 180 * Math.PI;
    const angle = -WindGL.wrap(bearing, -180, 180) * Math.PI / 180;
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
    const center = WindGL.project(viewCenter, worldSize);
    // const _center = map._prjToPoint(map._getPrjCenter(), map.getMaxZoom());
    // console.log(_center);
    const x = center[0];
    const y = center[1];

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
}

export default WindGL;
