// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
float getSpecularMipLevel(const in float blinnShininessExponent, const in int maxMipLevel) {
  float maxMipLevelScalar = float(maxMipLevel);
  float desiredMipLevel = maxMipLevelScalar - 0.79248 - 0.5 * log2(pow2(blinnShininessExponent)+1.0);
  
  // clamp to allowable LOD ranges
  return clamp(desiredMipLevel, 0.0, maxMipLevelScalar);
}

vec3 getLightProbeIndirectIrradiance(const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {
  vec3 worldNormal = inverseTransformDirection(N, viewMatrix);
  vec3 queryVec = vec3(-worldNormal.x, worldNormal.yz); // flip
  return GammaToLinear(textureCubeLodEXT(tEnvMap, queryVec, float(maxMipLevel)), 2.2).rgb * reflectionStrength;
}

vec3 getLightProbeIndirectRadiance(const in vec3 V, const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {
  vec3 reflectVec = reflect(-V, N);
  reflectVec = inverseTransformDirection(reflectVec, viewMatrix);
  vec3 queryVec = vec3(-reflectVec.x, reflectVec.yz); // flip
  float specMipLevel = getSpecularMipLevel(blinnShininessExponent, maxMipLevel);
  return GammaToLinear(textureCubeLodEXT(tEnvMap, queryVec, specMipLevel), 2.2).rgb * reflectionStrength;
}