uniform sampler2D tDiffuse;
uniform vec2 aspect;
uniform float strength;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;
varying vec2 vUv6;
varying vec2 vUv7;
void main() {
  vec2 dvu = vec2(4.0 / aspect.x, 0);
  vec4 color = texture2D(tDiffuse, vUv0)
             + texture2D(tDiffuse, vUv1)
             + texture2D(tDiffuse, vUv2)
             + texture2D(tDiffuse, vUv3)
             + texture2D(tDiffuse, vUv4)
             + texture2D(tDiffuse, vUv5)
             + texture2D(tDiffuse, vUv6)
             + texture2D(tDiffuse, vUv7)
             + texture2D(tDiffuse, vUv0 + dvu)
             + texture2D(tDiffuse, vUv1 + dvu)
             + texture2D(tDiffuse, vUv2 + dvu)
             + texture2D(tDiffuse, vUv3 + dvu)
             + texture2D(tDiffuse, vUv4 + dvu)
             + texture2D(tDiffuse, vUv5 + dvu)
             + texture2D(tDiffuse, vUv6 + dvu)
             + texture2D(tDiffuse, vUv7 + dvu);
  gl_FragColor = vec4(color.xyz * strength, 1);
}