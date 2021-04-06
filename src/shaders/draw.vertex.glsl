attribute float a_index;

uniform sampler2D u_particles;
uniform float u_particles_res;
uniform float transformScale;
uniform vec2 projectionExtent;
uniform vec4 transformMatrix;

uniform mat4 u_matrix;
uniform float u_dateline_offset;

varying vec2 v_particle_pos;

void main() {
  vec4 color = texture2D(
    u_particles,
    vec2(
      fract(a_index / u_particles_res),
      floor(a_index / u_particles_res) / u_particles_res
    )
  );

  // 0 - 1
  v_particle_pos = vec2(
    color.r / 255.0 + color.b,
    color.g / 255.0 + color.a
  );

  vec2 clipSpace = v_particle_pos * 2.0 - vec2(1.0);
  vec2 inner_pos = clipSpace * projectionExtent;

  vec2 pos = vec2(transformMatrix.x * (inner_pos.x - transformMatrix.z) / transformScale, transformMatrix.y * (inner_pos.y - transformMatrix.w) / transformScale);

  gl_PointSize = 1.0;
  gl_Position = u_matrix * vec4(pos.xy + vec2(u_dateline_offset, 0), 0, 1);
}
