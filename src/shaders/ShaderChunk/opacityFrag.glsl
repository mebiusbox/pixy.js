uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  float a = texture2D(tDiffuse, vUv).a;
  gl_FragColor = vec4(a, a, a, 1.0);
}