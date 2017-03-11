uniform sampler2D tDiffuse;
uniform float opacity;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tDiffuse, vUv) * opacity;
}