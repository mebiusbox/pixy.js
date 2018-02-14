uniform float cScale;

float fbm2Rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float fbm2Noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n);
  vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(fbm2Rand(b), fbm2Rand(b + d.yx), f.x), mix(fbm2Rand(b + d.xy), fbm2Rand(b + d.yy), f.x), f.y);
}

float fbm2(vec2 n) {
  float total = 0.0;
  float amplitude = 1.0;
  for (int i=0; i<8; i++) {
    if (i >= cNoiseOctave) break;
    total += fbm2Noise(n) * amplitude;
    n += n * cNoiseFrequency;
    amplitude *= cNoiseAmplitude;
  }
  return total;
}