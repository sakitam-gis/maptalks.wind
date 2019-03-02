import * as maptalks from 'maptalks';
import { mat4 } from '@mapbox/gl-matrix';

const RADIAN = Math.PI / 180;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  const wrapper = {
    program,
  };
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const attribute = gl.getActiveAttrib(program, i);
    wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
  }
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniform = gl.getActiveUniform(program, i);
    wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }
  return wrapper;
}

function createTexture(gl, filter, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  if (data instanceof Uint8Array) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function bindTexture(gl, texture, unit) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}


// from https://github.com/maptalks/maptalks.biglayer/blob/master/src/Renderer.js
function enableVertexAttrib(gl, program, attributes) {
  if (Array.isArray(attributes[0])) {
    const verticesTexCoords = new Float32Array([0.0, 0.0, 0.0]);
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    let STRIDE = 0;
    for (let i = 0; i < attributes.length; i++) {
      STRIDE += (attributes[i][1] || 0);
    }

    let offset = 0;
    for (let i = 0; i < attributes.length; i++) {
      const attribute = gl.getAttribLocation(program, attributes[i][0]);
      if (attribute < 0) {
        throw new Error(`Failed to get the storage location of ${attributes[i][0]}`);
      }
      gl.vertexAttribPointer(attribute, attributes[i][1], gl[attributes[i][2] || 'FLOAT'], false, FSIZE * STRIDE, FSIZE * offset);
      offset += (attributes[i][1] || 0);
      gl.enableVertexAttribArray(attribute);
    }
  } else {
    const attribute = gl.getAttribLocation(program, attributes[0]);
    gl.vertexAttribPointer(attribute, attributes[1], gl[attributes[2] || 'FLOAT'], false, 0, 0);
    gl.enableVertexAttribArray(attribute);
  }
}

function bindAttribute(gl, buffer, attribute, numComponents) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}

function bindFramebuffer(gl, framebuffer, texture) {
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
  enableVertexAttrib,
}
