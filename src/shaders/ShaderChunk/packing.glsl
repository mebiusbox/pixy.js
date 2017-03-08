vec3 packNormalToRGB(const in vec3 normal) {
  return normalize(normal) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal(const in vec3 rgb) {
  return 1.0 - 2.0 * rgb.xyz;
}

const vec3 PackFactors = vec3(255.0, 65025.0, 16581375.0);
const vec4 UnpackFactors = vec4(1.0, 1.0 / PackFactors);
const float ShiftRight8 = 1.0 / 255.0;
// const float PackUpscale = 256.0 / 255.0; // fraction -> 0..1 (including 1)
// const float UnpackDownscale = 255.0 / 256.0; // 0..1 -> fraction (excluding 1)
// const vec3 PackFactors = vec3(256.0, 65535.0, 16777216.0);
// const vec4 UnpackFactors = UnpackDownscale / vec4(1.0, PackFactors);
// const float ShiftRight8 = 1.0 / 256.0;
vec4 packDepthToRGBA(float v) {
  vec4 r = vec4(v, fract(PackFactors * v));
  r.xyz -= r.yzw * ShiftRight8;
//   return r * PackUpscale;
  return r;
}

float unpackRGBAToDepth(vec4 rgba) {
  return dot(rgba, UnpackFactors);
}


// NOTE: viewZ/eyeZ is < 0 when in front of the camera per OpenGL conventions

float viewZToOrthographicDepth(const in float viewZ, const in float near, const in float far) {
  return (viewZ + near) / (near - far);
}

float orthographicDepthToViewZ(const in float linearClipZ, const in float near, const in float far) {
  return linearClipZ * (near - far) - near;
}

float viewZToPerspectiveDepth(const in float viewZ, const in float near, const in float far) {
  return ((near + viewZ) * far) / ((far - near) * viewZ);
}

float perspectiveDepthToViewZ(const in float invClipZ, const in float near, const in float far) {
  return (near * far) / ((far - near) * invClipZ - far);
}