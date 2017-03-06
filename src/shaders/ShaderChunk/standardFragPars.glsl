uniform float roughness;
uniform float metalness;

float PBR_Specular_D(float a, float NoH) {
  // return D_BlinnPhong(a, NoH);
  // return D_Beckmann(a, NoH);
  return D_GGX(a, NoH);
}

float PBR_Specular_G(float a, float NoV, float NoL, float NoH, float VoH, float LoV) {
  // return G_Implicit(a, NoV, NoL);
  // return G_Neuman(a, NoV, NoL);
  // return G_CookTorrance(a, NoV, NoL, NoH, VoH);
  // return G_Keleman(a, NoV, NoL, LoV);
  // return G_Smith_Beckmann(a, NoV, NoL);
  // return G_Smith_GGX(a, NoV, NoL);
  return G_Smith_Schlick_GGX(a, NoV, NoL);
  // return G_SmithCorrelated_GGX(a, NoV, NoL);
}

vec3 PBR_Specular_F(vec3 specularColor, vec3 H, vec3 V) {
  // return F_None(specularColor);
  // return F_Schlick(specularColor, H, V);
  return F_SchlickApprox(specularColor, saturate(dot(H,V)));
  // return F_CookTorrance(specularColor, H, V);
}

// Calculates specular intensity according to the Cook - Torrance model
// F: Fresnel - 入射角に対する反射光の量
// D: Microfacet Distribution - 与えられた方向に向いているマイクロファセットの割合
// G: Geometrical Attenuation - マイクロファセットの自己シャドウ
vec3 PBR_Specular_CookTorrance(vec3 specularColor, vec3 H, vec3 V, vec3 L, float a, float NoL, float NoV, float NoH, float VoH, float LoV) {
  float D = PBR_Specular_D(a, NoH);
  float G = PBR_Specular_G(a, NoV, NoL, NoH, VoH, LoV);
  vec3 F = PBR_Specular_F(specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);
  return F * (D*G);
}
