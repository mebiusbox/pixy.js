uniform sampler2D tDiffuse;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
void main() {
  float t0 = texture2D(tDiffuse, vUv0).x;
  float t1 = texture2D(tDiffuse, vUv1).x;
  float t2 = texture2D(tDiffuse, vUv2).x;
  float t3 = texture2D(tDiffuse, vUv3).x;
  float t0t1 = t0 - t1;
  float t2t3 = t2 - t3;
  float id0 = t0t1 * t0t1;
  float id1 = t2t3 * t2t3;
  gl_FragColor = vec4(vec3((id0 + id1) * 64.0), 1.0);
}