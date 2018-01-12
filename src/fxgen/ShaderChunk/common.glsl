// #extension GL_OES_standard_derivatives : enable
precision highp float;
#define PI 3.14159265359
#define PI2 6.28318530718
#define INV_PI 0.31830988618
#define INV_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6


// handy value clamping to 0 - 1 range
// #define saturate(a) clamp(a, 0.0, 1.0)
#define whiteCompliment(a) (1.0 - saturate(a))


float pow2(const in float x) { return x*x; }
float pow3(const in float x) { return x*x*x; }
float pow4(const in float x) { float x2 = x*x; return x2*x2; }
float pow5(const in float x) { float x2 = x*x; return x2*x2*x; }
float averate(const in vec3 color) { return dot(color, vec3(0.3333)); }

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

struct PSInput {
  vec2 position;
  vec2 mouse;
  vec2 coord;
  vec2 uv;
};

struct PSOutput {
  vec3 color;
  float opacity;
};