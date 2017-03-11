void computeAreaLight(const in AreaLight areaLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {
  vec3 L = areaLight.position - geometry.position;
  float Ld = length(L);

  if (areaLight.distance == 0.0 || Ld < areaLight.distance) {
    
    vec3 Ln = normalize(L);
  
    vec3 N = geometry.normal;
    vec3 V = geometry.viewDir;
  
    vec3 r = reflect(-V,N);
    vec3 centerToRay = dot(L,r)*r - L;
    vec3 closestPoint = L + centerToRay * clamp(areaLight.radius / length(centerToRay), 0.0, 1.0);
    Ln = normalize(closestPoint);
    
    float NoL = saturate(dot(N, Ln));
    float NoV = saturate(dot(N, V));
    vec3 H = normalize(Ln+V);
    float NoH = saturate(dot(N, H));
    float VoH = saturate(dot(V, H));
    float LoV = saturate(dot(Ln, V));
    float a = pow2(material.specularRoughness);
    
    float Lc = pow(saturate(-Ld / areaLight.distance + 1.0), areaLight.decay);
    float alphaPrime = clamp(areaLight.distance / (Ld*2.0) + a, 0.0, 1.0);
    float D = D_GGX_AreaLight(a, alphaPrime, NoH);
    float G = PBR_Specular_G(material.specularRoughness, NoV, NoL, NoH, VoH, LoV);
    vec3 F = PBR_Specular_F(material.specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);
    
    vec3 cdiff = DiffuseLambert(material.diffuseColor);
    vec3 cspec = F*(G*D);
    
    vec3 irradiance = areaLight.color * NoL * Lc;
    irradiance *= PI; // punctual light
    
    reflectedLight.directDiffuse += irradiance * cdiff;
    reflectedLight.directSpecular += irradiance * cspec;
  }
}