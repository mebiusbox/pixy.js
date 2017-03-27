uniform sampler2D tDiffuse;
uniform sampler2D tAO;
varying vec2 vUv;

void main() {
  vec4 colorRGBA = texture2D(tDiffuse, vUv);
  vec4 aoRGBA = texture2D(tAO, vUv);
  colorRGBA.rgb *= pow(aoRGBA.r, 2.0);
  gl_FragColor = vec4(colorRGBA.rgb, 1.0);
  // gl_FragColor = vec4(vec3(aoRGBA.r), 1.0);
}