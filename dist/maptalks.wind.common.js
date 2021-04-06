/*!
 * author: sakitam-fdd <smilefdd@gmail.com> 
 * maptalks.wind v0.0.1
 * build-time: 2021-4-6 20:9
 * LICENSE: MIT
 * (c) 2018-2021 
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var maptalks = require('maptalks');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type) || {};
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || '');
    }
    return shader;
}
function createProgram(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram() || '';
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || '');
    }
    var wrapper = {
        program: program,
    };
    var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < numAttributes; i++) {
        var attribute = gl.getActiveAttrib(program, i);
        wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
    }
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < numUniforms; i++) {
        var uniform = gl.getActiveUniform(program, i);
        wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
    }
    return wrapper;
}
function createTexture(gl, filter, data, width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    else {
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
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
function bindAttribute(gl, buffer, attribute, numComponents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}
function bindFramebuffer(gl, framebuffer, texture) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (texture) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
}
function getGlContext(canvas, glOptions) {
    if (glOptions === void 0) { glOptions = {}; }
    var names = ['webgl', 'experimental-webgl'];
    var context = null;
    function onContextCreationError(error) {
        console.error(error.statusMessage);
    }
    canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], glOptions);
        }
        catch (e) { }
        if (context) {
            break;
        }
    }
    canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
    if (!context || !context.getExtension('OES_texture_float')) {
        return null;
    }
    return context;
}
//# sourceMappingURL=utils.js.map

var drawVert = "#define GLSLIFY 1\nattribute float a_index;\n\nuniform sampler2D u_particles;\nuniform float u_particles_res;\nuniform float transformScale;\nuniform vec2 projectionExtent;\nuniform vec4 transformMatrix;\n\nuniform mat4 u_matrix;\nuniform float u_dateline_offset;\n\nvarying vec2 v_particle_pos;\n\nvoid main() {\n  vec4 color = texture2D(\n    u_particles,\n    vec2(\n      fract(a_index / u_particles_res),\n      floor(a_index / u_particles_res) / u_particles_res\n    )\n  );\n\n  // 0 - 1\n  v_particle_pos = vec2(\n    color.r / 255.0 + color.b,\n    color.g / 255.0 + color.a\n  );\n\n  vec2 clipSpace = v_particle_pos * 2.0 - vec2(1.0);\n  vec2 inner_pos = clipSpace * projectionExtent;\n\n  vec2 pos = vec2(transformMatrix.x * (inner_pos.x - transformMatrix.z) / transformScale, transformMatrix.y * (inner_pos.y - transformMatrix.w) / transformScale);\n\n  gl_PointSize = 1.0;\n  gl_Position = u_matrix * vec4(pos.xy + vec2(u_dateline_offset, 0), 0, 1);\n}\n"; // eslint-disable-line

var drawFrag = "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D u_wind;\nuniform vec2 u_wind_min;\nuniform vec2 u_wind_max;\nuniform sampler2D u_color_ramp;\n\nvarying vec2 v_particle_pos;\n\nconst float PI = 3.14159265359;\n\n/**\n * Converts mapbox style pseudo-mercator coordinates (this is just like mercator, but the unit isn't a meter, but 0..1\n * spans the entire world) into texture like WGS84 coordinates (this is just like WGS84, but instead of angles, it uses\n * intervals of 0..1).\n */\nvec2 mercatorToWGS84(vec2 xy) {\n    // convert lat into an angle\n    float y = radians(180.0 - xy.y * 360.0);\n    // use the formula to convert mercator -> WGS84\n    y = 360.0 / PI  * atan(exp(y)) - 90.0;\n    // normalize back into 0..1 interval\n    y = y / -180.0 + 0.5;\n    // pass lng through, as it doesn't change\n    return vec2(xy.x, y);\n}\n\nvoid main() {\n  vec2 globalWGS84 = mercatorToWGS84(v_particle_pos);\n  vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, globalWGS84).rg);\n  float speed_t = length(velocity) / length(u_wind_max);\n\n  // color ramp is encoded in a 16x16 texture\n  vec2 ramp_pos = vec2(\n  fract(16.0 * speed_t),\n  floor(16.0 * speed_t) / 16.0);\n\n  gl_FragColor = texture2D(u_color_ramp, ramp_pos);\n}\n"; // eslint-disable-line

var screenVert = "#define GLSLIFY 1\nattribute vec2 a_pos;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n  v_tex_pos = a_pos;\n  gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n}\n"; // eslint-disable-line

var screenFrag = "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D u_screen;\n\nuniform float u_opacity;\nuniform float u_opacity_border;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n  vec2 point = 1.0 - v_tex_pos;\n  vec4 color = texture2D(u_screen, point);\n\n  if (point.x < u_opacity_border || point.x > 1. - u_opacity_border || point.y < u_opacity_border || point.y > 1. - u_opacity_border) {\n    gl_FragColor = vec4(0.);\n  } else {\n    // opacity fade out even with a value close to 0.0\n    // a hack to guarantee opacity fade out even with a value close to 1.0\n    gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);\n  }\n}\n"; // eslint-disable-line

var updateVert = "#define GLSLIFY 1\nattribute vec2 a_pos;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n  v_tex_pos = a_pos;\n  gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n}\n"; // eslint-disable-line

var updateFrag = "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D u_particles;\nuniform sampler2D u_wind;\nuniform vec2 u_wind_res;\nuniform vec2 u_wind_min;\nuniform vec2 u_wind_max;\nuniform float u_rand_seed;\nuniform float u_speed_factor;\nuniform float u_drop_rate;\nuniform float u_drop_rate_bump;\n//uniform vec4 u_bbox;\n\nvarying vec2 v_tex_pos;\n\n// pseudo-random generator\nconst vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);\nfloat rand(const vec2 co) {\n  float t = dot(rand_constants.xy, co);\n  return fract(sin(t) * (rand_constants.z + t));\n}\n\n// wind speed lookup; use manual bilinear filtering based on 4 adjacent pixels for smooth interpolation\nvec2 lookup_wind(const vec2 uv) {\n  // return texture2D(u_wind, uv).rg; // lower-res hardware filtering\n  vec2 px = 1.0 / u_wind_res;\n  vec2 vc = (floor(uv * u_wind_res)) * px;\n  vec2 f = fract(uv * u_wind_res);\n  vec2 tl = texture2D(u_wind, vc).rg;\n  vec2 tr = texture2D(u_wind, vc + vec2(px.x, 0)).rg;\n  vec2 bl = texture2D(u_wind, vc + vec2(0, px.y)).rg;\n  vec2 br = texture2D(u_wind, vc + px).rg;\n  return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);\n}\n\nvoid main() {\n  vec4 color = texture2D(u_particles, v_tex_pos);\n  vec2 pos = vec2(\n  color.r / 255.0 + color.b,\n  color.g / 255.0 + color.a); // decode particle position from pixel RGBA\n\n  // convert to global geographic position\n  //    vec2 global_pos = u_bbox.xy + pos * (u_bbox.zw - u_bbox.xy);\n\n  vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));\n  float speed_t = length(velocity) / length(u_wind_max);\n\n  // take EPSG:4236 distortion into account for calculating where the particle moved\n  //    float distortion = cos(radians(global_pos.y * 180.0 - 90.0));\n  //    vec2 offset = vec2(velocity.x / distortion, -velocity.y) * 0.0001 * u_speed_factor;\n  vec2 offset = vec2(velocity.x, -velocity.y) * 0.0001 * u_speed_factor;\n  // update particle position, wrapping around the boundaries\n  pos = fract(1.0 + pos + offset);\n\n  // a random seed to use for the particle drop\n  vec2 seed = (pos + v_tex_pos) * u_rand_seed;\n\n  // drop rate is a chance a particle will restart at random position, to avoid degeneration\n  float drop_rate = u_drop_rate + speed_t * u_drop_rate_bump;\n  float drop = step(1.0 - drop_rate, rand(seed));\n\n  //    float retain = step(drop_rate, rand(seed));\n\n  vec2 random_pos = vec2(rand(seed + 1.3), rand(seed + 2.1));\n  //    pos = mix(pos, random_pos, 1.0 - retain);\n  pos = mix(pos, random_pos, drop);\n  // encode the new particle position back into RGBA\n  gl_FragColor = vec4(\n  fract(pos * 255.0),\n  floor(pos * 255.0) / 255.0);\n}\n"; // eslint-disable-line

function getColorRamp(colors) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 1;
    var gradient = ctx.createLinearGradient(0, 0, 256, 0);
    Object.keys(colors).forEach(function (stop) {
        gradient.addColorStop(+stop, colors[stop]);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
    return new Uint8Array(ctx.getImageData(0, 0, 256, 1).data);
}
var defaultRampColors = {
    0.0: '#3288bd',
    0.1: '#66c2a5',
    0.2: '#abdda4',
    0.3: '#e6f598',
    0.4: '#fee08b',
    0.5: '#fdae61',
    0.6: '#f46d43',
    1.0: '#d53e4f',
};
var WindGL = (function () {
    function WindGL(gl, options) {
        var fadeOpacity = options.fadeOpacity, speedFactor = options.speedFactor, dropRate = options.dropRate, dropRateBump = options.dropRateBump, colorRamp = options.colorRamp, numParticles = options.numParticles;
        this.options = options;
        this.gl = gl;
        this.fadeOpacity = fadeOpacity || 0.895;
        this.speedFactor = speedFactor || 0.25;
        this.dropRate = dropRate || 0.003;
        this.dropRateBump = dropRateBump || 0.01;
        this.drawProgram = createProgram(gl, drawVert, drawFrag);
        this.screenProgram = createProgram(gl, screenVert, screenFrag);
        this.updateProgram = createProgram(gl, updateVert, updateFrag);
        this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
        this.framebuffer = gl.createFramebuffer();
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
    Object.defineProperty(WindGL.prototype, "numParticles", {
        get: function () {
            return this._numParticles;
        },
        set: function (numParticles) {
            var gl = this.gl;
            var particleRes = Math.ceil(Math.sqrt(numParticles));
            this.particleStateResolution = particleRes;
            this._numParticles = particleRes * particleRes;
            var particleState = new Uint8Array(this._numParticles * 4);
            for (var i = 0; i < particleState.length; i++) {
                particleState[i] = Math.floor(Math.random() * 256);
            }
            this.particleStateTexture0 = createTexture(gl, gl.NEAREST, particleState, particleRes, particleRes);
            this.particleStateTexture1 = createTexture(gl, gl.NEAREST, particleState, particleRes, particleRes);
            var particleIndices = new Float32Array(this._numParticles);
            for (var i = 0; i < this._numParticles; i++) {
                particleIndices[i] = i;
            }
            this.particleIndexBuffer = createBuffer(gl, particleIndices);
        },
        enumerable: true,
        configurable: true
    });
    WindGL.prototype.setOptions = function (options) {
        var fadeOpacity = options.fadeOpacity, speedFactor = options.speedFactor, dropRate = options.dropRate, dropRateBump = options.dropRateBump, colorRamp = options.colorRamp, numParticles = options.numParticles;
        this.fadeOpacity = fadeOpacity || 0.996;
        this.speedFactor = speedFactor || 0.25;
        this.dropRate = dropRate || 0.003;
        this.dropRateBump = dropRateBump || 0.01;
        this.setColorRamp(colorRamp || defaultRampColors);
        this.numParticles = numParticles || 65536;
    };
    WindGL.prototype.resize = function () {
        var gl = this.gl;
        var emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
        this.backgroundTexture = createTexture(gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height);
        this.screenTexture = createTexture(gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height);
    };
    WindGL.prototype.setColorRamp = function (colors) {
        this.colorRampTexture = createTexture(this.gl, this.gl.LINEAR, getColorRamp(colors), 16, 16);
    };
    WindGL.prototype.setWind = function (data, image) {
        this.windData = data;
        this.windTexture = createTexture(this.gl, this.gl.LINEAR, image);
    };
    WindGL.prototype.render = function (matrix, dateLineOffset, params) {
        var gl = this.gl;
        var windData = this.windData;
        if (!gl || !windData) {
            return;
        }
        this.matrix = matrix;
        var blendingEnabled = gl.isEnabled(gl.BLEND);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        bindTexture(gl, this.windTexture, 0);
        bindTexture(gl, this.particleStateTexture0, 1);
        this.drawScreen(matrix, dateLineOffset, params);
        this.updateParticles();
        if (blendingEnabled) {
            gl.enable(gl.BLEND);
        }
    };
    WindGL.prototype.drawScreen = function (matrix, dateLineOffset, params) {
        var gl = this.gl;
        bindFramebuffer(gl, this.framebuffer, this.screenTexture);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        this.drawTexture(this.backgroundTexture, this.fadeOpacity);
        this.drawParticles(matrix, dateLineOffset, params);
        bindFramebuffer(gl, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.drawTexture(this.screenTexture, 1.0);
        gl.disable(gl.BLEND);
        var temp = this.backgroundTexture;
        this.backgroundTexture = this.screenTexture;
        this.screenTexture = temp;
    };
    WindGL.prototype.drawTexture = function (texture, opacity) {
        var gl = this.gl;
        var program = this.screenProgram;
        gl.useProgram(program.program);
        bindAttribute(gl, this.quadBuffer, program.a_pos, 2);
        bindTexture(gl, texture, 2);
        gl.uniform1i(program.u_screen, 2);
        gl.uniform1f(program.u_opacity_border, 0.0);
        gl.uniform1f(program.u_opacity, opacity);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    WindGL.prototype.drawParticles = function (matrix, dateLineOffset, params) {
        var gl = this.gl;
        var program = this.drawProgram;
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
        gl.uniform1f(program.transformScale, params.transformScale);
        gl.uniform2fv(program.projectionExtent, [params.projectionExtent[2], params.projectionExtent[3]]);
        gl.uniform4fv(program.transformMatrix, params.transformMatrix);
        gl.uniformMatrix4fv(program.u_matrix, false, matrix);
        gl.drawArrays(gl.POINTS, 0, this._numParticles);
    };
    WindGL.prototype.updateParticles = function () {
        var gl = this.gl;
        bindFramebuffer(gl, this.framebuffer, this.particleStateTexture1);
        gl.viewport(0, 0, this.particleStateResolution, this.particleStateResolution);
        var program = this.updateProgram;
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
        var temp = this.particleStateTexture0;
        this.particleStateTexture0 = this.particleStateTexture1;
        this.particleStateTexture1 = temp;
    };
    return WindGL;
}());
//# sourceMappingURL=index.js.map

var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.checkResources = function () {
        return [];
    };
    Renderer.prototype.getDrawParams = function () {
        return [];
    };
    Renderer.prototype.hitDetect = function () {
        return false;
    };
    Renderer.prototype.draw = function () {
        this.prepareCanvas();
        this.prepareDrawContext();
        var layer = this.layer;
        if (layer && layer.draw && this.gl) {
            layer.draw(this.gl);
        }
        this.completeRender();
    };
    Renderer.prototype._redraw = function () {
        this.prepareRender();
        this.draw();
    };
    Renderer.prototype.clearCanvas = function () {
        if (this.gl) ;
    };
    Renderer.prototype.createContext = function () {
        if (this.gl && this.gl.canvas === this.canvas) {
            return;
        }
        this.gl = getGlContext(this.canvas, this.layer.options.glOptions);
    };
    Renderer.prototype.resizeCanvas = function (canvasSize) {
        if (this.canvas && this.gl) {
            var map = this.getMap();
            var retina = map.getDevicePixelRatio();
            var size = canvasSize || map.getSize();
            this.canvas.height = retina * size.height;
            this.canvas.width = retina * size.width;
            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    };
    Renderer.prototype.drawOnInteracting = function () {
        this.draw();
    };
    Renderer.prototype.onZoomStart = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onZoomStart.apply(this, args);
    };
    Renderer.prototype.onZoomEnd = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onZoomEnd.apply(this, args);
    };
    Renderer.prototype.onDragRotateStart = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onDragRotateStart.apply(this, args);
    };
    Renderer.prototype.onDragRotateEnd = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onDragRotateEnd.apply(this, args);
    };
    Renderer.prototype.onMoveStart = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onMoveStart.apply(this, args);
    };
    Renderer.prototype.onMoveEnd = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.onMoveEnd.apply(this, args);
    };
    Renderer.prototype.remove = function () {
        delete this._drawContext;
        _super.prototype.remove.call(this);
    };
    Renderer.prototype.getMap = function () {
        return _super.prototype.getMap.call(this);
    };
    Renderer.prototype.completeRender = function () {
        return _super.prototype.completeRender.call(this);
    };
    Renderer.prototype.prepareCanvas = function () {
        return _super.prototype.prepareCanvas.call(this);
    };
    Renderer.prototype.prepareDrawContext = function () {
        _super.prototype.prepareDrawContext.call(this);
    };
    Renderer.prototype.prepareRender = function () {
        return _super.prototype.prepareRender.call(this);
    };
    return Renderer;
}(maptalks.renderer.CanvasLayerRenderer));

