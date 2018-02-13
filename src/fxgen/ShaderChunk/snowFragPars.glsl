uniform float cSpeed;
uniform float cScale;
uniform float cDensity;
uniform float cRange;
float t = 0.0;

vec2 snowHash(in vec2 p) {
  return cos(t + sin(mat2(17., 5., 3., 257.) * p - p) * 1234.5678);
}

float snowNoise(in vec2 p) {
  const float K1 = (sqrt(3.)-1.)/2.;
  const float K2 = (3.-sqrt(3.))/6.;
  vec2 i = floor(p+(p.x + p.y)*K1);
  vec2 a = p - i + (i.x + i.y)*K2;
  vec2 o = (a.x > a.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec2 b = a - o + K2;
  vec2 c = a - 1. + 2. * K2;
  vec3 h = (.5 - vec3(dot(a,a), dot(b,b), dot(c,c))) * 3.;
  vec3 n = vec3(dot(a,snowHash(i)), dot(b, snowHash(i+o)), dot(c, snowHash(i+1.)));
  return dot(n, h*h*h*h*h)*.5 + .5;
}

float snow(vec2 uv, float scale) {
  float w = smoothstep(1., 0., -uv.y * (scale / 40.0));
  uv += t/scale;
  uv.y += t/scale;
  uv.x += sin(uv.y + t*.25)/scale;
  uv *= scale;
  
  vec2 s = floor(uv);
  vec2 f = fract(uv);
  float k = 4.;
  vec2 p = .5 + .3 * sin(11. * fract(sin((s+scale)*mat2(7., 3., 6., 5.))*5.)) - f;
  float d = length(p);
  k = min(d,k);
  k = smoothstep(0., k, sin(f.x + f.y)*.01);
  return w*k*(cScale*5.0);
}