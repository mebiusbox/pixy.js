#define PI 3.14159265359
#define PI2 6.28318530718
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6

// handy value clamping to 0 - 1 range
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteCompliment(a) (1.0 - saturate(a))

float pow2(const in float x) { return x*x; }
float pow3(const in float x) { return x*x*x; }
float pow4(const in float x) { float x2 = x*x; return x2*x2; }
float pow5(const in float x) { float x2 = x*x; return x2*x2*x; }
float average(const in vec3 color) { return dot(color, vec3(0.3333)); }
float rcp(const in float x) { return 1.0/x; }

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(const in vec2 uv) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);
  return fract(sin(sn) * c);
}

struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};

struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};

struct GeometricContext {
  vec3 position;
  vec3 normal;
  vec3 viewDir;
};

struct Material {
  vec3 diffuseColor;
  float opacity;
  float specularRoughness;
  vec3 specularColor;
};

vec3 transformDirection(in vec3 dir, in mat4 matrix) {
  return normalize((matrix * vec4(dir, 0.0)).xyz);
}

// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
  return normalize((vec4(dir, 0.0) * matrix).xyz);
}

vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {
  float distance = dot(planeNormal, point - pointOnPlane);
  return -distance * planeNormal + point;
}

float sideOfPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {
  return sign(dot(point - pointOnPlane, planeNormal));
}

vec3 linePlaneIntersect(in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal) {
  return lineDirection * (dot(planeNormal, pointOnPlane - pointOnLine) / dot(planeNormal, lineDirection)) + pointOnLine;
}

vec4 GammaToLinear(in vec4 value, in float gammaFactor) {
  return vec4(pow(value.xyz, vec3(gammaFactor)), value.w);
}
vec4 LinearToGamma(in vec4 value, in float gammaFactor) {
  return vec4(pow(value.xyz, vec3(1.0/gammaFactor)), value.w);
}
