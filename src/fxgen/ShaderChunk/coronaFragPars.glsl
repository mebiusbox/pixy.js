// https://www.shadertoy.com/view/XdV3DW by vamoss

uniform float cIntensity;
uniform float cRadius;
uniform float cSize;

float noise(vec3 uv, float res) {
	const vec3 s = vec3(1e0, 1e2, 1e3);
	uv *= res;
	vec3 uv0 = floor(mod(uv, res))*s;
	vec3 uv1 = floor(mod(uv+1., res))*s;
	vec3 f = fract(uv); 
	f = f*f*(3.0-2.0*f);
	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
	              uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
	vec4 r = fract(sin(v*1e-1)*1e3);
	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	return mix(r0, r1, f.z)*2.-1.;
}

vec3 burn(vec2 p, float size) {
  float c1 = size * 4.0 - 3.0 * length(2.5 * p);
  vec3 coord = vec3(atan(p.x, p.y) / PI2 + 0.5, length(p) * 0.4, 0.5);
  for (int i=0; i<=3; i++) {
    float power = exp2(float(i));
    c1 += 0.2 * (1.5 / power) * noise(coord + vec3(0.0, -time*0.05, -time*0.01), power*16.0);
  }
  c1 *= cIntensity;
  return vec3(c1);
}