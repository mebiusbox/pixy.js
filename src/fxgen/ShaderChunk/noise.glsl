#define NOISE_OCTAVE_MAX 10
uniform int cNoiseOctave;
uniform float cNoiseFrequency;
uniform float cNoiseAmplitude;
uniform float cNoisePersistence;
uniform bool cNoiseGraphEnable;

// [0,1]
float rand(float x) {
  return fract(sin(x) * 4358.5453123);
}
// [0,1]
float rand3(float n) {
  return fract(cos(n*89.42) * 343.32);
}
// [0,1]
float rand(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}
// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand2(const in vec2 uv) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);
  return fract(sin(sn) * c);
}

float cosine(float a, float b, float x) {
  float f = (1.0 - cos(x * PI)) * 0.5;
  return a * (1.0 - f) + b * f;
}

float bicosine(float tl, float tr, float bl, float br, float x, float y) {
  return cosine(cosine(tl,tr,x), cosine(bl,br,x), y);
}

float linear(float a, float b, float t) {
  return a + (b-a)*t;
}

float bilinear(float tl, float tr, float bl, float br, float x, float y) {
  return linear(linear(tl,tr,x), linear(bl,br,x), y);
}

float cubic(float a, float b, float x) {
  float f = x*x*(3.0 - 2.0*x); // 3x^2 + 2x
  return a * (1.0 - f) + b * f;
}

float bicubic(float tl, float tr, float bl, float br, float x, float y) {
  return cubic(cubic(tl,tr,x), cubic(bl,br,x), y);
}

float quintic(float a, float b, float x) {
  float f = x*x*x*(x*(x*6.0 - 15.0)+10.0); // 6x^5 - 15x^4 + 10x^3
  return a * (1.0 - f) + b * f;
}

float biquintic(float tl, float tr, float bl, float br, float x, float y) {
  return quintic(quintic(tl,tr,x), quintic(bl,br,x), y);
}

float bimix(float tl, float tr, float bl, float br, float x, float y) {
  return mix(mix(tl,tr,x), mix(bl,br,x), y);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
vec2 vrand(vec2 p) {
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

// gradation noise
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(dot(vrand(i+vec2(0.0,0.0)), f-vec2(0.0,0.0)),
                 dot(vrand(i+vec2(1.0,0.0)), f-vec2(1.0,0.0)), u.x),
             mix(dot(vrand(i+vec2(0.0,1.0)), f-vec2(0.0,1.0)),
                 dot(vrand(i+vec2(1.0,1.0)), f-vec2(1.0,1.0)), u.x), u.y);
}

float plerp(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  return bicosine(rand(i+vec2(0.0,0.0)),
                  rand(i+vec2(1.0,0.0)),
                  rand(i+vec2(0.0,1.0)),
                  rand(i+vec2(1.0,1.0)), f.x, f.y);
//   vec4 v = vec4(rand(vec2(i.x,       i.y)),
//                 rand(vec2(i.x + 1.0, i.y)),
//                 rand(vec2(i.x,       i.y + 1.0)),
//                 rand(vec2(i.x + 1.0, i.y + 1.0)));
//   return cosine(cosine(v.x, v.y, f.x), cosine(v.z, v.w, f.x), f.y);
}

float pnoise(vec2 p) {
  float t = 0.0;
  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {
    if (i >= cNoiseOctave) break;
    float freq = pow(2.0, float(i));
    float amp = pow(cNoisePersistence, float(cNoiseOctave - i));
    t += plerp(vec2(p.x / freq, p.y / freq)) * amp;
  }
  return t;
}

float pnoise(vec2 p, int octave, float frequency, float persistence) {
  float t = 0.0;
  float maxAmplitude = EPSILON;
  float amplitude = 1.0;
  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {
    if (i >= octave) break;
    t += plerp(p * frequency) * amplitude;
    frequency *= 2.0;
    maxAmplitude += amplitude;
    amplitude *= persistence;
  }
  return t / maxAmplitude;
}

// ridged noise
float rpnoise(vec2 p, int octave, float frequency, float persistence) {
  float t = 0.0;
  float maxAmplitude = EPSILON;
  float amplitude = 1.0;
  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {
    if (i >= octave) break;
    t += ((1.0 - abs(plerp(p * frequency))) * 2.0 - 1.0) * amplitude;
    frequency *= 2.0;
    maxAmplitude += amplitude;
    amplitude *= persistence;
  }
  return t / maxAmplitude;
}

float psnoise(vec2 p, vec2 q, vec2 r) {
  return pnoise(vec2(p.x,       p.y      )) *        q.x  *        q.y +
         pnoise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +
         pnoise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y +
         pnoise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);
}

// PRNG (https://www.shadertoy.com/view/4djSRW)
float prng(in vec2 seed) {
  seed = fract(seed * vec2(5.3983, 5.4427));
  seed += dot(seed.yx, seed.xy + vec2(21.5351, 14.3137));
  return fract(seed.x * seed.y * 95.4337);
}

