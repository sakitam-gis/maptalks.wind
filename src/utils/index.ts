
// https://www.w3.org/TR/compositing/#porterduffcompositingoperators
function setupBlend(gl: WebGLRenderingContext, compOp: string) {
  switch (compOp) {
    case 'source-over':
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      break;
    case 'destination-over':
      gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
      break;
    case 'source-in':
      gl.blendFunc(gl.DST_ALPHA, gl.ZERO);
      break;
    case 'destination-in':
      gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
      break;
    case 'source-out':
      gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ZERO);
      break;
    case 'destination-out':
      gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
      break;
    case 'source-atop':
      gl.blendFunc(gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      break;
    case 'destination-atop':
      gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA);
      break;
    case 'xor':
      gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      break;
    case 'lighter':
      gl.blendFunc(gl.ONE, gl.ONE);
      break;
    case 'copy':
      gl.blendFunc(gl.ONE, gl.ZERO);
      break;
    case 'destination':
      gl.blendFunc(gl.ZERO, gl.ONE);
      break;
    default:
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      break;
  }
}

/**
 * core create canvas
 * @param width
 * @param height
 * @param scaleFactor
 * @param Canvas
 * @returns {HTMLElement}
 */
const createCanvas = (width: number, height: number, scaleFactor: number, Canvas: any): HTMLCanvasElement => {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    return canvas;
  }
  // create a new canvas instance in node.js
  // the canvas class needs to have a default constructor without any parameter
  return new Canvas(width, height);
};

/**
 * handle webgl content error
 * @param error
 */
function onContextCreationError(error: any) {
  console.log(error.statusMessage);
}

/**
 * 创建图形绘制上下文
 * @param canvas
 * @param glOptions
 * @returns {*}
 */
const createContext = (canvas: HTMLCanvasElement, glOptions = {}): WebGLRenderingContext | null => {
  if (!canvas) {
    // @ts-ignore
    return;
  }
  let context: WebGLRenderingContext | null = null;
  canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
  // @ts-ignore
  context = canvas.getContext('webgl2', glOptions);
  // @ts-ignore
  context = context || canvas.getContext('experimental-webgl2', glOptions);
  if (!context) {
    // @ts-ignore
    context = canvas.getContext('webgl', glOptions);
    // @ts-ignore
    context = context || canvas.getContext('experimental-webgl', glOptions);
  }
  canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
  if (context) {
    context.clearColor(0.0, 0.0, 0.0, 0.0);
    context.enable(context.BLEND);
    // @ts-ignore
    const compOp = glOptions.globalCompositeOperation || 'source-over';
    setupBlend(context, compOp);
    context.disable(context.DEPTH_TEST);
  }
  return context;
};

export {
  createCanvas,
  createContext,
};
