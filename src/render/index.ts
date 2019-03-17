// from https://github.com/mapbox/webgl-wind/blob/c1fa1316f7/src/index.js

import {
  bindTexture,
  createBuffer,
  createTexture,
  createProgram,
  bindAttribute,
  bindFramebuffer,
} from './helper';
// @ts-ignore
import * as drawVert from './shaders/draw.vertex.glsl';
// @ts-ignore
import * as drawFrag from './shaders/draw.fragment.glsl';
// @ts-ignore
import * as quadVert from './shaders/quad.vertex.glsl';
// @ts-ignore
import * as screenFrag from './shaders/screen.fragment.glsl';
// @ts-ignore
import * as updateFrag from './shaders/update.fragment.glsl';

function getColorRamp(colors: {}) {
  const canvas = document.createElement('canvas');
  const ctx: any = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 1;
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  for (const stop in colors) { // eslint-disable-line
    gradient.addColorStop(+stop, colors[stop]);
  }
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

class WindGL {
  matrix: any;
  gl: WebGLRenderingContext;
  fadeOpacity: number;
  speedFactor: number;
  dropRate: number;
  dropRateBump: number;
  drawProgram: any;
  screenProgram: any;
  updateProgram: any;
  quadBuffer: WebGLBuffer|null;
  framebuffer: WebGLFramebuffer|null;
  windData: {
    source: string;
    date: Date;
    width: number;
    height: number;
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
  };
  screenTexture: WebGLTexture|null;
  colorRampTexture: WebGLTexture|null;
  backgroundTexture: WebGLTexture|null;

  _numParticles: number;
  particleStateResolution: number;

  particleIndexBuffer: WebGLBuffer|null;
  particleStateTexture1: WebGLTexture|null;
  particleStateTexture0: WebGLTexture|null;

  windTexture: WebGLTexture|null;
  constructor(gl: WebGLRenderingContext, options?: {
    fadeOpacity: number|undefined,
    speedFactor: number|undefined,
    dropRate: number|undefined,
    dropRateBump: number|undefined,
    colorRamp: number|undefined,
    numParticles: number|undefined,
  }) {
    // @ts-ignore
    const { fadeOpacity, speedFactor, dropRate, dropRateBump, colorRamp, numParticles } = options || {};
    this.gl = gl;

    this.fadeOpacity = fadeOpacity || 0.996; // how fast the particle trails fade on each frame
    this.speedFactor = speedFactor || 0.25; // how fast the particles move
    this.dropRate = dropRate || 0.003; // how often the particles move to a random place
    // drop rate increase relative to individual particle speed
    this.dropRateBump = dropRateBump || 0.01;
    // this.numParticles = numParticles || 65536;

    this.drawProgram = createProgram(gl, drawVert, drawFrag);
    this.screenProgram = createProgram(gl, quadVert, screenFrag);
    this.updateProgram = createProgram(gl, quadVert, updateFrag);

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

  resize() {
    const { gl } = this;
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

  set numParticles(numParticles) {
    const { gl } = this;
    // we create a square texture where each pixel will hold a particle position encoded as RGBA
    const particleRes = Math.ceil(Math.sqrt(numParticles));
    this.particleStateResolution = particleRes;
    this._numParticles = particleRes * particleRes;

    const particleState = new Uint8Array(this._numParticles * 4);
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
    for (let i = 0; i < this._numParticles; i++) particleIndices[i] = i;
    this.particleIndexBuffer = createBuffer(gl, particleIndices);
  }

  get numParticles() {
    return this._numParticles;
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
  }, image: any) {
    this.windData = data;
    this.windTexture = createTexture(this.gl, this.gl.LINEAR, image);
  }

  render(matrix: any) { // eslint-disable-line
    const { gl, windData } = this;
    if (!gl || !windData) return;
    this.matrix = matrix;
    const blendingEnabled = gl.isEnabled(gl.BLEND);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
    bindTexture(gl, this.windTexture, 0);
    bindTexture(gl, this.particleStateTexture0, 1);
    this.drawScreen();
    this.updateParticles();
    if (blendingEnabled) gl.enable(gl.BLEND);
  }

  drawScreen() {
    const { gl } = this;
    // draw the screen into a temporary framebuffer to retain it as the background on the next frame
    bindFramebuffer(gl, this.framebuffer, this.screenTexture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.drawTexture(this.backgroundTexture, this.fadeOpacity);
    this.drawParticles();
    bindFramebuffer(gl, null);
    // enable blending to support drawing on top of an existing background (e.g. a map)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.drawTexture(this.screenTexture, 1.0);
    gl.disable(gl.BLEND);
    // save the current screen as the background for the next frame
    const temp = this.backgroundTexture;
    this.backgroundTexture = this.screenTexture;
    this.screenTexture = temp;
  }

  drawTexture(texture:WebGLTexture|null, opacity:number) {
    const { gl } = this;
    const program = this.screenProgram;
    gl.useProgram(program.program);
    bindAttribute(gl, this.quadBuffer, program.a_pos, 2);
    bindTexture(gl, texture, 2);
    gl.uniform1i(program.u_screen, 2);
    gl.uniform1f(program.u_opacity, opacity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawParticles() {
    const { gl } = this;
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
    // 1、要修改的uniform属性的位置的对象
    // 2、是否逆转矩阵
    // 3、矩阵
    gl.uniformMatrix4fv(program.u_matrix, false, this.matrix);
    // gl.uniform4fv(program.u_bbox, this.bbox);
    gl.drawArrays(gl.POINTS, 0, this._numParticles);
  }

  updateParticles() {
    const { gl } = this;
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
    // gl.uniform4fv(program.u_bbox, this.bbox);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // swap the particle state textures so the new one becomes the current one
    const temp = this.particleStateTexture0;
    this.particleStateTexture0 = this.particleStateTexture1;
    this.particleStateTexture1 = temp;
  }
}

export default WindGL;
