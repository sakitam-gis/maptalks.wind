const CONTEXT_CONFIG = {
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  strokeStyle: '#000000',
  fillStyle: '#000000',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
};

// https://www.w3.org/TR/compositing/#porterduffcompositingoperators
function setupBlend(gl, compOp) {
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
const createCanvas = (width, height, scaleFactor, Canvas) => {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    return canvas
  }
  // create a new canvas instance in node.js
  // the canvas class needs to have a default constructor without any parameter
  return new Canvas(width, height);
};

/**
 * handle webgl content error
 * @param error
 */
function onContextCreationError(error) {
  console.log(error.statusMessage); // eslint-disable-line
}

/**
 * 创建图形绘制上下文
 * @param canvas
 * @param type
 * @param glOptions
 * @returns {*}
 */
const createContext = (canvas, type, glOptions = {}) => {
  if (!canvas) return null;
  let context = null;
  if (type === '2d') {
    context = canvas.getContext('2d');
    if (!context._merge_ && CONTEXT_CONFIG) {
      Object.keys(CONTEXT_CONFIG).forEach(key => {
        context[key] = CONTEXT_CONFIG[key]
      })
      context._merge_ = true;
    }
  } else if (type === 'webgl') {
    canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
    context = canvas.getContext('webgl2', glOptions);
    context = context || canvas.getContext('experimental-webgl2', glOptions);
    if (!context) {
      context = canvas.getContext('webgl', glOptions);
      context = context || canvas.getContext('experimental-webgl', glOptions);
    }
    canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
    context.clearColor(0.0, 0.0, 0.0, 0.0);
    context.enable(context.BLEND);
    const compOp = glOptions.globalCompositeOperation || 'source-over';
    setupBlend(context, compOp);
    context.disable(context.DEPTH_TEST);
    context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  }
  return context;
};

/**
 * get pixel ratio
 * @returns {number}
 */
const getDevicePixelRatio = () => window.devicePixelRatio || 1;

/**
 * scale canvas
 * @param context
 * @param size
 * @param type
 */
const scaleCanvas = (context, size, type) => {
  const devicePixelRatio = getDevicePixelRatio();
  context.canvas.width = size[0] * devicePixelRatio;
  context.canvas.height = size[1] * devicePixelRatio;
  context.canvas.style.width = `${context.canvas.width / devicePixelRatio}px`;
  context.canvas.style.height = `${context.canvas.height / devicePixelRatio}px`;
  if (type === '2d') {
    context.scale(devicePixelRatio, devicePixelRatio);
  } else if (context.viewport) {
    context.viewport(0, 0, context.canvas.width, context.canvas.height)
  }
};

/**
 * 清空画布
 * @param context
 * @param type
 */
const clearRect = (context, type) => {
  if (!context) return;
  if (type === '2d') {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  } else if (type === 'webgl') {
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT); // eslint-disable-line
  }
};

/**
 * bind
 * @param fn
 * @param context
 * @param args
 * @returns {Function}
 */
function bind(fn, context, ...args) {
  return function () { // eslint-disable-line
    return fn.apply(context, args);
  };
}

const getColorData = (color) => {
  const ctx = createCanvas(1, 1).getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
};

const getTargetZoom = (map) => map.getMaxNativeZoom() / 2;

export {
  bind,
  clearRect,
  createCanvas,
  scaleCanvas,
  createContext,
  getColorData,
  getTargetZoom,
  getDevicePixelRatio,
}