var _options = {
    renderer: 'gl',
    doubleBuffer: false,
    animation: true,
    wrapX: true,
    glOptions: {
        antialias: false,
        depth: false,
        stencil: false,
        alpha: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
    },
};
var WindLayer = (function (_super) {
    __extends(WindLayer, _super);
    function WindLayer(id, datas, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, id, Object.assign(_options, options)) || this;
        _this.datas = datas;
        _this.wind = null;
        return _this;
    }
    WindLayer.prototype.setOptions = function (options) {
        if (options === void 0) { options = {}; }
        this.options = Object.assign(this.options, options);
        if (this.wind) {
            this.wind.setOptions(this.options);
        }
    };
    WindLayer.prototype.getWindData = function () {
        return this.datas;
    };
    WindLayer.prototype.setWindData = function (datas) {
        this.datas = datas;
        if (this.wind) {
            this.wind.setWind(this.datas.data, this.datas.image);
        }
    };
    WindLayer.prototype.prepareToDraw = function () {
        return [];
    };
    WindLayer.prototype.draw = function (gl) {
        var map = this.getMap();
        if (!map)
            return;
        if (!this.wind) {
            var _a = this.options, fadeOpacity = _a.fadeOpacity, speedFactor = _a.speedFactor, dropRate = _a.dropRate, dropRateBump = _a.dropRateBump, colorRamp = _a.colorRamp, numParticles = _a.numParticles;
            this.wind = new WindGL(gl, {
                fadeOpacity: fadeOpacity,
                speedFactor: speedFactor,
                dropRate: dropRate,
                dropRateBump: dropRateBump,
                colorRamp: colorRamp,
                numParticles: numParticles,
            });
        }
        if (this.wind) {
            var scale = map.getResolution(map.getGLZoom());
            var proj = map.getSpatialReference().getTransformation();
            var projObject = map.getProjection().fullExtent;
            var projectionExtent = [
                projObject.left,
                projObject.bottom,
                projObject.right,
                projObject.top,
            ];
            var worlds = this.getWrappedWorlds();
            for (var i = 0; i < worlds.length; i++) {
                this.wind.render(map.projViewMatrix, worlds[i], {
                    transformMatrix: proj.matrix,
                    transformScale: scale,
                    projectionExtent: projectionExtent,
                });
            }
        }
    };
    WindLayer.prototype.getWrappedWorlds = function () {
        var map = this.getMap();
        var projObject = map.getProjection().fullExtent;
        var projectionExtent = [
            projObject.left,
            projObject.bottom,
            projObject.right,
            projObject.top,
        ];
        var projExtent = map.getProjExtent();
        var extent = [
            projExtent.xmin,
            projExtent.ymin,
            projExtent.xmax,
            projExtent.ymax,
        ];
        var startX = extent[0];
        var worldWidth = projectionExtent[2] - projectionExtent[0];
        var projWorldWidth = Math.abs(map.coordToPoint(map
            .getProjection()
            .unprojectCoords(new maptalks.Coordinate([projectionExtent[0], projectionExtent[1]])), map.getGLZoom()).x -
            map.coordToPoint(map
                .getProjection()
                .unprojectCoords(new maptalks.Coordinate([projectionExtent[2], projectionExtent[3]])), map.getGLZoom()).x);
        var world = 0;
        var result = [];
        if (this.options.wrapX) {
            while (startX < projectionExtent[0]) {
                --world;
                result.push(world * projWorldWidth);
                startX += worldWidth;
            }
            world = 0;
            startX = extent[2];
            while (startX > projectionExtent[2]) {
                ++world;
                result.push(world * projWorldWidth);
                startX -= worldWidth;
            }
        }
        result.push(0);
        return result;
    };
    WindLayer.prototype.onResize = function () {
        _super.prototype.onResize.call(this);
    };
    WindLayer.prototype.remove = function () {
        _super.prototype.remove.call(this);
    };
    WindLayer.prototype.getValue = function (coordinates) {
        if (this.wind && this.wind.framebuffer) {
            var data = this.datas.data;
            var t = coordinates.x % 180;
            var pixelX = ((t + 180) / 360) * data.width;
            if (coordinates.y < -90 || coordinates.y > 90) {
                throw new Error('Invalid y for coordinate');
            }
            var pixelY = ((90 - coordinates.y) / 180) * data.height;
            var gl = this.wind.gl;
            gl.pixelStorei(gl.PACK_ALIGNMENT || 0x0D05, 4);
            var pixels = new Uint8Array(4);
            gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            return pixels;
        }
        return null;
    };
    return WindLayer;
}(maptalks.CanvasLayer));
WindLayer.registerRenderer('gl', Renderer);
//# sourceMappingURL=index.js.map

exports.WindLayer = WindLayer;
//# sourceMappingURL=maptalks.wind.common.js.map
