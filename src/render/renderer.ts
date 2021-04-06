import * as maptalks from 'maptalks';
import { getGlContext } from '../core/utils';

class Renderer extends maptalks.renderer.CanvasLayerRenderer {
  public canvas: HTMLCanvasElement | undefined;
  public canvas2: HTMLCanvasElement | undefined;
  public layer: any;
  public gl: WebGLRenderingContext | undefined | null;
  private _drawContext: CanvasRenderingContext2D | undefined;

  public checkResources() {
    return [];
  }

  public getDrawParams() {
    return [];
  }

  public hitDetect() {
    return false;
  }

  public draw() {
    this.prepareCanvas();
    this.prepareDrawContext();
    const layer = this.layer;

    if (layer && layer.draw && this.gl) {
      layer.draw(this.gl);
    }

    this.completeRender();
  }

  public _redraw() {
    this.prepareRender();
    this.draw();
  }

  public clearCanvas() {
    if (this.gl) {
      // clearScene(this.gl, [0, 0, 0, 0]);
    }
  }

  public createContext() {
    if (this.gl && this.gl.canvas === this.canvas) {
      return;
    }

    // @ts-ignore
    this.gl = getGlContext(this.canvas, this.layer.options.glOptions);
  }

  public resizeCanvas(canvasSize?: any) {
    if (this.canvas && this.gl) {
      const map = this.getMap();
      const retina = map.getDevicePixelRatio();
      const size = canvasSize || map.getSize();
      this.canvas.height = retina * size.height;
      this.canvas.width = retina * size.width;
      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  public drawOnInteracting() {
    this.draw();
  }

  public onZoomStart(...args: any[]) {
    super.onZoomStart.apply(this, args);
  }

  public onZoomEnd(...args: any[]) {
    super.onZoomEnd.apply(this, args);
  }

  public onDragRotateStart(...args: any[]) {
    super.onDragRotateStart.apply(this, args);
  }

  public onDragRotateEnd(...args: any[]) {
    super.onDragRotateEnd.apply(this, args);
  }

  public onMoveStart(...args: any[]) {
    super.onMoveStart.apply(this, args);
  }

  public onMoveEnd(...args: any[]) {
    super.onMoveEnd.apply(this, args);
  }

  // onResize() {}

  public remove() {
    delete this._drawContext;
    super.remove();
  }

  public getMap() {
    return super.getMap();
  }

  public completeRender() {
    return super.completeRender();
  }

  private prepareCanvas() {
    return super.prepareCanvas();
  }

  private prepareDrawContext() {
    super.prepareDrawContext();
  }

  private prepareRender() {
    return super.prepareRender();
  }
}

export default Renderer;
