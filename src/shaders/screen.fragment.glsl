precision highp float;

uniform sampler2D u_screen;

uniform float u_opacity;
uniform float u_opacity_border;

varying vec2 v_tex_pos;

void main() {
  vec2 point = 1.0 - v_tex_pos;
  vec4 color = texture2D(u_screen, point);

  if (point.x < u_opacity_border || point.x > 1. - u_opacity_border || point.y < u_opacity_border || point.y > 1. - u_opacity_border) {
    gl_FragColor = vec4(0.);
  } else {
    // opacity fade out even with a value close to 0.0
    // a hack to guarantee opacity fade out even with a value close to 1.0
    gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);
  }
}
