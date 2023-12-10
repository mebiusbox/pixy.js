uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
}