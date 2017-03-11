#include <packing>
uniform sampler2D tDiffuse;
uniform int type;
uniform float cameraNear;
uniform float cameraFar;
varying vec2 vUv;

float readDepth(sampler2D depthSampler, vec2 coord) {
  float fragCoordZ = texture2D(depthSampler, coord).x;
  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

void main() {
  vec4 diffuse = texture2D(tDiffuse, vUv);
  if (type == 0) {
    gl_FragColor = vec4(diffuse.xyz, 1.0);
  } else if (type == 1) {
    gl_FragColor = vec4(diffuse.www, 1.0);
  } else if (type == 2) {
    gl_FragColor = vec4(diffuse.xxx, 1.0);
  } else if (type == 3) {
    gl_FragColor = vec4(diffuse.yyy, 1.0);
  } else if (type == 4) {
    gl_FragColor = vec4(diffuse.zzz, 1.0);
  } else if (type == 5) {
    gl_FragColor = vec4(diffuse.xyz*2.0-1.0, 1.0);
  } else if (type == 6) {
    float depth = unpackRGBAToDepth(diffuse);
    gl_FragColor = vec4(depth, depth, depth, 1.0);
  } else if (type == 7) {
    float depth = readDepth(tDiffuse, vUv);
    gl_FragColor = vec4(depth, depth, depth, 1.0);
  } else {
    gl_FragColor = diffuse;
  }
}