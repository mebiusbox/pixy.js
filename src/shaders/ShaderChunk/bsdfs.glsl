vec3 DiffuseLambert(vec3 diffuseColor) {
  return RECIPROCAL_PI * diffuseColor;
}

// KANSAI CEDEC2015: Final Fantasy 零式HD リマスター
vec3 DiffuseOrenNayar(vec3 diffuseColor, float NoV, float NoL, float LoV, float roughness) {
  float s = LoV - NoL * NoV;
  float t = rcp(max(NoL, NoV) + 1e-5);
  t = (s < 0.0) ? 1.0 : t;
  float st = s*t;
  
  // ラフネスが 0.0 ～ 1.0 になるように限定すると高速近似可能
  // 参照：A tiny improvement of Oren-Nayar reflectance model
  // http://mimosa-pudica.net/improved-oren-nayar.html
  float a = rcp((PI * 0.5 - 2.0/3.0) * roughness + PI);
  float b = roughness * a;
  return diffuseColor * NoL * (a + b*st);
}

// compute fresnel specular factor for given base specular and product
// product could be NoV or VoH depending on used technique
// vec3 F_Schlick(vec3 f0, float product) {
//   return mix(f0, vec3(1.0), pow(1.0 - product, 5.0));
// }

vec3 F_Schlick(vec3 specularColor, vec3 H, vec3 V) {
  return (specularColor + (1.0 - specularColor) * pow(1.0 - saturate(dot(V, H)), 5.0));
}

vec3 F_SchlickApprox(vec3 specularColor, float VoH) {

  // Original approximation by Christophe Schlick '94
  // float fresnel = pow(1.0 - product, 5.0);
  
  // Optimized variant (presented by Epic at SIGGRAPH '13)
  float fresnel = exp2((-5.55473 * VoH - 6.98316) * VoH);
  
  // Anything less than 2% is physically impossible and is instead considered to be shadowing
  // return specularColor + (saturate(50.0 * specularColor.g) - specularColor) * fresnel;
  return specularColor + (vec3(1.0) - specularColor) * fresnel;
}

vec3 F_CookTorrance(vec3 specularColor, vec3 H, vec3 V) {
  vec3 n = (1.0 + sqrt(specularColor)) / (1.0 - sqrt(specularColor));
  float c = saturate(dot(V, H));
  vec3 g = sqrt(n * n + c * c - 1.0);
  
  vec3 part1 = (g - c) / (g + c);
  vec3 part2 = ((g + c) * c - 1.0) / ((g - c) * c + 1.0);
  
  return max(vec3(0.0), 0.5 * part1 * part1 * (1.0 + part2 + part2));
}


/// SPECULAR D: MICROFACET DISTRIBUTION FUNCTION

