// https://www.shadertoy.com/view/XdcGzH
#define A2B PI/360.0
#define MaxIter 14

const float DRadius = 0.7;
const float Width = 1.4;
const float Gamma = 2.2;
const vec3 BackgroundColor = vec3(1.0);
const vec3 CurveColor = vec3(0.0);

float lambda, ca, sa, lscl;
float aaScale;
float Angle = 60.0;
vec2 csa;

float d2hline(vec2 p) {
  float t = max(-1.0, min(1.0, p.x));
  p.x -= t;
  return length(p);
}

float DE(vec2 p) {
  float d = 1.0;
  float r = dot(p,p);
  for (int i=0; i<MaxIter; i++) {
    p.x = abs(p.x);
    p.x -= 1.0 - lambda;
    float t = 2.0 * min(0.0, dot(p, csa));
    p -= csa * t;
    p.x -= lambda;
    p *= lscl;
    d *= lscl;
    p.x += 1.0;
    r = dot(p,p);
  }
  return d2hline(p) / d; // length(p)-1.0;
}

float coverageFunction(float t) {
// this function returns the area of the part of the unit disc that is at the right of the vertical line x=t.
// the exact coverage function is:
// t = clamp(t, -1.0, 1.0); return (acos(t) - t*sqrt(1.0 - t*t)) / PI;
// this is a good approximation
  return 1.0 - smoothstep(-1.0, 1.0, t);
// a better approximiation
// t = clamp(t, -1.0, 1.0); return (t*t*t*t-5.0)*t*1.0/8.0+0.5; // but there is no virtual difference
}

float coverageLine(float d, float lineWidth, float pixsize) {
  d = d * 1.0 / pixsize;
  float v1 = (d-0.5*lineWidth)/DRadius;
  float v2 = (d+0.5*lineWidth)/DRadius;
  return coverageFunction(v1) - coverageFunction(v2);
}

vec3 color(vec2 pos) {
  float pixsize = dFdx(pos.x);
  float v = coverageLine(abs(DE(pos)), Width, pixsize);
  return pow(mix(pow(BackgroundColor, vec3(Gamma)), pow(CurveColor, vec3(Gamma)), v), vec3(1.0 / Gamma));
}