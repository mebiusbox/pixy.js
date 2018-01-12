float len = length(cDirection);
if (len == 0.0) {
  pout.color = vec3(1.0);
} else {
  vec2 n = normalize(cDirection);
  vec2 pos = pin.position - (-cDirection);
  float t = (dot(pos, n) * 0.5) / len;
  t = pow(t, cPowerExponent);
  pout.color = vec3(t);
}