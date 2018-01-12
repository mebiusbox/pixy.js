// http://glslsandbox.com/e#36774.0
uniform float cIntensity;
uniform float cFrequency;
uniform float cWidth;

float hash(vec2 p) {
  return fract(sin(dot(vec3(p.xy,1.0), vec3(37.1, 61.7, 12.4))) * 3758.5453123);
}

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f *= f * (3.0 - 2.0 * f);
  return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), f.x),
             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x),
             f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  v += noise(p*1.0) * 0.5;
  v += noise(p*2.0) * 0.25;
  v += noise(p*4.0) * 0.125;
  return v;
}