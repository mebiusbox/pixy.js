uniform vec2 aspect;
uniform float step;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
void main() {
  vec2 stepUV = vec2(step / aspect.x, step / aspect.y);
  vUv0 = uv + vec2(-stepUV.x, -stepUV.y);
  vUv1 = uv + vec2( stepUV.x,  stepUV.y);
  vUv2 = uv + vec2(-stepUV.x,  stepUV.y);
  vUv3 = uv + vec2( stepUV.x, -stepUV.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}