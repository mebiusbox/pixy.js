// fractal brownian motion (noise harmonic)
// float fbm4(vec2 uv) {
//   float n = 0.5;
//   float f = 1.0;
//   float l = 0.2;
//   for (int i=0; i<4; i++) {
//     n += snoise(vec3(uv*f, 1.0))*l;
//     f *= 2.0;
//     l *= 0.65;
//   }
//   return n;
// }

// fractal brownian motion (noise harmonic - fewer octaves = smoother)
// float fbm8(vec2 uv) {
//   float n = 0.5;
//   float f = 4.0;
//   float l = 0.2;
//   for (int i=0; i<8; i++) {
//     n += snoise(vec3(uv*f, 1.0))*l;
//     f *= 2.0;
//     l *= 0.65;
//   }
//   return n;
// }
float fbm(vec2 uv) {
  float n = 0.5;
  float f = 1.0;
  float l = 0.2;
  for (int i=0; i<8; i++) {
    if (i >= cNoiseOctave) break;
    n += snoise(vec3(uv*f, time))*l;
//     f *= 2.0;
//     l *= 0.65;
    f *= cNoiseFrequency * 8.0;
    l *= cNoiseAmplitude;
  }
  return n;
}