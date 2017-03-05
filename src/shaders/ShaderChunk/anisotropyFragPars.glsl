// http://asura.iaigiri.com/XNA_GS/xna19.html
uniform float anisotropyExponent;
uniform float anisotropyStrength;
uniform float anisotropyFresnel;
uniform vec3 anisotropyColor;
// varying vec3 vObjPosition;
// vec3 AnisotropyDiffuseTerm(vec3 Rd, vec3 Rs, vec3 N, vec3 k1, vec3 k2) {
//   vec3 term1 = ((28.0 * Rd) / (23.0 * PI)) * (1.0 - Rs);
//   float term2 = (1.0 - pow5(1.0 - dot(N, k1) * 0.5));
//   float term3 = (1.0 - pow5(1.0 - dot(N, k2) * 0.5));
//   return term1 * term2 * term3;
// }
// float nu = 1.0
float AnisotropySpecularTerm(float nv, vec3 N, vec3 H, vec3 L, vec3 V, vec3 T, vec3 B, float F) {
  float HU = dot(H, T);
  float HV = dot(H, B);
  float HN = dot(H, N);
  float HK = dot(H, L);
  float NL = dot(N, L);
  float NV = dot(N, V);
//   float exponent = ((nu * HU * HU) + (nv * HV * HV)) / (1.0 - HN * HN);
//   float term1 = sqrt((nu + 1.0) * (nv + 1.0)) / (8.0 * PI);
  float exponent = ((HU * HU) + (nv * HV * HV)) / (1.0 - HN * HN);
  float term1 = sqrt(2.0 * (nv + 1.0)) / (8.0 * PI);
  float term2 = pow(HN, exponent) / (HK * max(NL, NV));
  float fresnel = F + (1.0 - F) * (1.0 - pow5(HK));
  return term1 * term2 * fresnel;
}