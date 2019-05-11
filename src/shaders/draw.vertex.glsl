precision mediump float;

attribute float a_index;

uniform sampler2D u_particles;
uniform float u_particles_res;

uniform mat4 u_matrix;
uniform float u_dateline_offset;
//uniform vec4 u_bbox;

varying vec2 v_particle_pos;

const float PI = 3.14159265359;

vec2 transform(vec2 inp, mat4 matrix) {
  vec4 transformed = matrix * vec4(inp, 1, 1);
  return transformed.xy / transformed.w;
}

vec2 wgs84ToMercator(vec2 xy) {
  // convert to angle
  float y = -180.0 * xy.y + 90.0;
  // use the formule to convert
  y = (180.0 - (180.0 / PI * log(tan(PI / 4.0 + y * PI / 360.0)))) / 360.0;
  // pass x through, as it doesn't change
  return vec2(xy.x, y);
}

vec2 mercatorToWGS84(vec2 xy) {
  // convert lat into an angle
  float y = radians(180.0 - xy.y * 360.0);
  // use the formula to convert mercator -> WGS84
  y = 360.0 / PI  * atan(exp(y)) - 90.0;
  // normalize back into 0..1 interval
  y = y / -180.0 + 0.5;
  // pass lng through, as it doesn't change
  return vec2(xy.x, y);
}

void main() {
    vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));

    // decode current particle position from the pixel's RGBA value
    v_particle_pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a);
//    vec2 v_particle_pos_lonlat = transform(v_particle_pos, u_offset);
    vec2 world_coords_mercator = wgs84ToMercator(v_particle_pos);
//    vec2 world_coords_mercator = v_particle_pos;

    // convert to global geographic position
//    v_particle_pos = u_bbox.xy + pos * (u_bbox.zw - u_bbox.xy);

    // project the position with mercator projection
//    float s = sin(radians(v_particle_pos.y * 180.0 - 90.0));
//    float y = 1.0 - (degrees(log((1.0 + s) / (1.0 - s))) / 360.0 + 1.0) / 2.0;

    gl_PointSize = 1.0;
//    gl_Position = u_matrix * vec4(world_coords_mercator, 0, 1);
  gl_Position = u_matrix * vec4(v_particle_pos.xy + vec2(u_dateline_offset, 0), 0, 1);
}
