// https://www.shadertoy.com/view/XdjcWc
uniform float cPower;
uniform float cDensity;
uniform float cThickness;
uniform float cScale;
uniform float cFrequency;
uniform float cColor;

#define TAU 6.2831853

float hlx(vec3 p) {
  float m = TAU/mix(1.0, 5.0, cPower);
  float t = time;
  float a = mod(atan(p.y, p.x) - p.z*mix(0.5,1.5,cFrequency)+t, m) - 0.5*m;
  float l = length(p.xy);
  float r = 0.1 + 0.2 * (sin(abs(p.z*4.0) + t*4.0) * 0.5 + 0.5);
  return length(vec2(a*l,length(p.xy) - (0.5+abs(p.z)*2.0)*(1.0 + sin(abs(p.z)-t*10.0)*0.5+0.5)*0.2))-r;
}

vec3 hsv(vec3 c) {
  vec4 k = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx+k.xyz)*6.0-k.www);
  return c.z * mix(k.xxx, clamp(p-k.xxx, 0.0, 1.0), c.y);
}

float map(vec3 p) {
  p.xy *= rotate2d(time*0.3 + length(p)*0.05);
  p.yz *= rotate2d(time*0.5);
  p.xz *= rotate2d(time*0.7);
  float d = min(min(hlx(p.xyz), hlx(p.yzx)), hlx(p.zxy))*(1.0 + sin(length(p*1.0)-time*4.0)*0.8);
  vec3 n = normalize(sign(p));
  float d2 = max(length(max(abs(p)-vec3(1.0), 0.0)), dot(p,n)-2.3);
  return d;//min(d,d2);
}

float st(float x, float m) { return floor(x*m)/m; }
