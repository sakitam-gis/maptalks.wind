/*!
 * author: sakitam-fdd <smilefdd@gmail.com> 
 * maptalks.wind v0.0.1
 * build-time: 2019-6-28 18:2
 * LICENSE: MIT
 * (c) 2018-2019 
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

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var degree = Math.PI / 180;

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$1(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$3() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize$2 = normalize$1;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$1();
  var xUnitVec3 = fromValues(1, 0, 0);
  var yUnitVec3 = fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot$1 = dot(a, b);

    if (dot$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$1;
      return normalize$2(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$3();
  var temp2 = create$3();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
}();

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create$4() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$2 = function () {
  var vec = create$4();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

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
//# sourceMappingURL=utils.js.map

var drawVert = "precision mediump float;\n#define GLSLIFY 1\n\nattribute float a_index;\n\nuniform sampler2D u_particles;\nuniform float u_particles_res;\n\nuniform mat4 u_matrix;\nuniform float u_dateline_offset;\n\nvarying vec2 v_particle_pos;\n\nvoid main() {\n  vec4 color = texture2D(u_particles, vec2(\n  fract(a_index / u_particles_res),\n  floor(a_index / u_particles_res) / u_particles_res));\n\n  v_particle_pos = vec2(\n  color.r / 255.0 + color.b,\n  color.g / 255.0 + color.a);\n  gl_PointSize = 1.0;\n  gl_Position = u_matrix * vec4(v_particle_pos.xy + vec2(u_dateline_offset, 0), 0, 1);\n}\n"; // eslint-disable-line

var drawFrag = "precision mediump float;\n#define GLSLIFY 1\n\nuniform sampler2D u_wind;\nuniform vec2 u_wind_min;\nuniform vec2 u_wind_max;\nuniform sampler2D u_color_ramp;\n\nvarying vec2 v_particle_pos;\n\nvoid main() {\n  vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_particle_pos).rg);\n  float speed_t = length(velocity) / length(u_wind_max);\n\n  // color ramp is encoded in a 16x16 texture\n  vec2 ramp_pos = vec2(\n  fract(16.0 * speed_t),\n  floor(16.0 * speed_t) / 16.0);\n\n  gl_FragColor = texture2D(u_color_ramp, ramp_pos);\n}\n"; // eslint-disable-line

var quadVert = "precision mediump float;\n#define GLSLIFY 1\n\nattribute vec2 a_pos;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n  v_tex_pos = a_pos;\n  gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n}\n"; // eslint-disable-line

var screenFrag = "precision mediump float;\n#define GLSLIFY 1\n\nuniform sampler2D u_screen;\nuniform float u_opacity;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n  vec4 color = texture2D(u_screen, 1.0 - v_tex_pos);\n  // a hack to guarantee opacity fade out even with a value close to 1.0\n  gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);\n}\n"; // eslint-disable-line

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
        this.fadeOpacity = fadeOpacity || 0.996;
        this.speedFactor = speedFactor || 0.25;
        this.dropRate = dropRate || 0.003;
        this.dropRateBump = dropRateBump || 0.01;
        this.drawProgram = createProgram(gl, drawVert, drawFrag);
        this.screenProgram = createProgram(gl, quadVert, screenFrag);
        this.updateProgram = createProgram(gl, quadVert, updateFrag);
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
    WindGL.prototype.render = function (matrix, dateLineOffset) {
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
        this.drawScreen(matrix, dateLineOffset);
        this.updateParticles();
        if (blendingEnabled) {
            gl.enable(gl.BLEND);
        }
    };
    WindGL.prototype.drawScreen = function (matrix, dateLineOffset) {
        var gl = this.gl;
        var composite = this.options.composite;
        bindFramebuffer(gl, this.framebuffer, this.screenTexture);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        this.drawTexture(this.backgroundTexture, this.fadeOpacity);
        if (composite) {
            this.drawParticles(matrix, dateLineOffset);
        }
        bindFramebuffer(gl, null);
        gl.enable(gl.BLEND);
        this.drawParticles(matrix, dateLineOffset);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (!composite) {
            this.drawParticles(matrix, dateLineOffset);
        }
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
        gl.uniform1f(program.u_opacity, opacity);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    WindGL.prototype.drawParticles = function (matrix, dateLineOffset) {
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

var CONTEXT_TYPES = [
    'webgl2',
    'experimental-webgl',
    'webgl',
    'webkit-3d',
    'moz-webgl',
];
var createCanvas = function (width, height, scaleFactor, Canvas) {
    if (typeof document !== 'undefined') {
        var canvas = document.createElement('canvas');
        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        return canvas;
    }
    return new Canvas(width, height);
};
var createContext = function (canvas, glOptions) {
    if (glOptions === void 0) { glOptions = {}; }
    if (!canvas) {
        return null;
    }
    var ii = CONTEXT_TYPES.length;
    for (var i = 0; i < ii; ++i) {
        try {
            var context = canvas.getContext(CONTEXT_TYPES[i], glOptions);
            if (context) {
                return context;
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    return null;
};
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
    Renderer.prototype.draw = function () {
        this.prepareCanvas();
        this.prepareDrawContext();
        this._drawLayer();
    };
    Renderer.prototype.prepareDrawContext = function () {
        _super.prototype.prepareDrawContext.call(this);
    };
    Renderer.prototype._drawLayer = function () {
        var args = this._prepareDrawParams();
        if (!args) {
            return;
        }
        this.layer.draw.apply(this.layer, args);
        this.completeRender();
    };
    Renderer.prototype._prepareDrawParams = function () {
        if (!this.getMap()) {
            return null;
        }
        var view = this.getViewExtent();
        if (view['maskExtent'] && !view['extent'].intersects(view['maskExtent'])) {
            this.completeRender();
            return null;
        }
        var args = [this.gl, view];
        var params = this.getDrawParams();
        args.push.apply(args, params ? (Array.isArray(params) ? params : [params]) : []);
        args.push.apply(args, this._drawContext);
        return args;
    };
    Renderer.prototype.needToRedraw = function () {
        if (this.layer.options['animation']) {
            return true;
        }
        return _super.prototype.needToRedraw.call(this);
    };
    Renderer.prototype.onCanvasCreate = function () {
        if (this.canvas && this.layer.options.doubleBuffer) {
            var map = this.getMap();
            var retina = map.getDevicePixelRatio();
            this.buffer = createCanvas(this.canvas.width, this.canvas.height, retina, this.getMap().CanvasClass);
            this.context = this.buffer.getContext('2d');
        }
    };
    Renderer.prototype.createCanvas = function () {
        if (!this.canvas) {
            var map = this.getMap();
            var size = map.getSize();
            var retina = map.getDevicePixelRatio();
            var _a = [retina * size.width, retina * size.height], width = _a[0], height = _a[1];
            this.canvas = createCanvas(width, height, retina, map.CanvasClass);
            this.gl = createContext(this.canvas, this.layer.options.glOptions);
            this.onCanvasCreate();
            this.layer.onCanvasCreate(this.context, this.gl);
            this.layer.fire('canvascreate', { context: this.context, gl: this.gl });
        }
    };
    Renderer.prototype.resizeCanvas = function (canvasSize) {
        if (this.canvas && this.gl) {
            var map = this.getMap();
            var retina = map.getDevicePixelRatio();
            var size = canvasSize || map.getSize();
            this.canvas.height = retina * size.height;
            this.canvas.width = retina * size.width;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    };
    Renderer.prototype.clearCanvas = function () {
        if (this.canvas && this.gl) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            if (this.context) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    };
    Renderer.prototype.prepareCanvas = function () {
        if (!this.canvas) {
            this.createCanvas();
        }
        else {
            this.clearCanvas();
        }
        var mask = _super.prototype.prepareCanvas.call(this);
        this.layer.fire('renderstart', { context: this.context, gl: this.gl });
        return mask;
    };
    Renderer.prototype.renderScene = function () {
        this.completeRender();
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
    Renderer.prototype.remove = function () {
        delete this._drawContext;
        _super.prototype.remove.call(this);
    };
    Renderer.prototype.getMap = function () {
        return _super.prototype.getMap.call(this);
    };
    return Renderer;
}(maptalks.renderer.CanvasLayerRenderer));
//# sourceMappingURL=renderer.js.map

var _options = {
    renderer: 'webgl',
    doubleBuffer: true,
    animation: true,
    glOptions: {},
};
function wrap(n, min, max) {
    var d = max - min;
    var w = ((n - min) % d + d) % d + min;
    return (w === min) ? max : w;
}
function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}
function mercatorXfromLng(lng) {
    return (180 + lng) / 360;
}
function mercatorYfromLat(lat) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}
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
    WindLayer.prototype.draw = function (ctx) {
        var map = this.getMap();
        if (!map)
            return;
        var mercatorMatrix = this.calcMatrices(map);
        if (!this.wind) {
            if (!ctx)
                return;
            var _a = this.options, fadeOpacity = _a.fadeOpacity, speedFactor = _a.speedFactor, dropRate = _a.dropRate, dropRateBump = _a.dropRateBump, colorRamp = _a.colorRamp, numParticles = _a.numParticles, composite = _a.composite;
            var container = document.getElementById('wind');
            container.width = container.clientWidth;
            container.height = container.clientHeight;
            var context = createContext(container);
            this.wind = new WindGL(context, {
                fadeOpacity: fadeOpacity,
                speedFactor: speedFactor,
                dropRate: dropRate,
                dropRateBump: dropRateBump,
                colorRamp: colorRamp,
                numParticles: numParticles,
                composite: composite,
            });
        }
        if (this.wind) {
            var fullExtent = map.getFullExtent();
            var extent = map.getProjExtent();
            var fullMin = Math.min(fullExtent.xmax, fullExtent.xmin);
            var min = Math.min(extent.xmax, extent.xmin);
            var fullMax = Math.max(fullExtent.xmax, fullExtent.xmin);
            var max = Math.max(extent.xmax, extent.xmin);
            var total = fullMax - fullMin;
            var eastIter = Math.max(0, Math.ceil((max - fullMax) / total));
            var westIter = Math.max(0, Math.ceil((min - fullMin) / -total));
            this.wind.render(mercatorMatrix, 0);
            for (var i = 1; i <= eastIter; i++) {
                this.wind.render(mercatorMatrix, i);
            }
            for (var i = 1; i <= westIter; i++) {
                this.wind.render(mercatorMatrix, -i);
            }
        }
        this.completeRender();
    };
    WindLayer.prototype.drawOnInteracting = function (ctx) {
        this.draw(ctx);
    };
    WindLayer.prototype.project = function (lnglat, worldSize) {
        var lat = clamp(lnglat.y, -90, 90);
        return new maptalks.Point(mercatorXfromLng(lnglat.x) * worldSize, mercatorYfromLat(lat) * worldSize);
    };
    WindLayer.prototype.calcMatrices = function (map) {
        var size = map.getSize();
        var zoom = map.getZoom();
        var p = map.getPitch();
        var bearing = map.getBearing();
        var fov = map.getFov() * Math.PI / 180;
        var width = size.width, height = size.height;
        var pitch = clamp(p, 0, 85) / 180 * Math.PI;
        var angle = -wrap(bearing, -180, 180) * Math.PI / 180;
        var scale$1 = Math.pow(2, zoom - 1);
        var worldSize = 512 * scale$1;
        var cameraToCenterDistance = 0.5 / Math.tan(fov / 2) * height;
        var halfFov = fov / 2;
        var groundAngle = Math.PI / 2 + pitch;
        var topHalfSurfaceDistance = Math.sin(halfFov) *
            cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);
        var center = this.project(map.getCenter(), worldSize);
        var x = center.x;
        var y = center.y;
        var furthestDistance = Math.cos(Math.PI / 2 - pitch) * topHalfSurfaceDistance + cameraToCenterDistance;
        var farZ = furthestDistance * 1.01;
        var m = new Float64Array(16);
        perspective(m, fov, width / height, 1, farZ);
        scale(m, m, [1, -1, 1]);
        translate(m, m, [0, 0, -cameraToCenterDistance]);
        rotateX(m, m, pitch);
        rotateZ(m, m, angle);
        translate(m, m, [-x, -y, 0]);
        return scale([], m, [worldSize, worldSize, worldSize]);
    };
    WindLayer.prototype.onResize = function () {
        if (this.wind) {
            this.wind.resize();
        }
        _super.prototype.onResize.call(this);
    };
    WindLayer.prototype.remove = function () {
        _super.prototype.remove.call(this);
    };
    return WindLayer;
}(maptalks.CanvasLayer));
WindLayer.registerRenderer('webgl', Renderer);

exports.WindLayer = WindLayer;
exports.clamp = clamp;
exports.mercatorXfromLng = mercatorXfromLng;
exports.mercatorYfromLat = mercatorYfromLat;
exports.wrap = wrap;
//# sourceMappingURL=maptalks.wind.common.js.map
