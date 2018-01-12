float len = length(cDirection);
if (len == 0.0) {
  pout.color = vec3(1.0);
} else {
  vec2 n = normalize(cDirection);
  vec2 pos = pin.position - (-cDirection);
  float t = (dot(pos, n) * 0.5 + cOffset) / len;
  float r = rand(vec2(pin.uv.x, 0.0)) + 1e-6;
  float a = 1.0 / (1.0 - r);
  t = a*t - a*r;
  t = pow(t, cPowerExponent);
  pout.color = vec3(t);
}