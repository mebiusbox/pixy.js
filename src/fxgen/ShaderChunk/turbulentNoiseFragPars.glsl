float fbm(vec2 v, int octaves, float frequency, float amplitude) {
  const mat2 m = mat2( 0.00, 0.80, -0.80,  0.36 );
  vec2 q = v;
  float f = 0.0;
  f  = 0.5000 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.01;
  f += 0.2500 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.02;
  f += 0.1250 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.03;
  f += 0.0625 * rpnoise(q, octaves, frequency, amplitude);

  f = f*1.2 + 0.5;
//   f = sqrt(f);
  return f;
}