// vec2 uv = 12.0 * (pin.coord - 0.5*resolution.xy) / resolution.x;
// float v = length(uv);
// vec2 h = vec2(ceil(3.0*time));
// float a, w;
// 
// // lines
// for (int i=0; i<21; i++) {
//   h = splatHash(h);
//   w = 0.03;
//   a = (atan(uv.x, uv.y)+3.14)/6.28*(1.0+w);
//   v -= sin(smoothstep(h.x, h.x+w, a)*3.14);
// }
// 
// // spots
// for (float s = 3.0; s>0.5; s -= 0.04) {
//   h = (splatHash(h)*2.0-1.0)*s;
//   v -= (1.01-smoothstep(0.0,0.5*(3.0-s), length(uv-h)));
// }

vec3 xyz = fwidth(vec3(0,0,0));
vec2 uv = 6.0*pin.position;
float v = splat(splat_uv(pin.coord));
// float w = 0.75 * splat_fwidth(pin.coord, v);
float w = 0.75*fwidth(v);
v = 1.0 - smoothstep(-w,w,v);
pout.color = vec3(v,v,v);
