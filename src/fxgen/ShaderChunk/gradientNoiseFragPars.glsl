uniform float cNoiseScale;
uniform float cColor;
vec3 normal(vec3 v, float delta) {
  vec2 coefficient = vec2(
    snoise(v + vec3(delta, 0.0, 0.0)) - snoise(v - vec3(delta, 0.0, 0.0)),
    snoise(v + vec3(0.0, delta, 0.0)) - snoise(v - vec3(0.0, delta, 0.0))) / delta;
  coefficient *= 0.3;
  vec3 req = vec3(-coefficient.x, -coefficient.y, 1.0);
  return req / length(req);
}