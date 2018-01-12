// http://glslsandbox.com/e#36072.2

uniform float cRadius;
uniform float cRange;
uniform float cColor;
uniform float cPowerExponent;

#define dist 0.05
#define zoom 100.0

vec3 tex2D(vec2 uv) {
  if (uv.x == 0.0 || uv.y == 0.0 || uv.x == 1.0 || uv.y == 1.0) return vec3(0.0);
  float d = distance(uv, vec2(0.5));
  if (d >= dist) return vec3(0.0);
  return vec3(0.2 * ((dist - d)/dist), 0.4 * ((dist-d) / dist), 0.8 * ((dist-d) / dist));
}