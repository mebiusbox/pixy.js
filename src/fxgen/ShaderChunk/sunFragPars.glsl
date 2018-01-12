// https://www.shadertoy.com/view/MlKGDc by Iulian Marinescu Ghetau

uniform float cRadius;
uniform float cColor;

struct Ray {
  vec3 o;
  vec3 dir;
};

struct Intersect {
  vec3 pos;
  vec3 norm;
};

vec4 obj;  // xyz - position, w - cRadius

const float eps = 1e-3;

// Number of ray iteration
const int iterations = 15;

// Next, I define an exposure time adn gamma value. At this point, I also create
// a basic directional light and define the ambient light color; the color here
// is mostly a matter of taste. Basically ... lighting controls.
const float exposure = 0.3;
const float gamma = 2.2;
const float intensity = 50.0;

// The maximum Radius the Camera can move around (sync with the value in BufA)
const float cCamPanRadius = 10000.0;

// The position of the saved camera variables in the Render Buffer A (sync with the value in BufA)
const vec2 txCamPos = vec2(0.0, 0.0);
const vec2 txCamForward = vec2(1.0, 0.0);

// Convert val from [0,1] interval to [minVal,maxVal]
// vec3 decode(vec3 val, float minVal, float maxVal) {
//   return vec3(minVal) + (maxVal - minVal) * val;
// }

// The intersection functions are from inigo's article
// http://www.iquilezles.org/www/articles/simplegpurt/simplegpurt.htm
bool intSphere(in vec4 sp, in vec3 ro, in vec3 rd, in float tm, out float t) {
  bool r = false;
  vec3 d = ro - sp.xyz;
  float b = dot(rd, d);
  float c = dot(d,d) - sp.w*sp.w;
  t = b*b-c;
  if (t > 0.0) {
    t = -b-sqrt(t);
    r = (t > 0.0) && (t < tm);
  }
  return r;
}

// Ray Marching code based on Fiery Spikeball shader: https://www.shadertoy.com/view/4lBXzy#

// #define DITHERING

// Noise function based on https://www.shadertoy.com/view/4sfGzS
// I tried the Iq's faster version but it shows discontinuities when you zoom in very close
float hash(float n) { return fract(sin(n) * 783.5453123); }

float noise(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  float n = p.x + p.y * 157.0 + 113.0 * p.z;
  return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),
                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),
             mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  const mat3 m = mat3(1.0);
  vec3 q = 0.1 * p;
  float f;
  f = 0.5000 * noise(q); q = m*q*2.01;
  f += 0.2500 * noise(q); q = m*q*2.02;
  f += 0.1250 * noise(q); q = m*q*2.03;
  f += 0.0625 * noise(q);
  return f;
}

float sdSphere(vec4 sp, vec3 p) {
  return length(p - sp.xyz) - sp.w;
}

float dfSunSurface(vec3 p) {
  float cs = cos(time * 0.1);
  float si = sin(time * 0.1);
  mat2 rM = mat2(cs, si, -si, cs);
  p.xz *= rM;
  return max(0.0, sdSphere(obj + vec4(0.0, 0.0, 0.0, -1.0), p) + fbm(p*60.0+time*2.0) * 0.15);
}

// See "Combustible Voronoi"
// https://www.shadertoy.com/view/4tlSzl
vec3 firePalette(float i) {
  float T = 900.0 + 3500.0 * i; // Temperature range (in Kelvin)
  vec3 L = vec3(7.4, 5.6, 4.4); // Red, green, blue wavelengths (in hundreds of nanometers).
  L = pow(L, vec3(5.0)) * (exp(1.43876719683e5/(T*L))-1.0);
  return 1.0 - exp(-5e8/L); // Exposure level. Set to "50." For "70," change the "5" to a "7," etc.
}

vec3 rayMarch(vec3 ro, vec3 rd, vec2 uv, out float dist) {
// ld, td: local, total density
// w: weighwing factor
  float ld = 0.0, td = 0.0, w;

// t: length of the ray
// d: distance function
  float d = 1.0, t = 0.0;

// Distance threshold
  const float h = 0.25;

// total color
  float tc = 0.0;

  vec2 seed = uv + fract(time);

// Tidied the raymarcher up a bit. Plus, got rid some redundancies... I think.

  for (int i=0; i<30; i++) {
    // Loop break conditions. Seems to work, but let me know if I've 
    // overlooked something. The middle break isn't really used here, but
    // it can help in certain situations.
    if (td > (1.0 - 0.02) || d < 0.001*t || t>12.0)  break;

    // evaluate distance function
    // Took away the "0.5" factor, and put it below
    d = dfSunSurface(ro + t*rd);

    // check whether we are close enough (step)
    // compute local density and weighing factor
    ld = (h-d) * step(d, h);
    w = (1.0 - td) * ld;

    // accumulate color and density
    tc += w*w + 1.0/70.0;  // Difference weight distribution
    td += w;

    // dithering implementation come from Eiffies' https://www.shadertoy.com/view/MsBGRh
    #ifdef DITHERING
    // add in noise to reduce banding and create fuzz
    d = abs(d) * (0.9 + 0.4*rnd(seed*vec2(i)));
    #endif

    // enforce minumum stepsize
    // d = max(d, 0.01);

    // step forward
    t += d * 0.5;
  }

  dist = clamp(d, 0.0, 1.0);

  return firePalette(tc);
}

