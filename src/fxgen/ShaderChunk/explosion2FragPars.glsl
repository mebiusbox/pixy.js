// port from https://www.shadertoy.com/view/lsySzd
// "Volumetric explosion" by Duke
//-------------------------------------------------------------------------------------
// Based on "Supernova remnant" (https://www.shadertoy.com/view/MdKXzc) 
// and other previous shaders 
// otaviogood's "Alien Beacon" (https://www.shadertoy.com/view/ld2SzK)
// and Shane's "Cheap Cloud Flythrough" (https://www.shadertoy.com/view/Xsc3R4) shaders
// Some ideas came from other shaders from this wonderful site
// Press 1-2-3 to zoom in and zoom out.
// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
//-------------------------------------------------------------------------------------

uniform float cCameraPan;
uniform float cExplosionSpeed;
uniform float cExplosionDensity;
uniform float cEmission;
uniform float cBloom;
uniform float cColor;

// #define DITHERING
// #define TOENMAPPING

#define R(p, a) p=cos(a)*p + sin(a)*vec2(p.y,-p.x)

vec3 hash(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

float noise(in vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f*f*(3.0-2.0*f);
  return mix(mix(mix(dot(hash(i + vec3(0.0,0.0,0.0)), f-vec3(0.0,0.0,0.0)),
                     dot(hash(i + vec3(1.0,0.0,0.0)), f-vec3(1.0,0.0,0.0)), u.x),
                 mix(dot(hash(i + vec3(0.0,1.0,0.0)), f-vec3(0.0,1.0,0.0)),
                     dot(hash(i + vec3(1.0,1.0,0.0)), f-vec3(1.0,1.0,0.0)), u.x), u.y),
             mix(mix(dot(hash(i + vec3(0.0,0.0,1.0)), f-vec3(0.0,0.0,1.0)),
                     dot(hash(i + vec3(1.0,0.0,1.0)), f-vec3(1.0,0.0,1.0)), u.x),
                 mix(dot(hash(i + vec3(0.0,1.0,1.0)), f-vec3(0.0,1.0,1.0)),
                     dot(hash(i + vec3(1.0,1.0,1.0)), f-vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
}

float fbm(vec3 p) {
  return noise(p*0.6125)*0.5 + noise(p*0.125)*0.25 + noise(p*0.25)*0.125 + noise(p*0.4)*0.2;
}

float sphere(vec3 p, float r) {
  return length(p)-r;
}

//==============================================================
// otaviogood's noise from https://www.shadertoy.com/view/ld2SzK
//--------------------------------------------------------------
// This spiral noise works by successively adding and rotating sin waves while increasing frequency.
// It should work the same on all computers since it's not based on a hash function like some other noises.
// It can be much faster than other noise functions if you're ok with some repetition.
const float nudge = 4.0; // size of perpendicular vector
float normalizer = 1.0 / sqrt(1.0 + nudge*nudge); // pythagorean theorem on that perpendicular to maintain scale
float spiralNoiseC(vec3 p) {
  float n = -mod(time * 0.8 * cExplosionSpeed, -2.1); // noise amount
  float iter = 2.0;
  for (int i=0; i<8; i++) {
     // add sin and cos scaled inverse with the frequency
    n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter; // abs for a ridged look
     // rotate by adding perpendicular and scaling down
    p.xy += vec2(p.y, -p.x) * nudge;
    p.xy *= normalizer;
     // rotate on other axis
    p.xz += vec2(p.z, -p.x) * nudge;
    p.xz *= normalizer;
     // increase the frequency
    iter *= 1.733733;
  }
  return n;
}

float volumetricExplosion(vec3 p) {
  float final = sphere(p, 4.0);
//   final += expNoise(p*12.5)*0.2;
  final += fbm(p*50.0 * cExplosionDensity);
  final += spiralNoiseC(p.zxy*0.4132+333.0)*3.0; // 1.25
  return final;
}

float map(vec3 p) {
//   R(p.xz, mouse.x * 0.008 * PI * time*0.1);
  R(p.xz, cCameraPan * PI2);
  return volumetricExplosion(p/0.6)*0.6; // scale
}

// assing color to the media
vec3 computeColor(float density, float radius) {
// color based on density alone, gives impresion of occlusion within the media
  vec3 result = mix(vec3(1.0, 0.9, 0.8), vec3(0.4, 0.15, 0.1), density);

// color added to the media
  vec3 colCenter = 7.0 * vec3(0.8, 1.0, 1.0);
  vec3 colEdge = 1.5 * vec3(0.48, 0.53, 0.5);
  result *= mix(colCenter, colEdge, min((radius + 0.05)/0.9, 1.15));
  return result;
}

bool raySphereIntersect(vec3 org, vec3 dir, out float near, out float far) {
  float b = dot(dir, org);
  float c = dot(org, org) - 8.0;
  float delta = b*b - c;
  if (delta < 0.0) return false;
  float deltasqrt = sqrt(delta);
  near = -b - deltasqrt;
  far = -b + deltasqrt;
  return far > 0.0;
}

// Applies the filmic curve from John Hable's presentation
// More details at : http://filmicgames.com/archives/75
vec3 toneMapFilmicALU(vec3 c) {
  c = max(vec3(0), c - vec3(0.004));
  c = (c * (6.2*c + vec3(0.5))) / (c * (6.2 * c + vec3(1.7)) + vec3(0.06));
  return c;
}