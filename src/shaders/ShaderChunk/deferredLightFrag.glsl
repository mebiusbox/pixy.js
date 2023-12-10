#include <packing>
#define PI 3.14159265359
#define RECIPROCAL_PI 0.31830988618
#ifndef saturate
#define saturate(x) clamp(x, 0.0, 1.0)
#endif
float pow2(const in float x) { return x*x; }
vec3 transformDirection(in vec3 dir, in mat4 matrix) {
  return normalize((matrix * vec4(dir, 0.0)).xyz);
}
vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
  return normalize((vec4(dir, 0.0) * matrix).xyz);
}
vec4 GammaToLinear(in vec4 value, in float gammaFactor) {
  return vec4(pow(value.xyz, vec3(gammaFactor)), value.w);
}
vec4 LinearToGamma(in vec4 value, in float gammaFactor) {
  return vec4(pow(value.xyz, vec3(1.0/gammaFactor)), value.w);
}
// #define NUM_POINT_LIGHT 300
struct PointLight {
  vec3 position;
  vec3 color;
};

uniform PointLight pointLights[NUM_POINT_LIGHT];
uniform int numPointLights;
uniform float cutoffDistance;
uniform float decayExponent;
uniform float metalness;
uniform float reflectionStrength;
uniform vec3 viewPosition;
uniform mat4 viewInverse;
uniform mat4 viewProjectionInverse;
uniform sampler2D gbuf0; // [rgb-] normal
uniform sampler2D gbuf1; // [rgb-] albedo [---w] roughness
uniform sampler2D tDepth;
uniform samplerCube tEnvMap;
varying vec2 vUv;


// [ Lazarov 2013 "Getting More Physical in Call of Duty: Black Ops II" ]
// Adaptation to fit our G term
// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
// BRDF_Specular_GGX_Environment
vec3 EnvBRDFApprox(vec3 specularColor, float roughness, float NoV) {
  const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);
  const vec4 c1 = vec4(1, 0.0425, 1.04, -0.04 );
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
  return specularColor * AB.x + AB.y;
}

// three.js (bsdfs.glsl)
// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html
float GGXRoughnessToBlinnExponent(const in float ggxRoughness) {
  return 2.0 / pow2(ggxRoughness + 0.0001) - 2.0;
}

float BlinnExponentToGGXRoughness(const in float blinnExponent) {
  return sqrt(2.0 / (blinnExponent + 2.0));
}

// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
float getSpecularMipLevel(const in float blinnShininessExponent, const in int maxMipLevel) {
  float maxMipLevelScalar = float(maxMipLevel);
  float desiredMipLevel = maxMipLevelScalar - 0.79248 - 0.5 * log2(pow2(blinnShininessExponent)+1.0);
  
  // clamp to allowable LOD ranges
  return clamp(desiredMipLevel, 0.0, maxMipLevelScalar);
}