// http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
// mat3 rotMat(vec3 axis, float angle) {
//   axis = normalize(axis);
//   float s = sin(angle);
//   float c = cos(angle);
//   float oc = 1.0 - c;
// 
//   return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
//               oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
//               oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
// }

void initScene() {
  obj = vec4(0.0, 0.0, 0.0, 5.0 - 3.5 * (1.0 - cRadius));
}

// Get a Ray from the Camera position (read from BufA) to the fragment given by the uv coordinates
Ray calcFragmentRay(vec2 uv) {
  vec3 camPos = vec3(0.0, 0.0, 12.0);
  vec3 camForward = vec3(0.0, 0.0, -1.0);
//   vec3 camPos = decode(loadValue(txCamPos), -cCamPanRadius, cCamPanRadius);
//   vec3 camForward = decode(loadValue(txCamForward), -1.0, 0.0);
  vec3 camRight = normalize(cross(vec3(0.0, 1.0, 0.0), camForward));
  vec3 camUp = cross(camForward, camRight);
  return Ray(camPos, normalize(uv.x * camRight + uv.y * camUp + camForward));
}

// Intersects a ray with the scene and return the closest intersection
bool intObjs(vec3 ro, vec3 rd, out Intersect hit) {
  bool r = false;
  float t = 0.0, tm = cCamPanRadius;
  if (intSphere(obj, ro, rd, tm, t)) {
    tm = t; r = true;
    hit.pos = ro + tm * rd;
    hit.norm = normalize(hit.pos - obj.xyz);
  }
  return r;
}

// Check if a ray is in the shadow
bool inShadow(vec3 ro, vec3 rd) {
  float t, tm = cCamPanRadius;
  if (intSphere(obj, ro, rd, tm, t)) return true;
  return false;
}

// Calculate the fresnel coef using Schlick's approximation
// float calcFresnel(vec3 n, vec3 rd, float r0) {
//   float ndotv = clamp(dot(n, -rd), 0.0, 1.0);
//   return r0 + (1.0 - r0) * pow(1.0 - ndotv, 5.0);
// }

vec3 calcShading(Ray ray, Intersect hit, vec2 uv, out float sunDist) {
// The Sun is shaded using a distance based function, 
// bounded by the objs[ixLight] sphere.
// Start to march the ray from points equally distant from the
// sun's center, this way the Sun's shading does not depend on the camera location.
// (The Sun looks the same no matter where you look from)
  vec3 col = rayMarch(hit.pos, ray.dir, uv, sunDist);
  return col;
}

vec3 rayTrace(vec2 fragCoord) {
// Pixels to fragment coordinates do not map one a one-to-one basis, so I need 
// to divide the fragment coordinates by the viewport resolution. I then offset 
// that by a fixed value to re-center the coordinate system.
  vec2 uv = fragCoord / resolution - vec2(0.5);

// For each fragment, create a ray at a fixed point of origin directed at
// the coordinates of each fragment.
  Ray ray = calcFragmentRay(uv);

  float mask = 1.0; // accumulates reflected light (fresnel coefficient)
  vec3 color = vec3(0.0); // accumulates color
  for (int i=0; i <= iterations; i++) {
    Intersect hit;
    if (intObjs(ray.o, ray.dir, hit)) {
      
      float sunDist = 0.0;
      color += mask * calcShading(ray, hit, uv, sunDist);

//       float fresnel = calcFresnel(hit.norm, ray.dir, 0.0);

// The sun
      mask *= sunDist;
// The original ray doesn't change
// This allows to shade objects behind Sun's Corona
      ray.o = hit.pos + eps * ray.dir;
    } else {
// If the trace failed
      color += mask * vec3(0.0);
      break;
    }
  }

// Adjust for exposure and perform linear gamma correction
//   color = pow(color * exposure, vec3(1.0 / gamma));

  return color;
}