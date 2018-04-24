uniform int cSplatLines;
uniform float cSplatSpotStep;

vec2 splatHash(in vec2 p) {
  return fract(sin(p*mat2(63.31,127.63,395.467,213.799))*43141.59265);
}

float splat(in vec2 p) {
  float v = length(p);
  vec2 h = vec2(ceil(3.0*time));
  float a, w;

  // lines
  for (int i=0; i<100; i++) {
    if (i>=cSplatLines) break;
    h = splatHash(h);
    w = 0.03;
    a = (atan(p.x, p.y)+3.14)/6.28*(1.0+w);
    v -= sin(smoothstep(h.x, h.x+w, a)*3.14);
  }

  // spots
  // for (float s = 3.0; s>0.5; s -= cSplatSpotStep) {
  float s = 3.0;
  for (int i=0; i<100; i++) {
    h = (splatHash(h)*2.0-1.0)*s;
    v -= (1.01-smoothstep(0.0,0.5*(3.0-s), length(p-h)));
    s -= cSplatSpotStep;
    if (s <= 0.5) break;
  }
  
  return v;
}

vec2 splat_uv(in vec2 coord) {
  return 8.0 * (coord - 0.5*resolution.xy) / min(resolution.x, resolution.y);
}

float splat_fwidth(in vec2 coord, in float v11) {
  float v10 = splat(splat_uv(coord + vec2(0.0,1.0)));
  float v01 = splat(splat_uv(coord + vec2(-1.0,0.0)));
  return abs(v11-v01) + abs(v10-v11);
}
