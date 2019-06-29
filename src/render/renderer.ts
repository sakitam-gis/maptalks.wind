import * as maptalks from 'maptalks';
import { createCanvas, createContext } from '../utils';

class Renderer extends maptalks.renderer.CanvasLayerRenderer {
  private _drawContext: any;
  public canvas: HTMLCanvasElement | undefined;
  public canvas2: HTMLCanvasElement | undefined;
  public layer: any;
  public gl: WebGLRenderingContext | undefined | null;
  private _width: number | undefined;
  private _height: number | undefined;
  checkResources() {
    return [];
  }

  getDrawParams() {
    return [];
  }

  hitDetect() {
    return false;
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
    const args = [this.context, this.gl, view];
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

  createContext() {
    if (this.gl && this.gl.canvas === this.canvas || this.context) {
      return;
    }

    // @ts-ignore
    this.context = this.canvas.getContext('2d');
    if (!this.context) {
      return;
    }

    // @ts-ignore
    this.gl = createContext(this.canvas2, this.layer.options.glOptions);

    const dpr = this.getMap().getDevicePixelRatio();
    if (dpr !== 1) {
      this.context.scale(dpr, dpr);
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
      this.canvas2 = createCanvas(width, height, retina, map.CanvasClass);
      this.layer.fire('canvascreate', { context: this.context, gl: this.gl });
    }
  }

  checkForCanvasSizeChange() {
    const map = this.getMap();
    const size = map.getSize();
    const newWidth = size.width;
    const newHeight = size.height;
    if (newWidth !== this._width || newHeight !== this._height) {
      this._width = newWidth;
      this._height = newHeight;
      return true;
    }
    return false;
  }

  /**
   * when map changed, call canvas change
   * @param canvasSize
   */
  resizeCanvas(canvasSize?: any) {
    if (this.canvas && this.gl) {
      const map = this.getMap();
      const retina = map.getDevicePixelRatio();
      const size = canvasSize || map.getSize();
      this.canvas.height = retina * size.height;
      this.canvas.width = retina * size.width;
      if (this.canvas2) {
        this.canvas2.width = retina * size.width;
        this.canvas2.height = retina * size.height;
      }
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * clear canvas
   */
  clearCanvas() {
    if (!this.canvas) return;
    if (this.canvas && this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.gl) {
      // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
  }

  prepareCanvas() {
    if (!this.canvas) {
      this.createCanvas();
      this.createContext();
    } else {
      this.clearCanvas();
      if (this.checkForCanvasSizeChange()) {
        this.resizeCanvas();
      }
    }
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
