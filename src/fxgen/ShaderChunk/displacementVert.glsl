// attribute vec3 position;
// attribute vec3 normal;
// attribute vec3 uv;
varying float displacement;
uniform sampler2D tDisplacement;
void main() {
  displacement = texture2D(tDisplacement, uv).x;
  vec3 transformed = position + normal * displacement * 0.1;
//   vec3 transformed = position;
  vec4 hpos = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = hpos;
}