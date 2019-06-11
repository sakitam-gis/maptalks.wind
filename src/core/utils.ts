function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader: WebGLShader | null = gl.createShader(type) || {};
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || '');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): object {
  const program: WebGLProgram = gl.createProgram() || '';
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || '');
  }
  const wrapper = {
    program,
  };
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0; i < numAttributes; i++) {
    // @ts-ignore
    const attribute: WebGLActiveInfo = gl.getActiveAttrib(program, i);
    wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
  }
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0; i < numUniforms; i++) {
    // @ts-ignore
    const uniform: WebGLActiveInfo = gl.getActiveUniform(program, i);
    wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }
  return wrapper;
}

function createTexture(
  gl: WebGLRenderingContext,
  filter: GLint,
  data: Uint8Array,
  width?: number,
  height?: number,
): WebGLTexture | null {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  if (data instanceof Uint8Array) {
    // @ts-ignore
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function bindTexture(gl: WebGLRenderingContext, texture: WebGLTexture|null, unit: number) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer|null {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function bindAttribute(gl: WebGLRenderingContext, buffer: WebGLBuffer|null, attribute: GLuint, numComponents: GLint) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}

function bindFramebuffer(gl: WebGLRenderingContext, framebuffer: WebGLBuffer|null, texture?: WebGLTexture|null) {
  // 创建一个帧缓冲
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  if (texture) {
    // 绑定纹理到帧缓冲
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
}

export {
  createBuffer,
  createProgram,
  bindAttribute,
  bindFramebuffer,
  bindTexture,
  createTexture,
};