// https://www.shadertoy.com/view/Xd23Dh
// Created by inigo quilez - iq/2014
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// This is a procedural pattern that has 2 parameters, that generalizes cell-noise, 
// perlin-noise and voronoi, all of which can be written in terms of the former as:
//
// cellnoise(x) = pattern(0,0,x)
// perlin(x) = pattern(0,1,x)
// voronoi(x) = pattern(1,0,x)
//
// From this generalization of the three famouse patterns, a new one (which I call 
// "Voronoise") emerges naturally. It's like perlin noise a bit, but within a jittered 
// grid like voronoi):
//
// voronoise(x) = pattern(1,1,x)
//
// Not sure what one would use this generalization for, because it's slightly slower 
// than perlin or voronoise (and certainly much slower than cell noise), and in the 
// end as a shading TD you just want one or another depending of the type of visual 
// features you are looking for, I can't see a blending being needed in real life.  
// But well, if only for the math fun it was worth trying. And they say a bit of 
// mathturbation can be healthy anyway!
// Use the mouse to blend between different patterns:
// cell noise   u=0,v=0
// voronoi      u=1,v=0
// perlin noise u=0,v=1
// voronoise    u=1,v=1
// More info here: http://iquilezles.org/www/articles/voronoise/voronoise.htm
// psudo-random number generator
float iqhash2(vec2 p) {
  vec2 q = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
  return abs(fract(sin(q.x*q.y)*43758.5453123)-0.5)*2.0;
}
vec2 iqhash2vec(vec2 p) {
  vec2 q = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
  return -1.0 + 2.0 * fract(sin(q)*43758.5453123);
}