// Microfacet Models for Refraction through Rough Surface - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// "a" is "roughness squared" in Disney 's reparameterization
float D_GGX(float a, float NoH) {
  // Isotropic ggx
  float a2 = a*a;
  float NoH2 = NoH*NoH;
  float d = NoH2 * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

float D_GGX_AreaLight(float a, float aP, float NoH) {
  float a2 = a*a;
  float aP2 = aP*aP;
  float NoH2 = NoH*NoH;
  float d = NoH2 * (a2 - 1.0) + 1.0;
  return (a2*aP2) / (pow(NoH2 * (a2-1.0) + 1.0, 2.0) * PI);
}

// following functions are copies fo UE4
// for computing cook-torrance specular lighitng terms
// https://gist.github.com/galek/53557375251e1a942dfa
float D_Blinn(in float a, in float NoH) {
  float a2 = a * a;
  float n = 2.0 / (a2*a2) - 2.0;
  return (n + 2.0) / (2.0 * PI) * pow(NoH, n);
}

float D_BlinnPhong(float a, float NoH) {
  float a2 = a * a;
  return (1.0 / (PI * a2)) * pow(NoH, 2.0 / a2 - 2.0);
}

// https://gist.github.com/galek/53557375251e1a942dfa
float D_Beckmann(float a, float NoH) {
  float a2 = a * a;
  float NoH2 = NoH * NoH;
  
  return (1.0 / (PI * a2 * NoH2 * NoH2 + 1e-5)) * exp((NoH2 - 1.0) / (a2 * NoH2));
}


/// SPECULAR G: GEOMETRIC ATTENUATION


float G_Implicit(float a, float NoV, float NoL) {
  return NoL * NoL;
}

float G_BlinngPhong_Implicit(float a, float NoV, float NoL) {
  // geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
  return 0.25;
}

float G_Newmann(float a, float NoV, float NoL) {
  return (NoL * NoV) / max(NoL, NoV);
}

float G_CookTorrance(float a, float NoV, float NoL, float NoH, float VoH) {
  return min(1.0, min((2.0 * NoH * NoV) / VoH, (2.0 * NoH * NoL) / VoH));
}

float G_Kelemen(float a, float NoV, float NoL, float LoV) {
  return (2.0 * NoL * NoV) / (1.0 + LoV);
}

float G_Beckmann(float a, float product) {
  float c = product / (a * sqrt(1.0 - product * product));
  if (c >= 1.6) {
    return 1.0;
  }
  else {
    float c2 = c * c;
    return (3.535 * c + 2.181 * c2) / (1.0 + 2.276 * c + 2.577 * c2);
  }
}

float G_Smith_Beckmann(float a, float NoV, float NoL) {
  return G_Beckmann(a, NoV) * G_Beckmann(a, NoL);
}

// Smith approx
// Microfacet Models for Refraction through Rough Surface - equation (34)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// "a" is "roughness squared" in Disney 's reparameterization
float G_Smith_GGX(float a, float NoV, float NoL) {
  // geometry term = dot(G(l), G(v)) / 4 * dot(n,l) * dot(n,v)
  float a2 = a * a;
  float gl = NoL + sqrt(a2 + (1.0 - a2) * pow2(NoL));
  float gv = NoV + sqrt(a2 + (1.0 - a2) * pow2(NoV));
  return 1.0 / (gl*gv);
}

// from page 12, listing 2 of http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
float G_SmithCorrelated_GGX(float a, float NoV, float NoL) {
  float a2 = a * a;
  
  // NoL and NoV are explicitly swapped. This is not a mistake
  float gv = NoL * sqrt(a2 + (1.0 - a2) * pow2(NoV));
  float gl = NoV * sqrt(a2 + (1.0 - a2) * pow2(NoL));
  
  return 0.5 / max(gv+gl, EPSILON);
}

// Schlick's Geometric approximation. Note this is edited by Epic to match
// a modification disney made (And ignoring there modifications,
// if you want to do your own research you need to know up front the Schlick originally
// approximated the wrong fomula, so be careful to make sure you choose the corrected
// Schlick if you find it online)
float G_Smith_Schlick_GGX(float a, float NoV, float NoL) {
  float k = a * a * 0.5;
  float gl = NoL / (NoL * (1.0 - k) + k);
  float gv = NoV / (NoV * (1.0 - k) + k);
  return gl*gv;
}

float G_Schlick(in float a, in float NoV, in float NoL) {
  float k = a * 0.5;
  float V = NoV * (1.0 - k) + k;
  float L = NoL * (1.0 - k) + k;
  return 0.25 / (V * L);
}

float G_SchlickApprox(in float a, in float NdotV, in float NdotL) {
  float V = NdotL * (NdotV * (1.0 - a) + a);
  float L = NdotV * (NdotL * (1.0 - a) + a);
  return 0.5 / (V + L + 1e-5);
}

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

/// DISNEY

float F_Schlick_Disney(float u) {
  float m = saturate(1.0 - u);
  float m2 = m * m;
  return m2 * m2 * m;
}

float GTR2_aniso(float NoH, float HoX, float HoY, float ax, float ay) {
  return 1.0 / (PI * ax*ay * pow2(pow2(HoX/ax) + pow2(HoY/ay) + NoH*NoH));
}
    
float smithG_GGX(float NoV, float alphaG) {
  float a = alphaG * alphaG;
  float b = NoV * NoV;
  return 1.0 / (NoV + sqrt(a + b - a*b));
}
    
float GTR1(float NoH, float a) {
  if (a >= 1.0) {
    return 1.0 / PI;
  }
      
  float a2 = a*a;
  float t = 1.0 + (a2 - 1.0) * NoH * NoH;
  return (a2 - 1.0) / (PI * log(a2) * t);
}