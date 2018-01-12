// https://www.shadertoy.com/view/4sX3Rs#
uniform float cIntensity;
uniform float cPowerExponent;

float noise(float x) {
//   return iqnoise(vec2(x,0.0), 0.0, 0.0);
//   return pnoise(vec2(x*16.0,0.0));
  return pnoise(vec2(x,0.0), 1, 2.0, 0.5);
  // float map = min(resolution.x, resolution.y);
  // vec2 t = mod(vec2(x,0.0), map);
  // return snoise(t, t / map, vec2(map));
}

float noise(vec2 x) {
  return iqnoise(x*512.0, 0.0, 0.0);
//   return noise(x*0.1);
}

vec3 cc(vec3 color, float factor, float factor2) {
  float w = color.x + color.y + color.z;
  return mix(color, vec3(w)*factor, w*factor2);
}