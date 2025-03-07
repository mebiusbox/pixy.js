uniform float exposure;
uniform float whitePoint;
uniform sampler2D tDiffuse;

#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

// exposure only
vec3 PixyLinearToneMapping(vec3 color) {
  return exposure * color;
}

// source: https://www.cs.utah.edu/~reinhard/cdrom/
vec3 PixyReinhardToneMapping(vec3 color) {
  color *= exposure;
  return saturate(color / (vec3(1.0) + color));
}

// source: http://filmicgames.com/archives/75
#define PixyUncharted2Helper(x) max(((x * (0.15 * x + 0.10 * 0.50) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02 / 0.30, vec3(0.0))
vec3 PixyUncharted2ToneMapping(vec3 color) {
// John Hable's filmic operator from Uncharted 2 video game
  color *= exposure;
  return saturate(PixyUncharted2Helper(color) / PixyUncharted2Helper(vec3(whitePoint)));
}

// source: http://filmicgames.com/archives/75
vec3 PixyOptimizedCineonToneMapping(vec3 color) {
// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
  color *= exposure;
  color = max(vec3(0.0), color - 0.004);
  return pow((color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06), vec3(2.2));
}

varying vec2 vUv;

void main() {

  vec4 colorRGBA = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(PixyUncharted2ToneMapping(colorRGBA.rgb), 1.0);
  
}
