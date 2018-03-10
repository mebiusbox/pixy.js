uniform float cIntensity;
uniform float cDensity;
uniform float cThickness;
uniform float cColor;
const vec3 sunDir = normalize(vec3(-0.6, 0.4, 0.6));

float cloudsHash(float n) { return fract(sin(n)*43578.5453123); }
float cloudsNoise(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  float n = p.x + p.y*157.0 + 113.0*p.z;
  return 2.0 * mix(mix(mix(cloudsHash(n+0.0), cloudsHash(n+1.0), f.x),
                       mix(cloudsHash(n+157.0), cloudsHash(n+158.0), f.x), f.y),
                   mix(mix(cloudsHash(n+113.0), cloudsHash(n+114.0), f.x),
                       mix(cloudsHash(n+270.0), cloudsHash(n+271.0), f.x), f.y), f.z)-1.0;
}
float cloudsFbm(in vec3 pos, int layers, float AM, float FM) {
  float sum = 0.0;
  float amplitude = 1.0;
  for (int i=0; i<16; ++i) {
    if (i >= layers) break;
    sum += amplitude * cloudsNoise(pos);
    amplitude *= AM;
    pos *= FM;
  }
  return sum;
}
float clouds(in vec3 p) {
  return 0.01 * cloudsFbm(0.9*vec3(0.2,0.2,0.3)*(p+vec3(0.0,0.0,3.0*time)), 7, 0.5, 4.0);
}
vec2 renderNoise(in vec3 ro, in vec3 rd) {
  float tmin = 10.0;
  float tmax = 10.0 + 10.0*cDensity;
  float delta = 0.1;
  float sum = 0.0;
  float t = tmin;
  for (int i=0; i<100; ++i) {
    if (t >= tmax) break;
    vec3 pos = ro + t*rd;
    float d = max(0.0, clouds(pos));
    sum = sum*(1.0-d)+d;
    if (sum > 0.99) break;
    t += delta;
  }
  return vec2(sum, t);
}
float shadeClouds(in vec3 ro, in vec3 rd) {
  float sum = 0.0;
  float t = 0.0;
  float delta = 0.1;
  for (int i=0; i<5; ++i) {
    vec3 pos = ro + rd*t;
    float d = max(0.0, clouds(pos));
    sum = sum*(1.0-d)+d;
    if (sum > 0.99) break;
    t += delta;
  }
  return sum;
}
vec3 render(in vec3 ro, in vec3 rd) {
  //const vec3 sky = vec3(0.4, 0.6, 1.0);
  const vec3 sky = vec3(0.0, 0.0, 0.0);
  //vec3 att = vec3(0.2, 0.5, 0.9);
  //vec3 att = vec3(0.0, 0.0, 0.0);
  vec3 att = mix(vec3(0.0), vec3(0.2, 0.5, 0.9), cColor);
  vec2 ns = renderNoise(ro, rd);
  vec3 pos = ro + rd*ns.y;
  float shad = 1.0; // 0.9 * (1.0 - shadeClouds(pos + sunDir*0.1, sunDir));
  float density = ns.x;
  float inv = 1.0 - density;
  float w = 1.8 * (0.5 * rd.y + 0.5) * cIntensity;
  vec3 cl = shad * w * 1.0 * mix(vec3(1.0), inv*att, sqrt(density));
  if (density < 0.1) return mix(sky, cl, max(0.0, density)*10.0*cThickness);
  return cl;
}
vec3 render(vec2 ndc, float aspectRatio) {
  vec3 o = vec3(0.0, 0.0, 0.0);
  const float fov = 2.0 * PI / 3.0;
  const float scaleX = tan(fov / 2.0);
  vec3 right = vec3(1.0, 0.0, 0.0) * scaleX;
  vec3 forward = vec3(0.0, 0.0, 1.0);
  vec3 up = vec3(0.0, 1.0, 0.0) * scaleX * aspectRatio;
  vec3 rd = normalize(forward + ndc.x*right + ndc.y*up);
  return render(o, rd);
}