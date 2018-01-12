float fbm(vec3 v) {
  float n = 0.0;
  n += 1.0000 * abs(snoise(v));
  n += 0.5000 * abs(snoise(v*2.0));
  n += 0.2500 * abs(snoise(v*4.0));
  n += 0.1250 * abs(snoise(v*8.0));
  float rn = 1.0 - n;
  return rn*rn;
}