uniform sampler2D tDiffuse;
uniform sampler2D tEdge;
uniform vec3 edgeColor;
varying vec2 vUv;
void main() {
  vec4 diffuse = texture2D(tDiffuse, vUv);
  vec4 edge = texture2D(tEdge, vUv);
  vec4 color = mix(diffuse, vec4(edgeColor, 1.0), edge.x);
  gl_FragColor = vec4(color.xyz, 1.0);
}