const CONTEXT_TYPES = [
  // 'webgl2',
  'experimental-webgl',
  'webgl',
  'webkit-3d',
  'moz-webgl',
];

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
 * 创建图形绘制上下文
 * @param canvas
 * @param glOptions
 * @returns {*}
 */
const createContext = (canvas: HTMLCanvasElement, glOptions = {}): WebGLRenderingContext | null => {
  if (!canvas) {
    return null;
  }
  const ii = CONTEXT_TYPES.length;
  for (let i = 0; i < ii; ++i) {
    try {
      const context = canvas.getContext(CONTEXT_TYPES[i], glOptions);
      if (context) {
        // @ts-ignore
        return context;
      }
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

export {
  createCanvas,
  createContext,
};
