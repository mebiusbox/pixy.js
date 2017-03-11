uniform sampler2D tDiffuse;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
void main() {
  float d0 = texture2D(tDiffuse, vUv0).x - texture2D(tDiffuse, vUv1).x;
  float d1 = texture2D(tDiffuse, vUv2).x - texture2D(tDiffuse, vUv3).x;
  gl_FragColor = vec4(vec3(d0*d0 + d1*d1), 1);
}