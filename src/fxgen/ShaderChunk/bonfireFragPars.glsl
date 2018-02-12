uniform float cSpeed;
uniform float cIntensity;
uniform float cStrength;
uniform float cDensity;
uniform float cSize;
uniform float cColor;

float noiseStack(vec3 pos, int octaves, float falloff) {
  float noise = snoise(pos);
  float off = 1.0;
  if (octaves > 1) {
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(pos);
  }
  if (octaves > 2) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(pos);
  }
  if (octaves > 3) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(pos);
  }
  return (1.0+noise)/2.0;
}
vec2 noiseStackUV(vec3 pos, int octaves, float falloff, float diff) {
  float displaceA = noiseStack(pos, octaves, falloff);
  float displaceB = noiseStack(pos + vec3(3984.293,423.21,5235.19), octaves, falloff);
  return vec2(displaceA, displaceB);
}