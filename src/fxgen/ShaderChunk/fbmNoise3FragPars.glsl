uniform float cNoiseScale;
uniform float cOffset;

float hash(float n) {
  return fract(sin(n)*758.5453);
}
float noise3d(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  float n = p.x + p.y * 157.0 + 113.0 * p.z;
  return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),
             mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);
}
float noise2d(in vec2 x) {
  vec2 p = floor(x);
  vec2 f = smoothstep(0.0, 1.0, fract(x));
  float n = p.x + p.y * 57.0;
  return mix(mix(hash(n+0.0), hash(n+1.0), f.x), mix(hash(n+57.0), hash(n+58.0), f.x), f.y);
}

float configurablenoise(vec3 x, float c1, float c2) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  float h2 = c1;
  float h1 = c2;
  float n = p.x + p.y*h1+h2*p.z;
  return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                 mix(hash(n+h1), hash(n+h1+1.0), f.x), f.y),
             mix(mix(hash(n+h2), hash(n+h2+1.0), f.x),
                 mix(hash(n+h1+h2), hash(n+h1+h2+1.0), f.x), f.y), f.z);
}

float supernoise3d(vec3 p) {
  float a = configurablenoise(p, 883.0, 971.0);
  float b = configurablenoise(p+0.5, 113.0, 157.0);
  return (a+b)*0.5;
}

float supernoise3dX(vec3 p) {
  float a = configurablenoise(p, 883.0, 971.0);
  float b = configurablenoise(p+0.5, 113.0, 157.0);
  return (a*b);
}

float fbmHI(vec3 p, float dx) {
  p *= 1.2;
  float a = 0.0;
  float w = 1.0;
  float wc = 0.0;
  for (int i=0; i<8; i++) {
    if (i >= cNoiseOctave) break;
    a += clamp(2.0 * abs(0.5 - supernoise3dX(p)) * w, 0.0, 1.0);
    wc += w * cNoiseFrequency;
    p = p * dx;
    a *= cNoiseAmplitude;
  }
  return a / wc;
  // return a / wc + noise(p*100.0)*11.0;
}

#define clouds pow(smoothstep(0.36 - supernoise3d(mx * 0.3 + time * 0.1) * 1.0, 0.46, supernoise3d(mx * 2.0) * fbmHI(mx * 6.0 + 5.0*fbmHI(mx.yxz * 1.0 + time * 0.001, 2.0) * 0.5 - time * 0.01, 2.8)), 3.0);
float intersectcloudscovonly(vec3 start) {
  vec3 mx = start;
  // float h = (length(mx) - planetsize);
  // h = smoothstep(0.0, 0.2, h) * (1.0 - smoothstep(0.2, 0.4, h));
  return clouds
}
