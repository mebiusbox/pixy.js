void computeTubeLight(const in TubeLight tubeLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {
  
  vec3 N = geometry.normal;
  vec3 V = geometry.viewDir;
  
  vec3 r = reflect(-V, N);
  vec3 L0 = tubeLight.start - geometry.position;
  vec3 L1 = tubeLight.end - geometry.position;
  float Ld0 = length(L0);
  float Ld1 = length(L1);
  float NoL0 = dot(L0, N) / (2.0 * Ld0);
  float NoL1 = dot(L1, N) / (2.0 * Ld1);
  float NoL = (2.0 * clamp(NoL0 + NoL1, 0.0, 1.0)) / (Ld0 * Ld1 + dot(L0,L1) + 2.0);
  vec3 Lv = L1-L0;
  float RoL0 = dot(r, L0);
  float RoLv = dot(r, Lv);
  float LoLv = dot(L0, Lv);
  float Ld = length(Lv);
  float t = (RoL0 * RoLv - LoLv) / (Ld*Ld - RoLv*RoLv);
  
  vec3 closestPoint = L0 + Lv * clamp(t, 0.0, 1.0);
  vec3 centerToRay = dot(closestPoint, r) * r - closestPoint;
  closestPoint = closestPoint + centerToRay * clamp(tubeLight.radius / length(centerToRay), 0.0, 1.0);
  vec3 Ln = normalize(closestPoint);
  
  // float NoL = saturate(dot(N, Ln));
  float NoV = saturate(dot(N, V));
  vec3 H = normalize(Ln+V);
  float NoH = saturate(dot(N, H));
  float VoH = saturate(dot(V, H));
  float LoV = saturate(dot(Ln, V));
  float a = pow2(material.specularRoughness);
  
  Ld = length(closestPoint);
  float Lc = pow(saturate(-Ld / tubeLight.distance + 1.0), tubeLight.decay);
  float alphaPrime = clamp(tubeLight.radius / (Ld*2.0) + a, 0.0, 1.0);
  float D = D_GGX_AreaLight(a, alphaPrime, NoH);
  float G = PBR_Specular_G(material.specularRoughness, NoV, NoL, NoH, VoH, LoV);
  vec3 F = PBR_Specular_F(material.specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);
  
  vec3 cdiff = DiffuseLambert(material.diffuseColor);
  vec3 cspec = F*(G*D);
  
  // vec3 irradiance = areaLight.color * NoL * Lc;
  vec3 irradiance = tubeLight.color * Lc;
  irradiance *= PI; // punctual light
  
  reflectedLight.directDiffuse += irradiance * cdiff;
  reflectedLight.directSpecular += irradiance * cspec;
}