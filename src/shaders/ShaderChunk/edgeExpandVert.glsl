uniform vec2 aspect;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;
varying vec2 vUv6;
varying vec2 vUv7;
void main() {
  vec2 stepUV = vec2(1.0 / aspect.x, 1.0 / aspect.y);
  vec2 stepUV3 = stepUV * 3.0;
  vUv0 = uv + vec2(-stepUV3.x, -stepUV3.y);
  vUv1 = uv + vec2(-stepUV3.x, -stepUV.y);
  vUv2 = uv + vec2(-stepUV3.x, stepUV.y);
  vUv3 = uv + vec2(-stepUV3.x, stepUV3.y);
  vUv4 = uv + vec2(-stepUV.x, -stepUV3.y);
  vUv5 = uv + vec2(-stepUV.x, -stepUV.y);
  vUv6 = uv + vec2(-stepUV.x, stepUV.y);
  vUv7 = uv + vec2(-stepUV.x, stepUV3.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}