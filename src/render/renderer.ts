// @ts-ignore
import * as maptalks from 'maptalks';
import { createCanvas, createContext } from '../utils';

class Renderer extends maptalks.renderer.CanvasLayerRenderer {
  private _drawContext: any;
  private canvas: HTMLCanvasElement | undefined;
  private buffer: HTMLCanvasElement | undefined;
  private layer: any;
  private context: CanvasRenderingContext2D | null | undefined;
  private gl: WebGLRenderingContext | undefined | null;
  checkResources() {
    return [];
  }

  getDrawParams() {
    return [];
  }

  draw() {
    this.prepareCanvas();
    this.prepareDrawContext();
    this._drawLayer();
  }

  prepareDrawContext() {
    super.prepareDrawContext();
  }

  // tslint:disable-next-line:function-name
  _drawLayer() {
    const args = this._prepareDrawParams();
    if (!args) {
      return;
    }
    this.layer.draw.apply(this.layer, args);
    this.completeRender();
  }

  // tslint:disable-next-line:function-name
  _prepareDrawParams() {
    if (!this.getMap()) {
      return null;
    }
    const view = this.getViewExtent();
    if (view['maskExtent'] && !view['extent'].intersects(view['maskExtent'])) {
      this.completeRender();
      return null;
    }
    const args = [this.gl, view];
    const params = this.getDrawParams();
    args.push.apply(args, params ? (Array.isArray(params) ? params : [params]) : []);
    args.push.apply(args, this._drawContext);
    return args;
  }

  /**
   * tell layer redraw
   * @returns {*}
   */
  needToRedraw() {
    if (this.layer.options['animation']) {
      return true;
    }
    return super.needToRedraw();
  }

  /**
   * listen canvas create
   */
  onCanvasCreate() {
    if (this.canvas && this.layer.options.doubleBuffer) {
      const map = this.getMap();
      const retina = map.getDevicePixelRatio();
      this.buffer = createCanvas(
        this.canvas.width, this.canvas.height, retina, this.getMap().CanvasClass,
      );
      this.context = this.buffer.getContext('2d');
    }
  }

  /**
   * create canvas
   */
  createCanvas() {
    if (!this.canvas) {
      const map = this.getMap();
      const size = map.getSize();
      const retina = map.getDevicePixelRatio();
      const [width, height] = [retina * size.width, retina * size.height];
      this.canvas = createCanvas(width, height, retina, map.CanvasClass);
      this.gl = createContext(this.canvas, this.layer.options.glOptions);
      this.onCanvasCreate();
      this.layer.onCanvasCreate(this.context, this.gl);
      this.layer.fire('canvascreate', { context: this.context, gl: this.gl });
    }
  }

  /**
   * when map changed, call canvas change
   * @param canvasSize
   */
  resizeCanvas(canvasSize: any) {
    if (this.canvas && this.gl) {
      const map = this.getMap();
      const retina = map.getDevicePixelRatio();
      const size = canvasSize || map.getSize();
      this.canvas.height = retina * size.height;
      this.canvas.width = retina * size.width;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * clear canvas
   */
  clearCanvas() {
    if (this.canvas && this.gl) {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  prepareCanvas() {
    if (!this.canvas) {
      this.createCanvas();
      // this.createContext();
    } else {
      this.clearCanvas();
    }
    const mask = super.prepareCanvas();
    this.layer.fire('renderstart', { context: this.context, gl: this.gl });
    return mask;
  }

  renderScene() {
    this.completeRender();
  }

  drawOnInteracting() {
    this.draw();
  }

  onZoomStart(...args: any[]) {
    super.onZoomStart.apply(this, args);
  }

  onZoomEnd(...args: any[]) {
    super.onZoomEnd.apply(this, args);
  }

  remove() {
    delete this._drawContext;
    super.remove();
  }

  getMap() {
    return super.getMap();
  }
}

export default Renderer;