vec3 iqhash3( vec2 p ) {
  vec3 q = vec3(dot(p,vec2(127.1,311.7)), 
                dot(p,vec2(269.5,183.3)), 
                dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ) {
  vec2 p = floor(x);
  vec2 f = fract(x);
  float k = 1.0+63.0*pow(1.0-v,4.0);
  float va = 0.0;
  float wt = 0.0;
  for( int j=-2; j<=2; j++ ) {
    for( int i=-2; i<=2; i++ ) {
      vec2 g = vec2( float(i),float(j) );
      vec3 o = iqhash3( p + g )*vec3(u,u,1.0);
      vec2 r = g - f + o.xy;
      float d = dot(r,r);
      float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
      va += o.z*ww;
      wt += ww;
    }
  }
  return va/wt;
}

// https://www.shadertoy.com/view/MdX3Rr by inigo quilez
const mat2 iqfbmM = mat2(0.8,-0.6,0.6,0.8);
float iqfbm( in vec2 p ) {
  float f = 0.0;
  f += 0.5000*pnoise( p ); p = iqfbmM*p*2.02;
  f += 0.2500*pnoise( p ); p = iqfbmM*p*2.03;
  f += 0.1250*pnoise( p ); p = iqfbmM*p*2.01;
  f += 0.0625*pnoise( p );
  return f/0.9375;
}


// simplex noise

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float permute(in float x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec2 permute(in vec2 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec3 permute(in vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 permute(in vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(in vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(in vec2 v) {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626, // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}


float snoise(vec3 v) {
const vec2  C = vec2(1.0/6.0, 1.0/3.0);
const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
vec3 i  = floor(v + dot(v, C.yyy) );
vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
vec3 g = step(x0.yzx, x0.xyz);
vec3 l = 1.0 - g;
vec3 i1 = min( g.xyz, l.zxy );
vec3 i2 = max( g.xyz, l.zxy );

// x0 = x0 - 0.0 + 0.0 * C.xxx;
// vec3 x1 = x0 - i1 + 1.0 * C.xxx;
// vec3 x2 = x0 - i2 + 2.0 * C.xxx;
// vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
vec3 x1 = x0 - i1 + C.xxx;
vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
	i = mod289(i); 
	vec4 p = permute( permute( permute( 
           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
         + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
         + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
float n_ = 0.142857142857; // 1.0/7.0
vec3  ns = n_ * D.wyz - D.xzx;

vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

vec4 x_ = floor(j * ns.z);
vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

vec4 x = x_ *ns.x + ns.yyyy;
vec4 y = y_ *ns.x + ns.yyyy;
vec4 h = 1.0 - abs(x) - abs(y);

vec4 b0 = vec4( x.xy, y.xy );
vec4 b1 = vec4( x.zw, y.zw );

//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
vec4 s0 = floor(b0)*2.0 + 1.0;
vec4 s1 = floor(b1)*2.0 + 1.0;
vec4 sh = -step(h, vec4(0.0));

vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

vec3 p0 = vec3(a0.xy,h.x);
vec3 p1 = vec3(a0.zw,h.y);
vec3 p2 = vec3(a1.xy,h.z);
vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;

// Mix final noise value
vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
m = m * m;
return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

// vec4 grad4(float j, vec4 ip) {
//   const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
//   vec4 p,s;
//   p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
//   p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
//   s = vec4(lessThan(p,vec4(0.0)));
//   p.xyz = p.xyz + (s.xyz*2.0-1.0)*s.www;
//   return p;
// }

// float snoise(in vec4 v) {
//   const vec4 C = vec4(0.138196601125011, // (5-sqrt(5))/20 G4
//                       0.276393202250021, // 2 * G4
//                       0.414589803375032, // 3 * G4
//                      -0.447213595499958); // -1 + 4 * G4

//   // First corner
//   vec4 i = floor(v + dot(v, C.yyyy));
//   vec4 x0 = v - i + dot(i, C.xxxx);

//   // Other corners

//   // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
//   vec4 i0;
//   vec3 isX = step(x0.yzw, x0.xxx);
//   vec3 isYZ = step(x0.zww, x0.yyz);
//   // i0.x = dot(isX, vec3(1.0));
//   i0.x = isX.x + isX.y + isX.z;
//   i0.yzw = 1.0 - isX;
//   // i0.y += dot(isYZ.xy, vec2(1.0));
//   i0.y += isYZ.x + isYZ.y;
//   i0.zw += 1.0 - isYZ.xy;
//   i0.z += isYZ.z;
//   i0.w += 1.0 - isYZ.z;

//   // i0 now contains the unique values 0,1,2,3 in each channel
//   vec4 i3 = clamp(i0, 0.0, 1.0);
//   vec4 i2 = clamp(i0-1.0, 0.0, 1.0);
//   vec4 i1 = clamp(i0-2.0, 0.0, 1.0);

//   // x0 = x0 - 0.0 + 0.0 * C.xxxx
//   // x1 = x0 - i1 + 1.0 * C.xxxx
//   // x2 = x0 - i2 + 2.0 * C.xxxx
//   // x3 = x0 - i3 + 3.0 * C.xxxx
//   // x4 = x0 - 1.0 + 4.0 * C.xxxx
//   vec4 x1 = x0 - i1 + C.xxxx;
//   vec4 x2 = x0 - i2 + C.yyyy;
//   vec4 x3 = x0 - i3 + C.zzzz;
//   vec4 x4 = x0 + C.wwww;

//   // Permutations
//   i = mod289(i);
//   float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
//   vec4 j1 = permute(permute(permute(permute(
//       i.w + vec4(i1.w, i2.w, i3.w, 1.0))
//     + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
//     + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
//     + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
//   ))));

//   // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
//   // 7x7x6 = 294, which is close to the ring size 17*17=289.
//   vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);

//   vec4 p0 = grad4(j0,   ip);
//   vec4 p1 = grad4(j1.x, ip);
//   vec4 p2 = grad4(j1.y, ip);
//   vec4 p3 = grad4(j1.z, ip);
//   vec4 p4 = grad4(j1.w, ip);

//   // Normalize gradients
//   vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
//   p0 *= norm.x;
//   p1 *= norm.y;
//   p2 *= norm.z;
//   p3 *= norm.w;
//   p4 *= taylorInvSqrt(dot(p4,p4));

//   // Mix contributions from the five corners
//   vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(p2,x2)), 0.0);
//   vec3 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
//   m0 = m0*m0;
//   m1 = m1*m1;
//   return 49.0 * (dot(m0*m0), vec3(dot(p0,x0), dot(p1,x1), dot(p2,x2))) + 
//     dot(m1*m1, vec2(dot(p3,x3), dot(p4,x4)));
// }

float scaleShift(float x, float a, float b) { return x*a+b; }
vec2 scaleShift(vec2 x, float a, float b) { return x*a+b; }
vec3 scaleShift(vec3 x, float a, float b) { return x*a+b; }
// @return Value of the noise, range: [0,1]
float hash1(float x) {
    return fract(sin(x)*12345.0);
}
// @return Value of the noise, range: [0,1]
float hash1(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233)))*43758.5453123);
}
// @return Value of the noise, range: [0,1]
float hash1(vec3 v) {
    return fract(sin(dot(v.xyz ,vec3(12.9898,78.233,144.7272))) * 43758.5453);
}
// @return Value of the noise, range: [0,1]
vec2 hash2(vec2 st) {
    st = vec2(dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)));
    return fract(sin(st)*43758.5453123);
}
// @return Value of the noise, range: [0,1]
vec3 hash3(vec3 st) {
    st = vec3(dot(st,vec3(127.1,311.7,217.3)), 
              dot(st,vec3(269.5,183.3,431.1)), 
              dot(st,vec3(365.6,749.9,323.7)));
    return fract(sin(st)*43758.5453123);
}
// @return Value of the noise, range: [-1,1]
float random1(float x) {
    return scaleShift(hash1(x), 2.0, -1.0);
}
// @return Value of the noise, range: [-1,1]
float random1(vec2 st) {
    return scaleShift(hash1(st), 2.0, -1.0);
}
// @return Value of the noise, range: [-1,1]
float random1(vec3 v) {
    return scaleShift(hash1(v), 2.0, -1.0);
}
// @return Value of the noise, range: [-1,1]
vec2 random2(vec2 p) {
    return scaleShift(hash2(p), 2.0, -1.0);
}
// @return Value of the noise, range: [-1,1]
vec3 random3(vec3 v) {
    return scaleShift(hash3(v), 2.0, -1.0);
}