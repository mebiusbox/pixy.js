// http://glslsandbox.com/e#37373.0
uniform float cIntensity;
uniform float cPowerExponent;
uniform float cSize;

float lengthSqr(vec2 p) { return dot(p,p); }

float cellNoise(vec2 p) {
  return fract(sin(fract(sin(p.x) * 43.13311) + p.y) * 31.0011);
}

float worley(vec2 p) {
  float d = 1e30;
  for (int xo=-1; xo <= 1; ++xo) {
    for (int yo=-1; yo <= 1; ++yo) {
      vec2 tp = floor(p) + vec2(xo, yo);
      d = min(d, lengthSqr(p - tp - vec2(cellNoise(tp))));
    }
  }
  return 5.0 * exp(-4.0 * abs(2.0*d - 1.0));
}

float fworley(vec2 p) {
  return sqrt(sqrt(sqrt(
    1.0 * // light
//     worley(p*5.0 + 0.3 + time * 0.525) * 
    sqrt(worley(p * 50.0 / cSize + 0.3 + time * -0.15)) * 
//     sqrt(sqrt(worley(p * -10.0 + 9.3))) )));
    1.0 )));
}