vec3 getLightProbeIndirectIrradiance(const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {
  return GammaToLinear(textureCubeLodEXT(tEnvMap, N, float(maxMipLevel)), 2.2).rgb * reflectionStrength;
}

vec3 getLightProbeIndirectRadiance(const in vec3 V, const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {
  vec3 reflectVec = reflect(-V, N);
  float specMipLevel = getSpecularMipLevel(blinnShininessExponent, maxMipLevel);
  return GammaToLinear(textureCubeLodEXT(tEnvMap, reflectVec, specMipLevel), 2.2).rgb * reflectionStrength;
}


vec3 DiffuseLambert(vec3 diffuseColor) {
  return RECIPROCAL_PI * diffuseColor;
}

float D_GGX(float a, float NoH) {
  // Isotropic ggx
  float a2 = a*a;
  float NoH2 = NoH*NoH;
  float d = NoH2 * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

float G_Smith_Schlick_GGX(float a, float NoV, float NoL) {
  float k = a * a * 0.5;
  float gl = NoL / (NoL * (1.0 - k) + k);
  float gv = NoV / (NoV * (1.0 - k) + k);
  return gl*gv;
}

vec3 F_Schlick(vec3 specularColor, float VoH) {

  // Original approximation by Christophe Schlick '94
  // "float fresnel = pow(1.0 - product, 5.0);",
  
  // Optimized variant (presented by Epic at SIGGRAPH '13)
  float fresnel = exp2((-5.55473 * VoH - 6.98316) * VoH);
  
  return specularColor + (vec3(1.0) - specularColor) * fresnel;
}

float Specular_D(float a, float NoH) {
  return D_GGX(a, NoH);
}

float Specular_G(float a, float NoV, float NoL, float NoH, float VoH, float LoV) {
  return G_Smith_Schlick_GGX(a, NoV, NoL);
}

vec3 Specular_F(vec3 specularColor, vec3 H, vec3 V) {
  return F_Schlick(specularColor, saturate(dot(H,V)));
}

vec3 Specular(vec3 specularColor, vec3 H, vec3 V, vec3 L, float a, float NoL, float NoV, float NoH, float VoH, float LoV) {
  float D = Specular_D(a, NoH);
  float G = Specular_G(a, NoV, NoL, NoH, VoH, LoV);
  vec3 F = Specular_F(specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);
  return F * (G * D);
}

vec3 ComputeLight(vec3 albedoColor, vec3 specularColor, vec3 N, float roughness, vec3 L, vec3 Lc, vec3 V) {
  // Compute some useful values
  float NoL = saturate(dot(N, L));
  float NoV = saturate(dot(N, V));
  vec3 H = normalize(L+V);
  float NoH = saturate(dot(N, H));
  float VoH = saturate(dot(V, H));
  float LoV = saturate(dot(L, V));
  
  float a = pow2(roughness);
  
  vec3 cdiff = DiffuseLambert(albedoColor);
  vec3 cspec = Specular(specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);
  
  return Lc * NoL * (cdiff + cspec);
}

void main() {
  vec4 normalDepth = texture2D(gbuf0, vUv);
  if (normalDepth.x + normalDepth.y + normalDepth.z == 0.0) discard;
  
  vec4 diffuseRoughness = texture2D(gbuf1, vUv);
  vec4 diffuse = GammaToLinear(diffuseRoughness, 2.2);
  vec4 depthRGBA = texture2D(tDepth, vUv);
  float depth = depthRGBA.x * 2.0 - 1.0;
  vec4 HPos = viewProjectionInverse * vec4(vUv*2.0-1.0, depth, 1.0);
  vec3 worldPosition = HPos.xyz / HPos.w;
  vec3 Nn = normalDepth.xyz * 2.0 - 1.0;
  Nn = transformDirection(Nn, viewInverse);
  vec3 viewDir = normalize(viewPosition - worldPosition);
  
  float roughnessFactor = max(0.04, diffuseRoughness.w);
  vec3 cdiff = mix(diffuse.xyz, vec3(0.0), metalness);
  vec3 cspec = mix(vec3(0.04), diffuse.xyz, metalness);

  vec3 finalColor = vec3(0.0);
  for (int i=0; i<NUM_POINT_LIGHT; ++i) {
    if (i >= numPointLights) break;
    
    vec3 L = pointLights[i].position - worldPosition;
    float Ld = length(L);
    if (cutoffDistance == 0.0 || Ld < cutoffDistance) {
      
      float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), decayExponent);
      vec3 irradiance = pointLights[i].color * Lc;
      irradiance *= PI; // punctual light
      
      vec3 Ln = normalize(L);
      finalColor += ComputeLight(cdiff, cspec, Nn, roughnessFactor, Ln, irradiance, viewDir);
    }
  }
  
  vec3 indirect_irradiance = getLightProbeIndirectIrradiance(Nn, GGXRoughnessToBlinnExponent(roughnessFactor), 10) * PI;
  vec3 diffIBL = indirect_irradiance * DiffuseLambert(cdiff);
  finalColor += diffIBL;
  
  float NoV = saturate(dot(Nn, viewDir));
  vec3 radiance = getLightProbeIndirectRadiance(viewDir, Nn, GGXRoughnessToBlinnExponent(roughnessFactor), 10);
  finalColor += radiance * EnvBRDFApprox(cspec, roughnessFactor, NoV);
  
  gl_FragColor = LinearToGamma(vec4(finalColor, 1.0), 2.2);
}