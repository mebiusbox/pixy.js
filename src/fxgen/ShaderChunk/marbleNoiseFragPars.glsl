uniform float cScale;
uniform float cFrequency;

float combinedNoise(vec2 p) {
  float s = 0.5;
  float v = 0.0;
  for (int i=0; i<3; i++) {
    v += s*snoise(p/s);
    s *= 0.4;
  }
  return v;
}