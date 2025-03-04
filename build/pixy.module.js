import * as THREE$1 from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var accumulateFrag = "  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + emissive;";

var ambientFrag = "  reflectedLight.indirectDiffuse += ambientColor * material.diffuseColor;";

var ambientFragPars = "uniform vec3 ambientColor;\r\n\r\nvec3 getAmbientLightIrradiance(const in vec3 ambient) {\r\n  return ambient;\r\n}";

var ambientHemisphereFrag = "  reflectedLight.indirectDiffuse += mix(groundColor, ambientColor, (dot(geometry.normal, normalize(skyDirection)) + 1.0) * 0.5) * material.diffuseColor;";

var ambientHemisphereFragPars = "uniform vec3 groundColor;\r\nuniform vec3 skyDirection;";

const ambientHemisphereUniforms = {
	groundColor: { value: new THREE$1.Color( 0x404040 ) },
	skyDirection: { value: new THREE$1.Vector3( 0, 1, 0 ) },
};

const ambientUniforms = {
	ambientColor: { value: new THREE$1.Color( 0x0 ) },
};

var anisotropyFrag = "// vec3 H = normalize(directLight.direction + geometry.viewDir);\r\n\r\n// reflectedLight.directDiffuse += material.diffuseColor * AnisotropyDiffuseTerm(material.diffuseColor, anisotropyColor, geometry.normal, directLight.direction, geometry.viewDir) * NoL * anisotropyStrength;\r\n  reflectedLight.directSpecular += AnisotropySpecularTerm(anisotropyExponent, geometry.normal, H, directLight.direction, geometry.viewDir, vTangent, vBinormal, anisotropyFresnel) * anisotropyColor * NoL * anisotropyStrength;\r\n\r\n// vec3 vObjPosition = normalize(geometry.position);\r\n// vec3 asHL = normalize(directLight.direction + vObjPosition);\r\n// vec3 asHH = normalize(asHL + geometry.viewDir);\r\n// float asHHU = dot(asHH, vTangent);\r\n// float asHHV = dot(asHH, vBinormal);\r\n// float asHHN = dot(asHH, vNormal);\r\n// float asHHK = dot(asHH, asHL);\r\n// float asHNU = 1.0;\r\n// float asHNV = anisotropyExponent;\r\n// float asHTerm1 = sqrt((asHNU + 1.0) * (asHNV + 1.0)) / (8.0 * PI);\r\n// float asHexponent = ((asHNU * asHHU * asHHU) + (asHNV * asHHV * asHHV)) / (1.0 - asHHN * asHHN);\r\n// float asHTerm2 = pow(asHHN, asHexponent);\r\n// float asHFresnelTerm = (anisotropyFresnel + (1.0 - anisotropyFresnel) * (1.0 - (pow2(asHHK) * pow3(asHHK))));\r\n// float asHSpecTerm = min(1.0, asHTerm1 * asHTerm2 * asHFresnelTerm * anisotropyStrength);\r\n// reflectedLight.directSpecular += asHSpecTerm * NoL * anisotropyColor;";

var anisotropyFragPars = "// http://asura.iaigiri.com/XNA_GS/xna19.html\r\nuniform float anisotropyExponent;\r\nuniform float anisotropyStrength;\r\nuniform float anisotropyFresnel;\r\nuniform vec3 anisotropyColor;\r\n// varying vec3 vObjPosition;\r\n// vec3 AnisotropyDiffuseTerm(vec3 Rd, vec3 Rs, vec3 N, vec3 k1, vec3 k2) {\r\n//   vec3 term1 = ((28.0 * Rd) / (23.0 * PI)) * (1.0 - Rs);\r\n//   float term2 = (1.0 - pow5(1.0 - dot(N, k1) * 0.5));\r\n//   float term3 = (1.0 - pow5(1.0 - dot(N, k2) * 0.5));\r\n//   return term1 * term2 * term3;\r\n// }\r\n// float nu = 1.0\r\nfloat AnisotropySpecularTerm(float nv, vec3 N, vec3 H, vec3 L, vec3 V, vec3 T, vec3 B, float F) {\r\n  float HU = dot(H, T);\r\n  float HV = dot(H, B);\r\n  float HN = dot(H, N);\r\n  float HK = dot(H, L);\r\n  float NL = dot(N, L);\r\n  float NV = dot(N, V);\r\n//   float exponent = ((nu * HU * HU) + (nv * HV * HV)) / (1.0 - HN * HN);\r\n//   float term1 = sqrt((nu + 1.0) * (nv + 1.0)) / (8.0 * PI);\r\n  float exponent = ((HU * HU) + (nv * HV * HV)) / (1.0 - HN * HN);\r\n  float term1 = sqrt(2.0 * (nv + 1.0)) / (8.0 * PI);\r\n  float term2 = pow(HN, exponent) / (HK * max(NL, NV));\r\n  float fresnel = F + (1.0 - F) * (1.0 - pow5(HK));\r\n  return term1 * term2 * fresnel;\r\n}";

const anisotropyUniforms = {
	anisotropyExponent: { value: 100.0 },
	anisotropyStrength: { value: 1.0 },
	anisotropyFresnel: { value: 0.5 },
	anisotropyColor: { value: new THREE$1.Color() },
};

var antiAliasFrag = "uniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\n\r\n#define FXAA_REDUCE_MIN (1.0/128.0)\r\n#define FXAA_REDUCE_MUL (1.0/8.0)\r\n#define FXAA_SPAN_MAX 8.0\r\n\r\nvoid main() {\r\n  vec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * resolution).xyz;\r\n  vec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2( 1.0, -1.0)) * resolution).xyz;\r\n  vec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0,  1.0)) * resolution).xyz;\r\n  vec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2( 1.0,  1.0)) * resolution).xyz;\r\n  vec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy * resolution);\r\n  vec3 rgbM = rgbaM.xyz;\r\n  vec3 luma = vec3(0.299, 0.587, 0.114);\r\n\r\n  float lumaNW = dot(rgbNW, luma);\r\n  float lumaNE = dot(rgbNE, luma);\r\n  float lumaSW = dot(rgbSW, luma);\r\n  float lumaSE = dot(rgbSE, luma);\r\n  float lumaM  = dot(rgbM,  luma);\r\n  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n  vec2 dir;\r\n  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\r\n  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\r\n\r\n  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\r\n  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n  dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),\r\n            max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * resolution;\r\n  vec4 rgbA = (1.0/2.0) * (\r\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (1.0/3.0 - 0.5)) +\r\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (2.0/3.0 - 0.5)));\r\n  vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (\r\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (0.0/3.0 - 0.5)) +\r\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (3.0/3.0 - 0.5)));\r\n\r\n  float lumaB = dot(rgbB, vec4(luma, 0.0));\r\n\r\n  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {\r\n    gl_FragColor = rgbA;\r\n  } else {\r\n    gl_FragColor = rgbB;\r\n  }\r\n}";

const antiAliasUniforms = {
	tDiffuse: { value: null },
	resolution: { value: new THREE$1.Vector2( 1 / 1024, 1 / 512 ) },
};

var antiAliasVert = "void main() {\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var aoMapFrag = "  float obscure = texture2D(tAO, vUv).r * aoStrength;\r\n  reflectedLight.directDiffuse *= obscure;\r\n  reflectedLight.directDiffuse += reflectedLight.directSpecular * obscure;\r\n  reflectedLight.directSpecular = vec3(0.0);";

var aoMapFragPars = "uniform sampler2D tAO;\r\nuniform float aoStrength;";

const aoMapUniforms = {
	tAO: { value: null },
	aoStrength: { value: 1.0 },
};

var beginFrag = "  GeometricContext geometry;\r\n  geometry.position = -vViewPosition;\r\n  geometry.normal = normalize(vNormal);\r\n  geometry.viewDir = normalize(vViewPosition);\r\n\r\n  Material material;\r\n  material.diffuseColor = diffuseColor;\r\n  material.opacity = opacity;\r\n\r\n  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\r\n  vec3 emissive = vec3(0.0);";

var beginFragDebug = "vec3 debugColor = vec3(1.0, 0.0, 0.0);";

var billboardDefaultVert = "  mat3 invMatrix = mat3(ViewInverse[0].xyz, ViewInverse[1].xyz, ViewInverse[2].xyz);";

var billboardRotZVertEnd = "  vec3 rotX = vec3(0.0);\r\n  vec3 rotY = vec3(0.0);\r\n  vec3 rotZ = vec3(0.0);\r\n  if (wscale.x > 0.0) rotX = row0 / wscale.x;\r\n  if (wscale.y > 0.0) rotY = row1 / wscale.y;\r\n  if (wscale.z > 0.0) rotZ = row2 / wscale.z;\r\n  vec3 pos = invMatrix * mat3(rotX, rotY, rotZ) * position;\r\n  vec3 wpos = pos * wscale + wtrans;\r\n  vec4 hpos = projectionMatrix * viewMatrix * vec4(wpos, 1.0);";

const billboardUniforms = {
	ViewInverse: { value: new THREE$1.Matrix4() },
};

var billboardVert = "void main() {\r\n  vec3 row0 = vec3(modelMatrix[0].x, modelMatrix[1].x, modelMatrix[2].x);\r\n  vec3 row1 = vec3(modelMatrix[0].y, modelMatrix[1].y, modelMatrix[2].y);\r\n  vec3 row2 = vec3(modelMatrix[0].z, modelMatrix[1].z, modelMatrix[2].z);\r\n  vec3 wscale = vec3(length(row0), length(row1), length(row2));\r\n  vec3 wtrans = modelMatrix[3].xyz;";

var billboardVertEnd = "  vec3 pos = invMatrix * position;\r\n  vec3 wpos = pos * wscale + wtrans;\r\n  vec4 hpos = projectionMatrix * viewMatrix * vec4(wpos, 1.0);\r\n//   mat4 matrix = projectionMatrix * modelViewMatrix;\r\n//   vec4 hpos;\r\n//   hpos.x = dot(position, vec3(matrix[0].x, matrix[1].x, matrix[2].x)) + matrix[3].x;\r\n//   hpos.y = dot(position, vec3(matrix[0].y, matrix[1].y, matrix[2].y)) + matrix[3].y;\r\n//   hpos.z = dot(position, vec3(matrix[0].z, matrix[1].z, matrix[2].z)) + matrix[3].z;\r\n//   hpos.w = dot(position, vec3(matrix[0].w, matrix[1].w, matrix[2].w)) + matrix[3].w;\r\n//   hpos = matrix * vec4(position, 1.0);";

var billboardVertPars = "uniform mat4 ViewInverse;";

var billboardYVert = "  mat3 invMatrix;\r\n  invMatrix[2] = normalize(vec3(ViewInverse[2].x, 0.0, ViewInverse[2].z));\r\n  invMatrix[0] = normalize(cross(vec3(0.0, 1.0, 0.0), invMatrix[2]));\r\n  invMatrix[1] = cross(invMatrix[2], invMatrix[0]);";

var bsdfs = "vec3 DiffuseLambert(vec3 diffuseColor) {\r\n  return RECIPROCAL_PI * diffuseColor;\r\n}\r\n\r\n// KANSAI CEDEC2015: Final Fantasy 零式HD リマスター\r\nvec3 DiffuseOrenNayar(vec3 diffuseColor, float NoV, float NoL, float LoV, float roughness) {\r\n  float s = LoV - NoL * NoV;\r\n  float t = rcp(max(NoL, NoV) + 1e-5);\r\n  t = (s < 0.0) ? 1.0 : t;\r\n  float st = s*t;\r\n  \r\n  // ラフネスが 0.0 ～ 1.0 になるように限定すると高速近似可能\r\n  // 参照：A tiny improvement of Oren-Nayar reflectance model\r\n  // http://mimosa-pudica.net/improved-oren-nayar.html\r\n  float a = rcp((PI * 0.5 - 2.0/3.0) * roughness + PI);\r\n  float b = roughness * a;\r\n  return diffuseColor * NoL * (a + b*st);\r\n}\r\n\r\n// compute fresnel specular factor for given base specular and product\r\n// product could be NoV or VoH depending on used technique\r\n// vec3 F_Schlick(vec3 f0, float product) {\r\n//   return mix(f0, vec3(1.0), pow(1.0 - product, 5.0));\r\n// }\r\n\r\nvec3 F_Schlick(vec3 specularColor, vec3 H, vec3 V) {\r\n  return (specularColor + (1.0 - specularColor) * pow(1.0 - saturate(dot(V, H)), 5.0));\r\n}\r\n\r\nvec3 F_SchlickApprox(vec3 specularColor, float VoH) {\r\n\r\n  // Original approximation by Christophe Schlick '94\r\n  // float fresnel = pow(1.0 - product, 5.0);\r\n  \r\n  // Optimized variant (presented by Epic at SIGGRAPH '13)\r\n  float fresnel = exp2((-5.55473 * VoH - 6.98316) * VoH);\r\n  \r\n  // Anything less than 2% is physically impossible and is instead considered to be shadowing\r\n  // return specularColor + (saturate(50.0 * specularColor.g) - specularColor) * fresnel;\r\n  return specularColor + (vec3(1.0) - specularColor) * fresnel;\r\n}\r\n\r\nvec3 F_CookTorrance(vec3 specularColor, vec3 H, vec3 V) {\r\n  vec3 n = (1.0 + sqrt(specularColor)) / (1.0 - sqrt(specularColor));\r\n  float c = saturate(dot(V, H));\r\n  vec3 g = sqrt(n * n + c * c - 1.0);\r\n  \r\n  vec3 part1 = (g - c) / (g + c);\r\n  vec3 part2 = ((g + c) * c - 1.0) / ((g - c) * c + 1.0);\r\n  \r\n  return max(vec3(0.0), 0.5 * part1 * part1 * (1.0 + part2 + part2));\r\n}\r\n\r\n\r\n/// SPECULAR D: MICROFACET DISTRIBUTION FUNCTION\r\n\r\n// Microfacet Models for Refraction through Rough Surface - equation (33)\r\n// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html\r\n// \"a\" is \"roughness squared\" in Disney 's reparameterization\r\nfloat D_GGX(float a, float NoH) {\r\n  // Isotropic ggx\r\n  float a2 = a*a;\r\n  float NoH2 = NoH*NoH;\r\n  float d = NoH2 * (a2 - 1.0) + 1.0;\r\n  return a2 / (PI * d * d);\r\n}\r\n\r\nfloat D_GGX_AreaLight(float a, float aP, float NoH) {\r\n  float a2 = a*a;\r\n  float aP2 = aP*aP;\r\n  float NoH2 = NoH*NoH;\r\n  float d = NoH2 * (a2 - 1.0) + 1.0;\r\n  return (a2*aP2) / (pow(NoH2 * (a2-1.0) + 1.0, 2.0) * PI);\r\n}\r\n\r\n// following functions are copies fo UE4\r\n// for computing cook-torrance specular lighitng terms\r\n// https://gist.github.com/galek/53557375251e1a942dfa\r\nfloat D_Blinn(in float a, in float NoH) {\r\n  float a2 = a * a;\r\n  float n = 2.0 / (a2*a2) - 2.0;\r\n  return (n + 2.0) / (2.0 * PI) * pow(NoH, n);\r\n}\r\n\r\nfloat D_BlinnPhong(float a, float NoH) {\r\n  float a2 = a * a;\r\n  return (1.0 / (PI * a2)) * pow(NoH, 2.0 / a2 - 2.0);\r\n}\r\n\r\n// https://gist.github.com/galek/53557375251e1a942dfa\r\nfloat D_Beckmann(float a, float NoH) {\r\n  float a2 = a * a;\r\n  float NoH2 = NoH * NoH;\r\n  \r\n  return (1.0 / (PI * a2 * NoH2 * NoH2 + 1e-5)) * exp((NoH2 - 1.0) / (a2 * NoH2));\r\n}\r\n\r\n\r\n/// SPECULAR G: GEOMETRIC ATTENUATION\r\n\r\n\r\nfloat G_Implicit(float a, float NoV, float NoL) {\r\n  return NoL * NoL;\r\n}\r\n\r\nfloat G_BlinngPhong_Implicit(float a, float NoV, float NoL) {\r\n  // geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)\r\n  return 0.25;\r\n}\r\n\r\nfloat G_Newmann(float a, float NoV, float NoL) {\r\n  return (NoL * NoV) / max(NoL, NoV);\r\n}\r\n\r\nfloat G_CookTorrance(float a, float NoV, float NoL, float NoH, float VoH) {\r\n  return min(1.0, min((2.0 * NoH * NoV) / VoH, (2.0 * NoH * NoL) / VoH));\r\n}\r\n\r\nfloat G_Kelemen(float a, float NoV, float NoL, float LoV) {\r\n  return (2.0 * NoL * NoV) / (1.0 + LoV);\r\n}\r\n\r\nfloat G_Beckmann(float a, float product) {\r\n  float c = product / (a * sqrt(1.0 - product * product));\r\n  if (c >= 1.6) {\r\n    return 1.0;\r\n  }\r\n  else {\r\n    float c2 = c * c;\r\n    return (3.535 * c + 2.181 * c2) / (1.0 + 2.276 * c + 2.577 * c2);\r\n  }\r\n}\r\n\r\nfloat G_Smith_Beckmann(float a, float NoV, float NoL) {\r\n  return G_Beckmann(a, NoV) * G_Beckmann(a, NoL);\r\n}\r\n\r\n// Smith approx\r\n// Microfacet Models for Refraction through Rough Surface - equation (34)\r\n// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html\r\n// \"a\" is \"roughness squared\" in Disney 's reparameterization\r\nfloat G_Smith_GGX(float a, float NoV, float NoL) {\r\n  // geometry term = dot(G(l), G(v)) / 4 * dot(n,l) * dot(n,v)\r\n  float a2 = a * a;\r\n  float gl = NoL + sqrt(a2 + (1.0 - a2) * pow2(NoL));\r\n  float gv = NoV + sqrt(a2 + (1.0 - a2) * pow2(NoV));\r\n  return 1.0 / (gl*gv);\r\n}\r\n\r\n// from page 12, listing 2 of http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf\r\nfloat G_SmithCorrelated_GGX(float a, float NoV, float NoL) {\r\n  float a2 = a * a;\r\n  \r\n  // NoL and NoV are explicitly swapped. This is not a mistake\r\n  float gv = NoL * sqrt(a2 + (1.0 - a2) * pow2(NoV));\r\n  float gl = NoV * sqrt(a2 + (1.0 - a2) * pow2(NoL));\r\n  \r\n  return 0.5 / max(gv+gl, EPSILON);\r\n}\r\n\r\n// Schlick's Geometric approximation. Note this is edited by Epic to match\r\n// a modification disney made (And ignoring there modifications,\r\n// if you want to do your own research you need to know up front the Schlick originally\r\n// approximated the wrong fomula, so be careful to make sure you choose the corrected\r\n// Schlick if you find it online)\r\nfloat G_Smith_Schlick_GGX(float a, float NoV, float NoL) {\r\n  float k = a * a * 0.5;\r\n  float gl = NoL / (NoL * (1.0 - k) + k);\r\n  float gv = NoV / (NoV * (1.0 - k) + k);\r\n  return gl*gv;\r\n}\r\n\r\n// Tuned to match behavior of Vis_Smith\r\n// [Schlick 1994, \"An Inexpensive BRDF Model for Physically-Based Rendering\"]\r\nfloat G_Schlick(in float a, in float NoV, in float NoL) {\r\n  float k = a * 0.5;\r\n  float V = NoV * (1.0 - k) + k;\r\n  float L = NoL * (1.0 - k) + k;\r\n  return 0.25 / (V * L);\r\n}\r\n\r\nfloat G_SchlickApprox(in float a, in float NdotV, in float NdotL) {\r\n  float V = NdotL * (NdotV * (1.0 - a) + a);\r\n  float L = NdotV * (NdotL * (1.0 - a) + a);\r\n  return 0.5 / (V + L + 1e-5);\r\n}\r\n\r\n// [ Lazarov 2013 \"Getting More Physical in Call of Duty: Black Ops II\" ]\r\n// Adaptation to fit our G term\r\n// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile\r\n// BRDF_Specular_GGX_Environment\r\nvec3 EnvBRDFApprox(vec3 specularColor, float roughness, float NoV) {\r\n  const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);\r\n  const vec4 c1 = vec4(1, 0.0425, 1.04, -0.04 );\r\n  vec4 r = roughness * c0 + c1;\r\n  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r\n  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;\r\n  return specularColor * AB.x + AB.y;\r\n}\r\n\r\n// three.js (bsdfs.glsl)\r\n// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html\r\nfloat GGXRoughnessToBlinnExponent(const in float ggxRoughness) {\r\n  return 2.0 / pow2(ggxRoughness + 0.0001) - 2.0;\r\n}\r\n\r\nfloat BlinnExponentToGGXRoughness(const in float blinnExponent) {\r\n  return sqrt(2.0 / (blinnExponent + 2.0));\r\n}\r\n\r\n/// DISNEY\r\n\r\nfloat F_Schlick_Disney(float u) {\r\n  float m = saturate(1.0 - u);\r\n  float m2 = m * m;\r\n  return m2 * m2 * m;\r\n}\r\n\r\nfloat GTR2_aniso(float NoH, float HoX, float HoY, float ax, float ay) {\r\n  return 1.0 / (PI * ax*ay * pow2(pow2(HoX/ax) + pow2(HoY/ay) + NoH*NoH));\r\n}\r\n    \r\nfloat smithG_GGX(float NoV, float alphaG) {\r\n  float a = alphaG * alphaG;\r\n  float b = NoV * NoV;\r\n  return 1.0 / (NoV + sqrt(a + b - a*b));\r\n}\r\n    \r\nfloat GTR1(float NoH, float a) {\r\n  if (a >= 1.0) {\r\n    return 1.0 / PI;\r\n  }\r\n      \r\n  float a2 = a*a;\r\n  float t = 1.0 + (a2 - 1.0) * NoH * NoH;\r\n  return (a2 - 1.0) / (PI * log(a2) * t);\r\n}";

var bumpMapFrag = "  geometry.normal = perturbNormalArb(-vViewPosition, normalize(vNormal), dHdxy_fwd());";

var bumpMapFragPars = "uniform sampler2D tNormal;\r\nuniform float bumpiness;\r\n\r\nvec2 dHdxy_fwd() {\r\n  vec2 dSTdx = dFdx(vUv);\r\n  vec2 dSTdy = dFdy(vUv);\r\n  float Hll = bumpiness * texture2D(tNormal, vUv).x;\r\n  float dBx = bumpiness * texture2D(tNormal, vUv + dSTdx).x - Hll;\r\n  float dBy = bumpiness * texture2D(tNormal, vUv + dSTdy).x - Hll;\r\n  return vec2(dBx, dBy);\r\n}\r\n\r\nvec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {\r\n  vec3 vSigmaX = dFdx(surf_pos);\r\n  vec3 vSigmaY = dFdy(surf_pos);\r\n  vec3 vN = surf_norm; // normalized\r\n  vec3 R1 = cross(vSigmaY, vN);\r\n  vec3 R2 = cross(vN, vSigmaX);\r\n  float fDet = dot(vSigmaX, R1);\r\n  vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);\r\n  return normalize(abs(fDet) * surf_norm - vGrad);\r\n}";

const bumpMapUniforms = {
	tNormal: { value: null },
	bumpiness: { value: 1.0 },
};

var castShadowFrag = "  float d = vShadowMapUV.z / vShadowMapUV.w;\r\n  gl_FragColor = packDepthToRGBA(d);";

var castShadowFragPars = "varying vec4 vShadowMapUV;";

const castShadowUniforms = {
	lightViewProjectionMatrix: { value: new THREE$1.Matrix4() },
};

var castShadowVert = "  vec4 hpos = lightViewProjectionMatrix * modelMatrix * vec4(position, 1.0);\r\n  vShadowMapUV = hpos;";

var castShadowVertPars = "uniform mat4 lightViewProjectionMatrix;\r\nvarying vec4 vShadowMapUV;";

var clippingPlaneFrag = "  if (dot(vViewPosition, clippingPlane.xyz) > clippingPlane.w) discard;";

var clippingPlaneFragPars = "uniform vec4 clippingPlane;";

const clippingPlaneUniforms = {
	clippingPlane: { value: new THREE$1.Vector4() },
};

var cloudsFrag$1 = "  vec2 cloudsUV = vec2(vUv.x + cloudsTranslation, vUv.y);\r\n  vec2 cloudsPerturb = texture2D(tCloudsPerturb, cloudsUV).xy * cloudsScale;\r\n  cloudsPerturb.xy += cloudsUV + vec2(cloudsTranslation);\r\n  vec3 sunLight = max(reflectedLight.indirectDiffuse, vec3(0.2));\r\n  reflectedLight.indirectDiffuse += texture2D(tClouds, cloudsPerturb).rgb * cloudsBrightness * sunLight;\r\n// reflectedLight.indirectDiffuse += texture2D(tClouds, vUv).rgb * cloudsBrightness;";

var cloudsFragPars$1 = "uniform sampler2D tClouds;\r\nuniform sampler2D tCloudsPerturb;\r\nuniform float cloudsTranslation;\r\nuniform float cloudsScale;\r\nuniform float cloudsBrightness;";

const cloudsUniforms$1 = {
	tClouds: { value: null },
	tCloudsPerturb: { value: null },
	cloudsTranslation: { value: 0.0 },
	cloudsScale: { value: 0.3 },
	cloudsBrightness: { value: 0.5 },
};

var colorBalanceFrag$1 = "uniform vec3 cColorBalanceColor;\r\nuniform sampler2D tDiffuse;\r\nvarying vec2 vUv;\r\n// http://stackoverflow.com/questions/23213925/interpreting-color-function-and-adjusting-pixels-values\r\n// https://gist.github.com/liovch/3168961\r\n// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m\r\n\r\nfloat rgb2l(vec3 c) {\r\n  float fmin = min(min(c.r, c.g), c.b);\r\n  float fmax = max(max(c.r, c.g), c.b);\r\n  return (fmax + fmin) * 0.5; // Luminance\r\n}\r\n\r\nvoid main() {\r\n  vec4 texel = texture2D(tDiffuse, vUv);\r\n\r\n  float lightness = rgb2l(texel.rgb);\r\n\r\n  const float a = 0.25;\r\n  const float b = 0.333;\r\n  const float scale = 0.7;\r\n\r\n  float c2 = clamp((lightness - b) / a + 0.5, 0.0, 1.0);\r\n  float c3 = clamp((lightness + b - 1.0) / -a + 0.5, 0.0, 1.0);\r\n  vec3 midtones = cColorBalanceColor * (c2 * c3 * scale);\r\n\r\n  vec3 newColor = texel.rgb + midtones;\r\n  newColor = clamp(newColor, 0.0, 1.0);\r\n  gl_FragColor = vec4(newColor, 1.0);\r\n}";

const colorBalanceUniforms$1 = {
	cColorBalanceColor: { value: new THREE$1.Vector3( 0.0, 0.0, 0.0 ) },
};

var colorMap2Frag = "  vec4 color2RGBA = texture2D(tDiffuse2, uv);\r\n  material.diffuseColor.rgb = (1.0 - color2RGBA.a) * material.diffuseColor.rgb + color2RGBA.rgb * color2RGBA.a;";

var colorMap2FragPars = "uniform sampler2D tDiffuse2;";

const colorMap2Uniforms = {
	tDiffuse2: { value: null },
};

var colorMapAlphaFrag = "  material.opacity *= colorRGBA.a;";

var colorMapFrag = "  vec4 colorRGBA = texture2D(tDiffuse, uv);\r\n  material.diffuseColor.rgb *= colorRGBA.rgb;";

var colorMapFragPars = "uniform sampler2D tDiffuse;";

const colorMapUniforms = {
	tDiffuse: { value: null },
};

var common$1 = "#define PI 3.14159265359\r\n#define PI2 6.28318530718\r\n#define RECIPROCAL_PI 0.31830988618\r\n#define RECIPROCAL_PI2 0.15915494\r\n#define LOG2 1.442695\r\n#define EPSILON 1e-6\r\n\r\n// handy value clamping to 0 - 1 range\r\n#ifndef saturate\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n#endif\r\n#define whiteCompliment(a) (1.0 - saturate(a))\r\n\r\nfloat pow2(const in float x) { return x*x; }\r\nfloat pow3(const in float x) { return x*x*x; }\r\nfloat pow4(const in float x) { float x2 = x*x; return x2*x2; }\r\nfloat pow5(const in float x) { float x2 = x*x; return x2*x2*x; }\r\nfloat average(const in vec3 color) { return dot(color, vec3(0.3333)); }\r\nfloat rcp(const in float x) { return 1.0/x; }\r\n\r\n// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.\r\n// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/\r\nhighp float rand(const in vec2 uv) {\r\n  const highp float a = 12.9898, b = 78.233, c = 43758.5453;\r\n  highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);\r\n  return fract(sin(sn) * c);\r\n}\r\n\r\nstruct IncidentLight {\r\n  vec3 color;\r\n  vec3 direction;\r\n  bool visible;\r\n};\r\n\r\nstruct ReflectedLight {\r\n  vec3 directDiffuse;\r\n  vec3 directSpecular;\r\n  vec3 indirectDiffuse;\r\n  vec3 indirectSpecular;\r\n};\r\n\r\nstruct GeometricContext {\r\n  vec3 position;\r\n  vec3 normal;\r\n  vec3 viewDir;\r\n};\r\n\r\nstruct Material {\r\n  vec3 diffuseColor;\r\n  float opacity;\r\n  float specularRoughness;\r\n  vec3 specularColor;\r\n};\r\n\r\nvec3 transformDirection(in vec3 dir, in mat4 matrix) {\r\n  return normalize((matrix * vec4(dir, 0.0)).xyz);\r\n}\r\n\r\n// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations\r\nvec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {\r\n  return normalize((vec4(dir, 0.0) * matrix).xyz);\r\n}\r\n\r\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {\r\n  float distance = dot(planeNormal, point - pointOnPlane);\r\n  return -distance * planeNormal + point;\r\n}\r\n\r\nfloat sideOfPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {\r\n  return sign(dot(point - pointOnPlane, planeNormal));\r\n}\r\n\r\nvec3 linePlaneIntersect(in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal) {\r\n  return lineDirection * (dot(planeNormal, pointOnPlane - pointOnLine) / dot(planeNormal, lineDirection)) + pointOnLine;\r\n}\r\n\r\nvec4 GammaToLinear(in vec4 value, in float gammaFactor) {\r\n  return vec4(pow(value.xyz, vec3(gammaFactor)), value.w);\r\n}\r\nvec4 LinearToGamma(in vec4 value, in float gammaFactor) {\r\n  return vec4(pow(value.xyz, vec3(1.0/gammaFactor)), value.w);\r\n}\r\n";

var copyFrag$1 = "uniform sampler2D tDiffuse;\r\nuniform float opacity;\r\nvarying vec2 vUv;\r\nvoid main() {\r\n  gl_FragColor = texture2D(tDiffuse, vUv) * opacity;\r\n}";

const copyUniforms = {
	tDiffuse: { value: null },
	opacity: { value: 1.0 },
};

var copyVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var deferredGeometryFrag = "#include <packing>\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tRoughness;\r\nuniform sampler2D tNormal;\r\nuniform float bumpiness;\r\nvarying vec3 vViewPosition;\r\nvarying vec3 vNormal;\r\nvarying vec2 vUv;\r\nlayout(location = 0) out vec4 gNormal;\r\nlayout(location = 1) out vec4 gDiffuseRoughness;\r\n\r\nvec2 dHdxy_fwd() {\r\n  vec2 dSTdx = dFdx(vUv);\r\n  vec2 dSTdy = dFdy(vUv);\r\n  float Hll = bumpiness * texture2D(tNormal, vUv).x;\r\n  float dBx = bumpiness * texture2D(tNormal, vUv + dSTdx).x - Hll;\r\n  float dBy = bumpiness * texture2D(tNormal, vUv + dSTdy).x - Hll;\r\n  return vec2(dBx, dBy);\r\n}\r\n\r\nvec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {\r\n  vec3 vSigmaX = dFdx(surf_pos);\r\n  vec3 vSigmaY = dFdy(surf_pos);\r\n  vec3 vN = surf_norm; // normalized\r\n  vec3 R1 = cross(vSigmaY, vN);\r\n  vec3 R2 = cross(vN, vSigmaX);\r\n  float fDet = dot(vSigmaX, R1);\r\n  vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);\r\n  return normalize(abs(fDet) * surf_norm - vGrad);\r\n}\r\n\r\nvoid main() {\r\n  vec4 diffuseRGBA = texture2D(tDiffuse, vUv);\r\n  vec4 roughnessRGBA = texture2D(tRoughness, vUv);\r\n  vec3 Nn = perturbNormalArb(-vViewPosition, normalize(vNormal), dHdxy_fwd());\r\n  gNormal = vec4(Nn * 0.5 + 0.5, 0.0);\r\n  gDiffuseRoughness = vec4(diffuseRGBA.xyz, roughnessRGBA.r);\r\n}";

const deferredGeometryUniforms = {
	tDiffuse: { value: null },
	tRoughness: { value: null },
	tNormal: { value: null },
	bumpiness: { value: 1.0 },
};

var deferredGeometryVert = "uniform mat4 projectionMatrix;\r\nuniform mat4 modelViewMatrix;\r\nuniform mat3 normalMatrix;\r\nattribute vec3 position;\r\nattribute vec3 normal;\r\nattribute vec2 uv;\r\nvarying vec3 vViewPosition;\r\nvarying vec3 vNormal;\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_Position = projectionMatrix * mvPosition;\r\n  vViewPosition = -mvPosition.xyz;\r\n  vNormal = normalize(normalMatrix * normal);\r\n  vUv = uv;\r\n}";

var deferredLightFrag = "#include <packing>\r\n#define PI 3.14159265359\r\n#define RECIPROCAL_PI 0.31830988618\r\n#ifndef saturate\r\n#define saturate(x) clamp(x, 0.0, 1.0)\r\n#endif\r\nfloat pow2(const in float x) { return x*x; }\r\nvec3 transformDirection(in vec3 dir, in mat4 matrix) {\r\n  return normalize((matrix * vec4(dir, 0.0)).xyz);\r\n}\r\nvec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {\r\n  return normalize((vec4(dir, 0.0) * matrix).xyz);\r\n}\r\nvec4 GammaToLinear(in vec4 value, in float gammaFactor) {\r\n  return vec4(pow(value.xyz, vec3(gammaFactor)), value.w);\r\n}\r\nvec4 LinearToGamma(in vec4 value, in float gammaFactor) {\r\n  return vec4(pow(value.xyz, vec3(1.0/gammaFactor)), value.w);\r\n}\r\n// #define NUM_POINT_LIGHT 300\r\nstruct PointLight {\r\n  vec3 position;\r\n  vec3 color;\r\n};\r\n\r\nuniform PointLight pointLights[NUM_POINT_LIGHT];\r\nuniform int numPointLights;\r\nuniform float cutoffDistance;\r\nuniform float decayExponent;\r\nuniform float metalness;\r\nuniform float reflectionStrength;\r\nuniform vec3 viewPosition;\r\nuniform mat4 viewInverse;\r\nuniform mat4 viewProjectionInverse;\r\nuniform sampler2D gbuf0; // [rgb-] normal\r\nuniform sampler2D gbuf1; // [rgb-] albedo [---w] roughness\r\nuniform sampler2D tDepth;\r\nuniform samplerCube tEnvMap;\r\nvarying vec2 vUv;\r\n\r\n\r\n// [ Lazarov 2013 \"Getting More Physical in Call of Duty: Black Ops II\" ]\r\n// Adaptation to fit our G term\r\n// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile\r\n// BRDF_Specular_GGX_Environment\r\nvec3 EnvBRDFApprox(vec3 specularColor, float roughness, float NoV) {\r\n  const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);\r\n  const vec4 c1 = vec4(1, 0.0425, 1.04, -0.04 );\r\n  vec4 r = roughness * c0 + c1;\r\n  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r\n  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;\r\n  return specularColor * AB.x + AB.y;\r\n}\r\n\r\n// three.js (bsdfs.glsl)\r\n// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html\r\nfloat GGXRoughnessToBlinnExponent(const in float ggxRoughness) {\r\n  return 2.0 / pow2(ggxRoughness + 0.0001) - 2.0;\r\n}\r\n\r\nfloat BlinnExponentToGGXRoughness(const in float blinnExponent) {\r\n  return sqrt(2.0 / (blinnExponent + 2.0));\r\n}\r\n\r\n// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html\r\nfloat getSpecularMipLevel(const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  float maxMipLevelScalar = float(maxMipLevel);\r\n  float desiredMipLevel = maxMipLevelScalar - 0.79248 - 0.5 * log2(pow2(blinnShininessExponent)+1.0);\r\n  \r\n  // clamp to allowable LOD ranges\r\n  return clamp(desiredMipLevel, 0.0, maxMipLevelScalar);\r\n}\r\n\r\nvec3 getLightProbeIndirectIrradiance(const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  return GammaToLinear(textureCubeLodEXT(tEnvMap, N, float(maxMipLevel)), 2.2).rgb * reflectionStrength;\r\n}\r\n\r\nvec3 getLightProbeIndirectRadiance(const in vec3 V, const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  vec3 reflectVec = reflect(-V, N);\r\n  float specMipLevel = getSpecularMipLevel(blinnShininessExponent, maxMipLevel);\r\n  return GammaToLinear(textureCubeLodEXT(tEnvMap, reflectVec, specMipLevel), 2.2).rgb * reflectionStrength;\r\n}\r\n\r\n\r\nvec3 DiffuseLambert(vec3 diffuseColor) {\r\n  return RECIPROCAL_PI * diffuseColor;\r\n}\r\n\r\nfloat D_GGX(float a, float NoH) {\r\n  // Isotropic ggx\r\n  float a2 = a*a;\r\n  float NoH2 = NoH*NoH;\r\n  float d = NoH2 * (a2 - 1.0) + 1.0;\r\n  return a2 / (PI * d * d);\r\n}\r\n\r\nfloat G_Smith_Schlick_GGX(float a, float NoV, float NoL) {\r\n  float k = a * a * 0.5;\r\n  float gl = NoL / (NoL * (1.0 - k) + k);\r\n  float gv = NoV / (NoV * (1.0 - k) + k);\r\n  return gl*gv;\r\n}\r\n\r\nvec3 F_Schlick(vec3 specularColor, float VoH) {\r\n\r\n  // Original approximation by Christophe Schlick '94\r\n  // \"float fresnel = pow(1.0 - product, 5.0);\",\r\n  \r\n  // Optimized variant (presented by Epic at SIGGRAPH '13)\r\n  float fresnel = exp2((-5.55473 * VoH - 6.98316) * VoH);\r\n  \r\n  return specularColor + (vec3(1.0) - specularColor) * fresnel;\r\n}\r\n\r\nfloat Specular_D(float a, float NoH) {\r\n  return D_GGX(a, NoH);\r\n}\r\n\r\nfloat Specular_G(float a, float NoV, float NoL, float NoH, float VoH, float LoV) {\r\n  return G_Smith_Schlick_GGX(a, NoV, NoL);\r\n}\r\n\r\nvec3 Specular_F(vec3 specularColor, vec3 H, vec3 V) {\r\n  return F_Schlick(specularColor, saturate(dot(H,V)));\r\n}\r\n\r\nvec3 Specular(vec3 specularColor, vec3 H, vec3 V, vec3 L, float a, float NoL, float NoV, float NoH, float VoH, float LoV) {\r\n  float D = Specular_D(a, NoH);\r\n  float G = Specular_G(a, NoV, NoL, NoH, VoH, LoV);\r\n  vec3 F = Specular_F(specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);\r\n  return F * (G * D);\r\n}\r\n\r\nvec3 ComputeLight(vec3 albedoColor, vec3 specularColor, vec3 N, float roughness, vec3 L, vec3 Lc, vec3 V) {\r\n  // Compute some useful values\r\n  float NoL = saturate(dot(N, L));\r\n  float NoV = saturate(dot(N, V));\r\n  vec3 H = normalize(L+V);\r\n  float NoH = saturate(dot(N, H));\r\n  float VoH = saturate(dot(V, H));\r\n  float LoV = saturate(dot(L, V));\r\n  \r\n  float a = pow2(roughness);\r\n  \r\n  vec3 cdiff = DiffuseLambert(albedoColor);\r\n  vec3 cspec = Specular(specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);\r\n  \r\n  return Lc * NoL * (cdiff + cspec);\r\n}\r\n\r\nvoid main() {\r\n  vec4 normalDepth = texture2D(gbuf0, vUv);\r\n  if (normalDepth.x + normalDepth.y + normalDepth.z == 0.0) discard;\r\n  \r\n  vec4 diffuseRoughness = texture2D(gbuf1, vUv);\r\n  vec4 diffuse = GammaToLinear(diffuseRoughness, 2.2);\r\n  vec4 depthRGBA = texture2D(tDepth, vUv);\r\n  float depth = depthRGBA.x * 2.0 - 1.0;\r\n  vec4 HPos = viewProjectionInverse * vec4(vUv*2.0-1.0, depth, 1.0);\r\n  vec3 worldPosition = HPos.xyz / HPos.w;\r\n  vec3 Nn = normalDepth.xyz * 2.0 - 1.0;\r\n  Nn = transformDirection(Nn, viewInverse);\r\n  vec3 viewDir = normalize(viewPosition - worldPosition);\r\n  \r\n  float roughnessFactor = max(0.04, diffuseRoughness.w);\r\n  vec3 cdiff = mix(diffuse.xyz, vec3(0.0), metalness);\r\n  vec3 cspec = mix(vec3(0.04), diffuse.xyz, metalness);\r\n\r\n  vec3 finalColor = vec3(0.0);\r\n  for (int i=0; i<NUM_POINT_LIGHT; ++i) {\r\n    if (i >= numPointLights) break;\r\n    \r\n    vec3 L = pointLights[i].position - worldPosition;\r\n    float Ld = length(L);\r\n    if (cutoffDistance == 0.0 || Ld < cutoffDistance) {\r\n      \r\n      float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), decayExponent);\r\n      vec3 irradiance = pointLights[i].color * Lc;\r\n      irradiance *= PI; // punctual light\r\n      \r\n      vec3 Ln = normalize(L);\r\n      finalColor += ComputeLight(cdiff, cspec, Nn, roughnessFactor, Ln, irradiance, viewDir);\r\n    }\r\n  }\r\n  \r\n  vec3 indirect_irradiance = getLightProbeIndirectIrradiance(Nn, GGXRoughnessToBlinnExponent(roughnessFactor), 10) * PI;\r\n  vec3 diffIBL = indirect_irradiance * DiffuseLambert(cdiff);\r\n  finalColor += diffIBL;\r\n  \r\n  float NoV = saturate(dot(Nn, viewDir));\r\n  vec3 radiance = getLightProbeIndirectRadiance(viewDir, Nn, GGXRoughnessToBlinnExponent(roughnessFactor), 10);\r\n  finalColor += radiance * EnvBRDFApprox(cspec, roughnessFactor, NoV);\r\n  \r\n  gl_FragColor = LinearToGamma(vec4(finalColor, 1.0), 2.2);\r\n}";

const deferredLightUniforms = {
	gbuf0: { value: null },
	gbuf1: { value: null },
	tDepth: { value: null },
	tEnvMap: { value: null },
	metalness: { value: 1.0 },
	reflectionStrength: { value: 1.0 },
	pointLights: { value: [] },
	numPointLights: { value: 0 },
	viewInverse: { value: new THREE$1.Matrix4() },
	viewProjectionInverse: { value: new THREE$1.Matrix4() },
	viewPosition: { value: new THREE$1.Vector3() },
	cutoffDistance: { value: 10.0 },
	decayExponent: { value: 3.0 },
};

var deferredLightVert = "uniform mat4 projectionMatrix;\r\nuniform mat4 modelViewMatrix;\r\nattribute vec3 position;\r\nattribute vec2 uv;\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n  vUv = uv;\r\n}";

var depthFrag = "  gl_FragData[0] = packDepthToRGBA(gl_FragCoord.z);";

var depthFragPars = "#include <packing>";

var depthShadowFrag = "  gl_FragColor.xyz = vec3(unpackRGBAToDepth(texture2D(tShadow, vUv)));\r\n// gl_FragColor.xyz = vec3(DecodeFloatRGBA(texture2D(tShadow, vUv)));\r\n// gl_FragColor.xyz = texture2D(tShadow, vUv).aaa;\r\n  gl_FragColor.a = 1.0;";

var depthShadowFragPars = "uniform sampler2D tShadow;";

const depthShadowUniforms = {
	tShadow: { value: null },
};

var discardFrag = "  if (material.opacity <= 0.5) discard;";

const displacementMapUniforms = {
	tDisplacement: { value: null },
	displacementScale: { value: 1.0 },
	displacementBias: { value: 0.0 },
};

var displacementMapVert = "  transformed += normal * (texture2D(tDisplacement, uv).x * displacementScale + displacementBias);";

var displacementMapVertPars = "uniform sampler2D tDisplacement;\r\nuniform float displacementScale;\r\nuniform float displacementBias;";

var distortionFrag = "  vec4 distortionNormal = texture2D(tDistortion, vUv2);\r\n  vec3 distortion = (distortionNormal.rgb - vec3(0.5)) * distortionStrength;\r\n  uv += distortion.xy;\r\n// float distortionInfluence = 1.0;\r\n// material.diffuseColor.rgb *= texture2D(tDiffuse, vUv + distortion.xy * distortionInfluence).rgb;\r\n// material.diffuseColor.rgb *= texture2D(tDiffuse, vUv2 + distortion.xy).rgb;\r\n// material.diffuseColor.rgb *= texture2D(tDiffuse, uv + distortion.xy).rgb;";

var distortionFragPars = "varying vec2 vUv2;\r\nuniform sampler2D tDistortion;\r\nuniform float distortionStrength;";

const distortionUniforms = {
	tDistortion: { value: null },
	distortionStrength: { value: 1.0 },
};

var distortionVert = "  vUv2 = uv;";

var distortionVertPars = "varying vec2 vUv2;";

var ditherFrag = "  // float threshold = bayer(1, vScreenPos.xy * 10.0);\r\n  // material.opacity = step(threshold, material.opacity);\r\n  mat4 StippleThresholdMatrix = mat4(\r\n    1.0 / 17.0, 9.0 / 17.0, 3.0 / 17.0, 11.0 / 17.0,\r\n    13.0 / 17.0, 5.0 / 17.0, 15.0 / 17.0, 7.0 / 17.0,\r\n    4.0 / 17.0, 12.0 / 17.0, 2.0 / 17.0, 10.0 / 17.0,\r\n    16.0 / 17.0, 8.0 / 17.0, 14.0 / 17.0, 6.0 / 17.0);\r\n  \r\n  vec4 thresholdVec = StippleThresholdMatrix[3];\r\n  float scrX = abs(mod(gl_FragCoord.x, 4.0));\r\n  if (scrX <= 1.0) {\r\n    thresholdVec = StippleThresholdMatrix[0];\r\n  }\r\n  else if (scrX <= 2.0) {\r\n    thresholdVec = StippleThresholdMatrix[1];\r\n  }\r\n  else if (scrX <= 3.0) {\r\n    thresholdVec = StippleThresholdMatrix[2];\r\n  }\r\n  \r\n  float threshold = thresholdVec.w;\r\n  float scrY = abs(mod(gl_FragCoord.y, 4.0));\r\n  if (scrY <= 1.0) {\r\n    threshold = thresholdVec.x;\r\n  }\r\n  else if (scrY <= 2.0) {\r\n    threshold = thresholdVec.y;\r\n  }\r\n  else if (scrX <= 3.0) {\r\n    threshold = thresholdVec.z;\r\n  }\r\n  if (material.opacity < threshold) {\r\n    discard;\r\n  }";

var ditherFragPars = "varying vec4 vScreenPos;\r\n// http://fe0km.blog.fc2.com/blog-entry-122.html?sp\r\n// http://glslsandbox.com/e#30514.1\r\nfloat bayer(int iter, vec2 rc) {\r\n  float sum = 0.0;\r\n  for (int i=0; i<4; ++i) {\r\n    if (i >= iter) break;\r\n    vec2 bsize = vec2(pow(2.0, float(i+1)));\r\n    vec2 t = mod(rc, bsize) / bsize;\r\n    int idx = int(dot(floor(t*2.0), vec2(2.0, 1.0)));\r\n    float b = 0.0;\r\n    if (idx == 0) { b = 0.0; } else if (idx == 1) { b = 2.0; } else if (idx == 2) { b = 3.0; } else { b = 1.0; }\r\n    sum += b * pow(4.0, float(iter-i-1));\r\n  }\r\n  float phi = pow(4.0, float(iter)) + 1.0;\r\n  return (sum + 1.0) / phi;\r\n}";

var edgeCompositeFrag = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tEdge;\r\nuniform vec3 edgeColor;\r\nvarying vec2 vUv;\r\nvoid main() {\r\n  vec4 diffuse = texture2D(tDiffuse, vUv);\r\n  vec4 edge = texture2D(tEdge, vUv);\r\n  vec4 color = mix(diffuse, vec4(edgeColor, 1.0), edge.x);\r\n  gl_FragColor = vec4(color.xyz, 1.0);\r\n}";

const edgeCompositeUniforms = {
	tDiffuse: { value: null },
	tEdge: { value: null },
	edgeColor: { value: new THREE$1.Vector3() },
};

var edgeCompositeVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var edgeExpandFrag = "uniform sampler2D tDiffuse;\r\nuniform vec2 aspect;\r\nuniform float strength;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvarying vec2 vUv4;\r\nvarying vec2 vUv5;\r\nvarying vec2 vUv6;\r\nvarying vec2 vUv7;\r\nvoid main() {\r\n  vec2 dvu = vec2(4.0 / aspect.x, 0);\r\n  vec4 color = texture2D(tDiffuse, vUv0)\r\n             + texture2D(tDiffuse, vUv1)\r\n             + texture2D(tDiffuse, vUv2)\r\n             + texture2D(tDiffuse, vUv3)\r\n             + texture2D(tDiffuse, vUv4)\r\n             + texture2D(tDiffuse, vUv5)\r\n             + texture2D(tDiffuse, vUv6)\r\n             + texture2D(tDiffuse, vUv7)\r\n             + texture2D(tDiffuse, vUv0 + dvu)\r\n             + texture2D(tDiffuse, vUv1 + dvu)\r\n             + texture2D(tDiffuse, vUv2 + dvu)\r\n             + texture2D(tDiffuse, vUv3 + dvu)\r\n             + texture2D(tDiffuse, vUv4 + dvu)\r\n             + texture2D(tDiffuse, vUv5 + dvu)\r\n             + texture2D(tDiffuse, vUv6 + dvu)\r\n             + texture2D(tDiffuse, vUv7 + dvu);\r\n  gl_FragColor = vec4(color.xyz * strength, 1);\r\n}";

const edgeExpandUniforms = {
	tDiffuse: { value: null },
	aspect: { value: new THREE$1.Vector2() },
	strength: { value: 0.7 },
};

var edgeExpandVert = "uniform vec2 aspect;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvarying vec2 vUv4;\r\nvarying vec2 vUv5;\r\nvarying vec2 vUv6;\r\nvarying vec2 vUv7;\r\nvoid main() {\r\n  vec2 stepUV = vec2(1.0 / aspect.x, 1.0 / aspect.y);\r\n  vec2 stepUV3 = stepUV * 3.0;\r\n  vUv0 = uv + vec2(-stepUV3.x, -stepUV3.y);\r\n  vUv1 = uv + vec2(-stepUV3.x, -stepUV.y);\r\n  vUv2 = uv + vec2(-stepUV3.x, stepUV.y);\r\n  vUv3 = uv + vec2(-stepUV3.x, stepUV3.y);\r\n  vUv4 = uv + vec2(-stepUV.x, -stepUV3.y);\r\n  vUv5 = uv + vec2(-stepUV.x, -stepUV.y);\r\n  vUv6 = uv + vec2(-stepUV.x, stepUV.y);\r\n  vUv7 = uv + vec2(-stepUV.x, stepUV3.y);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var edgeFrag = "uniform sampler2D tDiffuse;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvoid main() {\r\n  float d0 = texture2D(tDiffuse, vUv0).x - texture2D(tDiffuse, vUv1).x;\r\n  float d1 = texture2D(tDiffuse, vUv2).x - texture2D(tDiffuse, vUv3).x;\r\n  gl_FragColor = vec4(vec3(d0*d0 + d1*d1), 1);\r\n}";

var edgeIDFrag = "uniform sampler2D tDiffuse;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvoid main() {\r\n  float t0 = texture2D(tDiffuse, vUv0).x;\r\n  float t1 = texture2D(tDiffuse, vUv1).x;\r\n  float t2 = texture2D(tDiffuse, vUv2).x;\r\n  float t3 = texture2D(tDiffuse, vUv3).x;\r\n  float t0t1 = t0 - t1;\r\n  float t2t3 = t2 - t3;\r\n  float id0 = t0t1 * t0t1;\r\n  float id1 = t2t3 * t2t3;\r\n  gl_FragColor = vec4(vec3((id0 + id1) * 64.0), 1.0);\r\n}";

const edgeIDUniforms = {
	tDiffuse: { value: null },
	step: { value: 2.0 },
	aspect: { value: new THREE$1.Vector2() },
};

var edgeIDVert = "uniform vec2 aspect;\r\nuniform float step;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvoid main() {\r\n  vec2 stepUV = vec2(step / aspect.x, step / aspect.y);\r\n  vUv0 = uv + vec2(-stepUV.x, -stepUV.y);\r\n  vUv1 = uv + vec2( stepUV.x,  stepUV.y);\r\n  vUv2 = uv + vec2(-stepUV.x,  stepUV.y);\r\n  vUv3 = uv + vec2( stepUV.x, -stepUV.y);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

const edgeUniforms = {
	tDiffuse: { value: null },
	aspect: { value: new THREE$1.Vector2() },
};

var edgeVert = "uniform vec2 aspect;\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\nvoid main() {\r\n  vec2 stepUV = vec2(0.5 / aspect.x, 0.5 / aspect.y);\r\n  vUv0 = uv + vec2(-stepUV.x, -stepUV.y);\r\n  vUv1 = uv + vec2( stepUV.x,  stepUV.y);\r\n  vUv2 = uv + vec2(-stepUV.x,  stepUV.y);\r\n  vUv3 = uv + vec2( stepUV.x, -stepUV.y);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var emissiveFrag = "emissive += emissiveColor;";

var emissiveFragPars = "uniform vec3 emissiveColor;";

var emissiveMapFrag = "emissive *= texture2D(tEmissive, uv).rgb;";

var emissiveMapFragPars = "uniform sampler2D tEmissive;";

const emissiveMapUniforms = {
	tEmissive: { value: null },
};

const emissiveUniforms = {
	emissiveColor: { value: new THREE$1.Color( 0x0 ) },
};

var endFrag = "  gl_FragColor.xyz = outgoingLight;\r\n  gl_FragColor.a = material.opacity;";

var endFragDebug = "gl_FragColor.rgb = debugColor;";

var fogFrag = "  outgoingLight = fogColor * vFogFactor + outgoingLight * (1.0 - vFogFactor);";

var fogFragPars = "uniform vec3 fogColor;\r\nvarying float vFogFactor;";

const fogUniforms = {
	fogAlpha: { value: 1.0 },
	fogFar: { value: 50.0 },
	fogNear: { value: 1.0 },
	fogColor: { value: new THREE$1.Color() },
};

var fogVert = "  float fogParamA = fogFar / (fogFar - fogNear);\r\n  float fogParamB = -1.0 / (fogFar - fogNear);\r\n  float fogFactor = 1.0 - (fogParamA + hpos.w * fogParamB);\r\n  vFogFactor = clamp(fogFactor, 0.0, 1.0) * fogAlpha;";

var fogVertPars = "uniform float fogAlpha;\r\nuniform float fogFar;\r\nuniform float fogNear;\r\nvarying float vFogFactor;";

var fresnelFrag = "  vec3 cameraToVertex = normalize(vWorldPosition - cameraPosition);\r\n\r\n  // Transforming Normal Vectors with the Inverse Transformation\r\n  vec3 worldNormal = inverseTransformDirection(geometry.normal, viewMatrix);\r\n\r\n  float krmin = reflectionStrength * fresnelReflectionScale;\r\n  float invFresnelExponent = 1.0 / fresnelExponent;\r\n  float ft = pow(abs(dot(worldNormal, cameraToVertex)), invFresnelExponent);\r\n  float fresnel = mix(reflectionStrength, krmin, ft);\r\n  vec3 vReflect = reflect(cameraToVertex, worldNormal);\r\n  vReflect.x = -vReflect.x; // flip\r\n  reflectedLight.indirectSpecular += textureCube(tEnvMap, vReflect).rgb * fresnel;";

var fresnelFragPars = "uniform float fresnelExponent;\r\nuniform float fresnelReflectionScale;";

const fresnelUniforms = {
	fresnelExponent: { value: 3.5 },
	fresnelReflectionScale: { value: 0.5 },
};

var glassFrag = "  vec4 glassPos = vScreenPos;\r\n  glassPos.xy += (geometry.viewDir.xy - geometry.normal.xy) * (glassCurvature * vScreenPos.w);\r\n  glassPos.xy /= glassPos.w;\r\n// vec4 distortionNormal = texture2D(tDistortion, vUv);\r\n// vec3 distortion = (distortionNormal.rgb - vec3(0.5)) * distortionStrength;\r\n  distortionNormal = texture2D(tDistortion, vUv + distortion.xy);\r\n  distortion = distortionNormal.rgb - vec3(0.5);\r\n  glassPos.xy += distortion.xy;\r\n  reflectedLight.directDiffuse = mix(reflectedLight.directDiffuse, texture2D(tBackBuffer, glassPos.xy).rgb, glassStrength);";

var glassFragPars = "uniform sampler2D tBackBuffer;\r\nuniform float glassStrength;\r\nuniform float glassCurvature;\r\nvarying vec4 vScreenPos;";

const glassUniforms = {
	tBackBuffer: { value: null },
	glassStrength: { value: 0.7 },
	glassCurvature: { value: 0.5 },
};

var glassVert = "  vScreenPos.xy = vScreenPos.xy * 0.5 + (0.5 * hpos.w);";

var glsl3Frag$1 = "precision mediump sampler2DArray;\r\n#define varying in\r\n#ifndef MULTIRENDERCOLOR\r\nlayout(location = 0) out highp vec4 outFragColor;\r\n#endif\r\n#define gl_FragColor outFragColor\r\n#define gl_FragDepthEXT gl_FragDepth\r\n#define texture2D texture\r\n#define textureCube texture\r\n#define texture2DProj textureProj\r\n#define texture2DLodEXT textureLod\r\n#define texture2DProjLodEXT textureProjLod\r\n#define textureCubeLodEXT textureLod\r\n#define texture2DGradEXT textureGrad\r\n#define texture2DProjGradEXT textureProjGrad\r\n#define textureCubeGradEXT textureGrad\r\nprecision highp float;\r\nprecision highp int;\r\n#define HIGH_PRECISION";

var glsl3Vert$1 = "precision mediump sampler2DArray;\r\n#define attribute in\r\n#define varying out\r\n#define texture2D texture\r\nprecision highp float;\r\nprecision highp int;\r\n#define HIGH_PRECISION";

const grassUniforms = {
	grassWindDirection: { value: new THREE$1.Vector3( 1, 0, 0 ) },
	grassWindPower: { value: 1.0 },
	grassTime: { value: 0.0 },
};

var grassVert = "// transformed += grassWindDirection * grassWindPower * max(transformed.y, 0.0) * sin(grassTime);\r\n// vWorldPosition += grassWindDirection * grassWindPower * max(vWorldPosition.y, 0.0) * sin(grassTime);\r\n  float windStrength = (uv.y * uv.y) * (sin(grassTime + color.y * PI) * 0.5 + 0.5) * color.x;\r\n  vWorldPosition += offsets;\r\n  vWorldPosition += grassWindDirection * grassWindPower * windStrength;";

var grassVertPars = "attribute vec3 offsets;\r\nattribute vec4 color;\r\nuniform vec3 grassWindDirection;\r\nuniform float grassWindPower;\r\nuniform float grassTime;";

var heightFogFrag = "  outgoingLight = heightFogColor * vHeightFogFactor + outgoingLight * (1.0 - vHeightFogFactor);";

var heightFogFragPars = "uniform vec3 heightFogColor;\r\nvarying float vHeightFogFactor;";

var heightFogMapFrag = "  float heightFogFactor = vHeightFogFactor;\r\n  heightFogFactor *= texture2D(tHeightFog, vUv).r;\r\n  outgoingLight = heightFogColor * heightFogFactor + outgoingLight * (1.0 - vHeightFogFactor);";

var heightFogMapFragPars = "uniform sampler2D tHeightFog;";

const heightFogMapUniforms = {
	tHeightFog: { value: null },
};

const heightFogUniforms = {
	heightFogAlpha: { value: 1.0 },
	heightFogFar: { value: 50.0 },
	heightFogNear: { value: 1.0 },
	heightFogColor: { value: new THREE$1.Color() },
};

var heightFogVert = "  float heightFogParamA = heightFogFar / (heightFogFar - heightFogNear);\r\n  float heightFogParamB = -1.0 / (heightFogFar - heightFogNear);\r\n  float heightFogFactor = 1.0 - (heightFogParamA + vWorldPosition.y * heightFogParamB);\r\n  vHeightFogFactor = clamp(heightFogFactor, 0.0, 1.0) * heightFogAlpha;";

var heightFogVertPars = "uniform float heightFogAlpha;\r\nuniform float heightFogFar;\r\nuniform float heightFogNear;\r\nvarying float vHeightFogFactor;";

var idFrag = "uniform float id;\r\nvoid main() {\r\n  gl_FragColor = vec4(vec3(id), 1);\r\n}";

const idUniforms = {
	id: { value: 1.0 },
};

var idVert = "void main() {\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var innerGlowFrag = "  float glow = 1.0 - max(0.0, dot(geometry.normal, geometry.viewDir));\r\n  float glowPow = max(glow / (innerGlowBase * (1.0 - glow) + glow), 0.0) * innerGlowSub;\r\n  glowPow = max(0.0, glowPow - innerGlowRange) * (1.0 / max(1.0 - innerGlowRange, 0.00001));\r\n  glowPow = min(glowPow, 1.0);\r\n  // glowPow = min(1.0, glowPow*step(innerGlowRange, glowPow));\r\n  reflectedLight.indirectSpecular += innerGlowColor * glowPow;\r\n  // reflectedLight.indirectSpecular += vec3(glowPow);\r\n  // reflectedLight.indirectSpecular += vec3(glow);";

var innerGlowFragPars = "uniform vec3 innerGlowColor;\r\nuniform float innerGlowBase;\r\nuniform float innerGlowSub;\r\nuniform float innerGlowRange;";

var innerGlowSubtractFrag = "  float glow = 1.0 - max(0.0, dot(geometry.normal, geometry.viewDir));\r\n  float glowPow = max(glow / (innerGlowBase * (1.0 - glow) + glow), 0.0) * innerGlowSub;\r\n  glowPow = -max(0.0, glowPow - innerGlowRange) * (1.0 / (1.0 - innerGlowRange));\r\n  reflectedLight.indirectSpecular += innerGlowColor * glowPow;";

const innerGlowUniforms = {
	innerGlowColor: { value: new THREE$1.Color() },
	innerGlowBase: { value: 20.0 },
	innerGlowSub: { value: 10.0 },
	innerGlowRange: { value: 0.0 },
};

var instanceCastShadowVert = "  vec3 vPos = (modelMatrix * vec4(position, 1.0)).xyz;\r\n  float windStrength = (uv.y * uv.y) * (sin(grassTime + color.y * PI) * 0.5 + 0.5) * color.x;\r\n  vPos += offsets;\r\n  vPos += grassWindDirection * grassWindPower * windStrength;\r\n  vec4 hpos = lightViewProjectionMatrix * vec4(vPos, 1.0);\r\n  vShadowMapUV = hpos;";

var instanceCastShadowVertPars = "// attribute vec3 offsets;\r\n// attribute vec4 colors;\r\nuniform mat4 lightViewProjectionMatrix;\r\nvarying vec4 vShadowMapUV;";

var instanceColorMapDiscardFrag = "  if (texture2D(tDiffuse, vUv).a < 0.5) discard;";

var lambertFrag = "  float NoL = max(dot(directLight.direction, geometry.normal), 0.0);\r\n  reflectedLight.directDiffuse += material.diffuseColor * directLight.color * NoL;";

var lightMapFrag = "  reflectedLight.directDiffuse *= mix(vec3(1.0), texture2D(tLight, vUv).rgb * lightMapPower, lightMapStrength);;";

var lightMapFragPars = "uniform sampler2D tLight;\r\nuniform float lightMapPower;\r\nuniform float lightMapStrength;";

const lightMapUniforms = {
	tLight: { value: null },
	lightMapPower: { value: 1.0 },
	lightMapStrength: { value: 1.0 },
};

var lightsAreaLightFrag = "  for (int i=0; i<PIXY_AREA_LIGHTS_NUM; ++i) {\r\n    computeAreaLight(areaLights[i], geometry, material, reflectedLight);\r\n  }";

var lightsAreaLightFragUnroll = "  computeAreaLight(areaLights[0], geometry, material, reflectedLight);";

const lightsAreaLightUniforms = {
	areaLights: {
		value: [
			// PIXY.AreaLight
		],
	},
};

var lightsDirectFrag = "  for (int i=0; i<PIXY_DIRECT_LIGHTS_NUM; ++i) {\r\n    getDirectLightIrradiance(directLights[i], geometry, directLight);\r\n    if (directLight.visible) {\r\n      updateLight(directLight);\r\n      computeLight(directLight, geometry, material, reflectedLight);\r\n    }\r\n  }";

var lightsDirectFragUnroll = "  getDirectLightIrradiance(directLights[0], geometry, directLight);\r\n  if (directLight.visible) {\r\n    updateLight(directLight);\r\n    computeLight(directLight, geometry, material, reflectedLight);\r\n  }";

const lightsDirectUniforms = {
	directLights: {
		value: [
			{
				direction: new THREE$1.Vector3( 0, 0, 1 ),
				color: new THREE$1.Color( 0xffffff ),
			},
		],
	},
};

var lightsFragPars = "bool testLightInRange(const in float lightDistance, const in float cutoffDistance) {\r\n  return any(bvec2(cutoffDistance == 0.0, lightDistance < cutoffDistance));\r\n}\r\n\r\nfloat punctualLightIntensityToIrradianceFactor(const in float lightDistance, const in float cutoffDistance, const in float decayExponent) {\r\n  \r\n  if (decayExponent > 0.0) {\r\n  \r\n// #if defined(PHYSICALLY_CORRECT_LIGHTS)\r\n  // based upon Frostbite 3 Moving to Physically-based Rendering\r\n  // page 32, equation 26: E[window1]\r\n  // http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf\r\n  // this is intended to be used to spot and point lights who are represented as mulinouse intensity\r\n  // but who must be converted to luminous irradiance for surface lighting calculation\r\n  \r\n  // float distanceFalloff = 1.0 / max(pow(lightDistance, decayExponent), 0.01);\r\n  // float maxDistanceCutoffFactor = pow2(saturate(1.0 - pow4(lightDistance / cutoffDistance)));\r\n  // return distanceFalloff * maxDistanceCutoffFactor;\r\n// #else\r\n    return pow(saturate(-lightDistance / cutoffDistance + 1.0), decayExponent);\r\n// #endif\r\n  }\r\n\r\n  return 1.0;\r\n}\r\n\r\nstruct DirectLight {\r\n  vec3 direction;\r\n  vec3 color;\r\n};\r\n\r\nvoid getDirectLightIrradiance(const in DirectLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight) {\r\n  directLight.color = directionalLight.color;\r\n  directLight.direction = directionalLight.direction;\r\n  directLight.visible = true;\r\n}\r\n\r\nstruct PointLight {\r\n  vec3 position;\r\n  vec3 color;\r\n  float distance;\r\n  float decay;\r\n};\r\n\r\nvoid getPointDirectLightIrradiance(const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight) {\r\n  vec3 L = pointLight.position - geometry.position;\r\n  directLight.direction = normalize(L);\r\n\r\n  float lightDistance = length(L);\r\n\r\n  if (testLightInRange(lightDistance, pointLight.distance)) {\r\n    directLight.color = pointLight.color;\r\n    directLight.color *= punctualLightIntensityToIrradianceFactor(lightDistance, pointLight.distance, pointLight.decay);\r\n    directLight.visible = true;\r\n  } else {\r\n    directLight.color = vec3(0.0);\r\n    directLight.visible = false;\r\n  }\r\n}\r\n\r\nstruct SpotLight {\r\n  vec3 position;\r\n  vec3 direction;\r\n  vec3 color;\r\n  float distance;\r\n  float decay;\r\n  float coneCos;\r\n  float penumbraCos;\r\n};\r\n\r\nvoid getSpotDirectLightIrradiance(const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight) {\r\n  vec3 L = spotLight.position - geometry.position;\r\n  directLight.direction = normalize(L);\r\n\r\n  float lightDistance = length(L);\r\n  float angleCos = dot(directLight.direction, spotLight.direction);\r\n\r\n  if (all(bvec2(angleCos > spotLight.coneCos, testLightInRange(lightDistance, spotLight.distance)))) {\r\n    float spotEffect = smoothstep(spotLight.coneCos, spotLight.penumbraCos, angleCos);\r\n    directLight.color = spotLight.color;\r\n    directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor(lightDistance, spotLight.distance, spotLight.decay);\r\n    directLight.visible = true;\r\n  } else {\r\n    directLight.color = vec3(0.0);\r\n    directLight.visible = false;\r\n  }\r\n}\r\n\r\nstruct AreaLight {\r\n  vec3 position;\r\n  vec3 color;\r\n  float distance;\r\n  float decay;\r\n  float radius;\r\n};\r\n\r\nstruct TubeLight {\r\n  vec3 start;\r\n  vec3 end;\r\n  vec3 color;\r\n  float distance;\r\n  float decay;\r\n  float radius;\r\n};\r\n\r\nstruct RectLight {\r\n  vec3 positions[4];\r\n  vec3 normal;\r\n  vec3 tangent;\r\n  vec3 color;\r\n  float intensity;\r\n  float width;\r\n  float height;\r\n  float distance;\r\n  float decay;\r\n  int numPositions;\r\n};";

var lightsPars = "// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html\r\nfloat getSpecularMipLevel(const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  float maxMipLevelScalar = float(maxMipLevel);\r\n  float desiredMipLevel = maxMipLevelScalar - 0.79248 - 0.5 * log2(pow2(blinnShininessExponent)+1.0);\r\n  \r\n  // clamp to allowable LOD ranges\r\n  return clamp(desiredMipLevel, 0.0, maxMipLevelScalar);\r\n}\r\n\r\nvec3 getLightProbeIndirectIrradiance(const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  vec3 worldNormal = inverseTransformDirection(N, viewMatrix);\r\n  vec3 queryVec = vec3(-worldNormal.x, worldNormal.yz); // flip\r\n  return GammaToLinear(textureCubeLodEXT(tEnvMap, queryVec, float(maxMipLevel)), 2.2).rgb * reflectionStrength;\r\n}\r\n\r\nvec3 getLightProbeIndirectRadiance(const in vec3 V, const in vec3 N, const in float blinnShininessExponent, const in int maxMipLevel) {\r\n  vec3 reflectVec = reflect(-V, N);\r\n  reflectVec = inverseTransformDirection(reflectVec, viewMatrix);\r\n  vec3 queryVec = vec3(-reflectVec.x, reflectVec.yz); // flip\r\n  float specMipLevel = getSpecularMipLevel(blinnShininessExponent, maxMipLevel);\r\n  return GammaToLinear(textureCubeLodEXT(tEnvMap, queryVec, specMipLevel), 2.2).rgb * reflectionStrength;\r\n}";

var lightsPointFrag = "  for (int i=0; i<PIXY_POINT_LIGHTS_NUM; ++i) {\r\n    getPointDirectLightIrradiance(pointLights[i], geometry, directLight);\r\n    if (directLight.visible) {\r\n      updateLight(directLight);\r\n      computeLight(directLight, geometry, material, reflectedLight);\r\n    }\r\n  }";

var lightsPointFragUnroll = "  getPointDirectLightIrradiance(pointLights[0], geometry, directLight);\r\n  if (directLight.visible) {\r\n    updateLight(directLight);\r\n    computeLight(directLight, geometry, material, reflectedLight);\r\n  }";

const lightsPointUniforms = {
	pointLights: {
		value: [
			{
				position: new THREE$1.Vector3(),
				color: new THREE$1.Color(),
				distance: 1.0,
				decay: 0.0,
			},
		],
	},
};

var lightsRectLightFrag = "for (int i=0; i<PIXY_RECT_LIGHTS_NUM; ++i) {\r\n  computeRectLight(rectLights[i], geometry, material, reflectedLight);\r\n}";

var lightsRectLightFragUnroll = "  computeRectLight(rectLights[0], geometry, material, reflectedLight);";

const lightsRectLightUniforms = {
	rectLights: {
		value: [
			// PIXY.RectLight
		],
	},
};

var lightsSpotFrag = "  for (int i=0; i<PIXY_SPOT_LIGHTS_NUM; ++i) {\r\n    getSpotDirectLightIrradiance(spotLights[i], geometry, directLight);\r\n    if (directLight.visible) {\r\n      updateLight(directLight);\r\n      computeLight(directLight, geometry, material, reflectedLight);\r\n    }\r\n  }";

var lightsSpotFragUnroll = "  getSpotDirectLightIrradiance(spotLights[0], geometry, directLight);\r\n  if (directLight.visible) {\r\n    updateLight(directLight);\r\n    computeLight(directLight, geometry, material, reflectedLight);\r\n  }";

const lightsSpotUniforms = {
	spotLights: {
		value: [
			{
				position: new THREE$1.Vector3( 0, 0, 10 ),
				direction: new THREE$1.Vector3( 0, 0, -1 ),
				color: new THREE$1.Color(),
				distance: 10.0,
				decay: 0.0,
				coneCos: Math.PI / 4.0,
				penumbraCos: 1.0,
			},
		],
	},
};

var lightsStandardDisneyFrag = "material.specularRoughness = roughnessFactor;\r\n\r\nfloat luminance = 0.3 * material.diffuseColor.x + 0.6 * material.diffuseColor.y + 0.1 * material.diffuseColor.z;\r\nvec3 tint = luminance > 0.0 ? material.diffuseColor / luminance : vec3(1.0);\r\nspecularColor = mix(0.5 * 0.08 * mix(vec3(1.0), tint, SpecularTint), material.diffuseColor, Metallic);\r\n\r\n//material.specularColor = mix(vec3(0.04), material.diffuseColor, metalnessFactor);\r\n//material.diffuseColor = material.diffuseColor * (1.0 - metalnessFactor);\r\nMetallic = metalnessFactor;";

var lightsStandardFrag = "material.specularRoughness = roughnessFactor;\r\nmaterial.specularColor = mix(vec3(0.04), material.diffuseColor, metalnessFactor);\r\nmaterial.diffuseColor = material.diffuseColor * (1.0 - metalnessFactor);";

var lightsTubeLightFrag = "for (int i=0; i<PIXY_TUBE_LIGHTS_NUM; ++i) {\r\n  computeTubeLight(tubeLights[i], geometry, material, reflectedLight);\r\n}";

var lightsTubeLightFragUnroll = "  computeTubeLight(tubeLights[0], geometry, material, reflectedLight);";

const lightsTubeLightUniforms = {
	tubeLights: {
		value: [
			// PIXY.TubeLight
		],
	},
};

var lineGlowFrag = "    float lineGlowDist = abs(dot(vWorldPosition, normalize(lineGlowPlane.xyz)) - lineGlowPlane.w);\r\n    reflectedLight.indirectSpecular += max(1.0 - lineGlowDist / lineGlowRange, 0.0) * lineGlowPower * lineGlowColor;";

var lineGlowFragPars = "uniform vec4 lineGlowPlane;\r\nuniform vec3 lineGlowColor;\r\nuniform float lineGlowRange;\r\nuniform float lineGlowPower;";

const lineGlowUniforms = {
	lineGlowPlane: { value: new THREE$1.Vector4( 0, 1, 0, 0 ) },
	lineGlowColor: { value: new THREE$1.Color( 0xffffff ) },
	lineGlowRange: { value: 1.0 },
	lineGlowPower: { value: 1.0 },
};

var luminosityFrag = "uniform sampler2D tDiffuse;\r\n\r\nvarying vUv;\r\n\r\nvoid main() {\r\n  vec4 texel = texture2D(tDiffuse, vUv);\r\n  vec3 luma = vec3(0.299, 0.587, 0.114);\r\n  float v = dot(texel.xyz, luma);\r\n  gl_FragColor = vec4(v, v, v, texel.w);\r\n}";

var luminosityHighPassFrag = "uniform sampler2D tDiffuse;\r\nuniform vec3 defaultColor;\r\nuniform float defaultOpacity;\r\nuniform float luminosityThreshold;\r\nuniform float smoothWidth;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec4 texel = texture2D(tDiffuse, vUv);\r\n  vec3 luma = vec3(0.299, 0.587, 0.114);\r\n  float v = dot(texel.xyz, luma);\r\n  vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);\r\n  float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);\r\n  gl_FragColor = mix(outputColor, texel, alpha);\r\n}";

const luminosityHighPassUniforms = {
	tDiffuse: { value: null },
	luminosityThreshold: { value: 1.0 },
	smoothWidth: { value: 1.0 },
	defaultColor: { value: new THREE$1.Color( 0x000000 ) },
	defaultOpacity: { value: 0.0 },
};

var luminosityHighPassVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

const luminosityUniforms = {
	tDiffuse: { value: null },
};

var luminosityVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var metalnessFrag = "  float metalnessFactor = metalness;";

var metalnessMapFrag = "  vec4 metalnessRGBA = texture2D(tMetalness, uv);\r\n  metalnessFactor *= metalnessRGBA.r;";

var metalnessMapFragPars = "uniform sampler2D tMetalness;";

const metalnessMapUniforms = {
	tMetalness: { value: null },
};

var nolitFrag = "  reflectedLight.directDiffuse += material.diffuseColor;";

var normalMapFrag = "  vec4 normalRGBA = texture2D(tNormal, uv);\r\n  vec3 bump = (normalRGBA.rgb - vec3(0.5)) * bumpiness;\r\n  geometry.normal = normalize(vNormal + bump.x * vTangent + bump.y * vBinormal);\r\n// geometry.normal = perturbNormal2Arb(-vViewPosition, normalize(vNormal));";

var normalMapFragPars = "uniform sampler2D tNormal;\r\nuniform float bumpiness;\r\n\r\n// Per-Pixel Tangent Space Normal Mapping\r\n// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\r\n\r\n// vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\r\n// \r\n// \tvec3 q0 = dFdx( eye_pos.xyz );\r\n// \tvec3 q1 = dFdy( eye_pos.xyz );\r\n// \tvec2 st0 = dFdx( vUv.st );\r\n// \tvec2 st1 = dFdy( vUv.st );\r\n// \r\n// \tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\r\n// \tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\r\n// \tvec3 N = normalize( surf_norm );\r\n// \r\n// \tvec3 mapN = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;\r\n// \tmapN.xy = bumpiness * mapN.xy;\r\n// \tmat3 tsn = mat3( S, T, N );\r\n// \treturn normalize( tsn * mapN );\r\n// \r\n// }";

const normalMapUniforms = {
	tNormal: { value: null },
	bumpiness: { value: 1.0 },
};

var opacityFrag = "uniform sampler2D tDiffuse;\r\nvarying vec2 vUv;\r\nvoid main() {\r\n  float a = texture2D(tDiffuse, vUv).a;\r\n  gl_FragColor = vec4(a, a, a, 1.0);\r\n}";

const opacityUniforms = {
	tDiffuse: { value: null },
};

var opacityVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var overlayFrag = "// https://github.com/GameTechDev/CloudsGPUPro6/blob/master/fx/Terrain.fx\r\n// https://github.com/GameTechDev/CloudySky/blob/master/fx/Terrain.fx\r\n\r\n  vec4 mtrlWeights = texture2D(tOverlayMask, uv);\r\n  mtrlWeights /= max(dot(mtrlWeights, vec4(1.0,1.0,1.0,1.0)), 1.0);\r\n  float baseMaterialWeight = clamp(1.0 - dot(mtrlWeights, vec4(1,1,1,1)), 0.0, 1.0);\r\n  vec4 baseMaterialDiffuse = texture2D(tOverlay1, uv * overlay1Scale);\r\n  mat4 materialColors;\r\n  materialColors[0] = texture2D(tOverlay2, uv * overlay2Scale) * mtrlWeights.x;\r\n  materialColors[1] = texture2D(tOverlay3, uv * overlay3Scale) * mtrlWeights.y;\r\n  materialColors[2] = texture2D(tOverlay4, uv * overlay4Scale) * mtrlWeights.z;\r\n  materialColors[3] = texture2D(tOverlay5, uv * overlay5Scale) * mtrlWeights.w;\r\n  material.diffuseColor.rgb *= (baseMaterialDiffuse * baseMaterialWeight + materialColors * mtrlWeights).rgb;";

var overlayFragPars = "// https://github.com/GameTechDev/CloudsGPUPro6/blob/master/fx/Terrain.fx\r\n// https://github.com/GameTechDev/CloudySky/blob/master/fx/Terrain.fx\r\n\r\nuniform sampler2D tOverlay1;\r\nuniform sampler2D tOverlay2;\r\nuniform sampler2D tOverlay3;\r\nuniform sampler2D tOverlay4;\r\nuniform sampler2D tOverlay5;\r\nuniform sampler2D tOverlayMask;\r\nuniform float overlay1Scale;\r\nuniform float overlay2Scale;\r\nuniform float overlay3Scale;\r\nuniform float overlay4Scale;\r\nuniform float overlay5Scale;";

var overlayNormalFrag = "  vec4 baseNormal = texture2D(tOverlay1Normal, uv * overlay1Scale);\r\n  mat4 normals;\r\n  normals[0] = texture2D(tOverlay2Normal, uv * overlay2Scale) * mtrlWeights.x;\r\n  normals[1] = texture2D(tOverlay3Normal, uv * overlay3Scale) * mtrlWeights.y;\r\n  normals[2] = texture2D(tOverlay4Normal, uv * overlay4Scale) * mtrlWeights.z;\r\n  normals[3] = texture2D(tOverlay5Normal, uv * overlay5Scale) * mtrlWeights.w;\r\n  vec3 overlayNormal = (baseNormal * baseMaterialWeight + normals * mtrlWeights).xyz;\r\n  overlayNormal = overlayNormal - vec3(0.5);\r\n  geometry.normal = normalize(vNormal + overlayNormal.x * vTangent + overlayNormal.y * vBinormal);";

var overlayNormalFragPars = "uniform sampler2D tOverlay1Normal;\r\nuniform sampler2D tOverlay2Normal;\r\nuniform sampler2D tOverlay3Normal;\r\nuniform sampler2D tOverlay4Normal;\r\nuniform sampler2D tOverlay5Normal;";

const overlayNormalUniforms = {
	tOverlay1Normal: { value: null },
	tOverlay2Normal: { value: null },
	tOverlay3Normal: { value: null },
	tOverlay4Normal: { value: null },
	tOverlay5Normal: { value: null },
};

const overlayUniforms = {
	tOverlay1: { value: null },
	tOverlay2: { value: null },
	tOverlay3: { value: null },
	tOverlay4: { value: null },
	tOverlay5: { value: null },
	tOverlayMask: { value: null },
	overlay1Scale: { value: 1.0 },
	overlay2Scale: { value: 1.0 },
	overlay3Scale: { value: 1.0 },
	overlay4Scale: { value: 1.0 },
	overlay5Scale: { value: 1.0 },
};

var packing = "vec3 packNormalToRGB(const in vec3 normal) {\r\n  return normalize(normal) * 0.5 + 0.5;\r\n}\r\nvec3 unpackRGBToNormal(const in vec3 rgb) {\r\n  return 1.0 - 2.0 * rgb.xyz;\r\n}\r\n\r\nconst vec3 PackFactors = vec3(255.0, 65025.0, 16581375.0);\r\nconst vec4 UnpackFactors = vec4(1.0, 1.0 / PackFactors);\r\nconst float ShiftRight8 = 1.0 / 255.0;\r\n// const float PackUpscale = 256.0 / 255.0; // fraction -> 0..1 (including 1)\r\n// const float UnpackDownscale = 255.0 / 256.0; // 0..1 -> fraction (excluding 1)\r\n// const vec3 PackFactors = vec3(256.0, 65535.0, 16777216.0);\r\n// const vec4 UnpackFactors = UnpackDownscale / vec4(1.0, PackFactors);\r\n// const float ShiftRight8 = 1.0 / 256.0;\r\nvec4 packDepthToRGBA(float v) {\r\n  vec4 r = vec4(v, fract(PackFactors * v));\r\n  r.xyz -= r.yzw * ShiftRight8;\r\n//   return r * PackUpscale;\r\n  return r;\r\n}\r\n\r\nfloat unpackRGBAToDepth(vec4 rgba) {\r\n  return dot(rgba, UnpackFactors);\r\n}\r\n\r\n\r\n// NOTE: viewZ/eyeZ is < 0 when in front of the camera per OpenGL conventions\r\n\r\nfloat viewZToOrthographicDepth(const in float viewZ, const in float near, const in float far) {\r\n  return (viewZ + near) / (near - far);\r\n}\r\n\r\nfloat orthographicDepthToViewZ(const in float linearClipZ, const in float near, const in float far) {\r\n  return linearClipZ * (near - far) - near;\r\n}\r\n\r\nfloat viewZToPerspectiveDepth(const in float viewZ, const in float near, const in float far) {\r\n  return ((near + viewZ) * far) / ((far - near) * viewZ);\r\n}\r\n\r\nfloat perspectiveDepthToViewZ(const in float invClipZ, const in float near, const in float far) {\r\n  return (near * far) / ((far - near) * invClipZ - far);\r\n}";

var parallaxFrag = "  vec3 T = normalize(vTangent);\r\n  vec3 B = normalize(vBinormal);\r\n  vec3 vv = -geometry.viewDir * mat3(T, B, -geometry.normal);\r\n  uv += parallaxHeight * vv.xy;";

var parallaxMapFrag = "  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, -vNormal);\r\n  uv += (texture2D(tNormal, vUv).a * parallaxHeight + parallaxScale) * vv.xy;";

var parallaxMapFragPars = "uniform float parallaxHeight;\r\nuniform float parallaxScale;";

const parallaxMapUniforms = {
	parallaxHeight: { value: 0.035 },
	parallaxScale: { value: -0.03 },
};

var parallaxOcclusionMapFrag = "  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, vNormal);\r\n  // vec3 vv = perturbUv(-vViewPosition, normalize(vNormal), normalize(vViewPosition));\r\n  float parallaxLimit = -length(vv.xy) / vv.z;\r\n  parallaxLimit *= parallaxScale;\r\n\r\n  vec2 vOffsetDir = normalize(vv.xy);\r\n  vec2 vMaxOffset = vOffsetDir * parallaxLimit;\r\n\r\n  float nNumSamples = mix(20.0, 10.0, dot(geometry.viewDir,vNormal));\r\n  float fStepSize = 1.0 / nNumSamples;\r\n\r\n  // debugColor = vec3(vv.xy * 0.5 + vec2(0.5), 0.0);\r\n\r\n  // vec2 dPdx = dFdx(uv);\r\n  // vec2 dPdy = dFdy(uv);\r\n\r\n  float fCurrRayHeight = 1.0;\r\n  vec2 vCurrOffset = vec2(0,0);\r\n  vec2 vLastOffset = vec2(0.0);\r\n  float fLastSampledHeight = 1.;\r\n  float fCurrSampledHeight = 1.;\r\n  for (int nCurrSample = 0; nCurrSample < 50; nCurrSample++) {\r\n    if (float(nCurrSample) > nNumSamples) break;\r\n    // fCurrSampledHeight = textureGrad(tDiffuse, uv + vCurrOffset, dPdx, dPdy).a;\r\n    // fCurrSampledHeight = texture2DGradEXT(tDiffuse, uv + vCurrOffset, dPdx, dPdy).a;\r\n    // fCurrSampledHeight = texture2D(tDiffuse, uv + vCurrOffset).a;\r\n    fCurrSampledHeight = texture2D(tHeightMap, uv + vCurrOffset).r;\r\n    if (fCurrSampledHeight > fCurrRayHeight) {\r\n      float delta1 = fCurrSampledHeight - fCurrRayHeight;\r\n      float delta2 = (fCurrRayHeight + fStepSize) - fLastSampledHeight;\r\n      float ratio = delta1 / (delta1 + delta2);\r\n      vCurrOffset = ratio * vLastOffset + (1.0-ratio) * vCurrOffset;\r\n      break;\r\n    } else {\r\n      fCurrRayHeight -= fStepSize;\r\n      vLastOffset = vCurrOffset;\r\n      vCurrOffset += fStepSize * vMaxOffset;\r\n      fLastSampledHeight = fCurrSampledHeight;\r\n    }\r\n  }\r\n\r\n  uv += vCurrOffset;";

var parallaxOcclusionMapFragPars = "uniform float parallaxScale;\r\nuniform sampler2D tHeightMap;\r\n\r\n// vec3 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {\r\n\r\n//     vec2 texDx = dFdx( vUv );\r\n//     vec2 texDy = dFdy( vUv );\r\n\r\n//     vec3 vSigmaX = dFdx( surfPosition );\r\n//     vec3 vSigmaY = dFdy( surfPosition );\r\n//     vec3 vR1 = cross( vSigmaY, surfNormal );\r\n//     vec3 vR2 = cross( surfNormal, vSigmaX );\r\n//     float fDet = dot( vSigmaX, vR1 );\r\n\r\n//     vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );\r\n//     vec3 vProjVtex;\r\n//     vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;\r\n//     vProjVtex.z = dot( surfNormal, viewPosition );\r\n//     return vProjVtex;\r\n// }";

const parallaxOcclusionMapUniforms = {
	parallaxScale: { value: 0.03 },
	tHeightMap: { value: null },
};

var phongFrag = "  float NoL = max(dot(directLight.direction, geometry.normal), 0.0);\r\n  reflectedLight.directDiffuse += material.diffuseColor * directLight.color * NoL;\r\n\r\n  vec3 H = normalize(geometry.viewDir + directLight.direction);\r\n  float HoN = dot(H, geometry.normal);\r\n  float pw = max(HoN / (shininess * (1.0 - HoN) + HoN), 0.0);\r\n  float specPow = step(0.0, NoL) * pw;\r\n  reflectedLight.directSpecular += specPow * material.specularRoughness * directLight.color * NoL;";

var phongFragPars = "uniform float shininess;";

const phongUniforms = {
	shininess: { value: 50.0 },
};

var projectionMapFrag = "  {\r\n    vec4 Vp = viewMatrix * vec4(projectionMapPos, 1.0);\r\n    vec3 Ln = normalize(Vp.xyz - projectionPos);\r\n    vec4 lightContrib = texture2DProj(tProjectionMap, projectionUv);\r\n    reflectedLight.indirectSpecular += projectionColor * lightContrib.xyz * max(dot(Ln,geometry.normal),0.0);\r\n  }";

var projectionMapFragPars = "uniform sampler2D tProjectionMap;\r\nuniform vec3 projectionMapPos;\r\nuniform vec3 projectionColor;\r\nvarying vec3 projectionPos;\r\nvarying vec4 projectionUv;";

const projectionMapUniforms = {
	tProjectionMap: { value: null },
	projectionMapMatrix: { value: new THREE$1.Matrix4() },
	projectionMapPos: { value: new THREE$1.Vector3() },
	projectionColor: { value: new THREE$1.Color() },
};

var projectionMapVert = "  projectionPos = (modelViewMatrix * vec4(position, 1.0)).xyz;\r\n  projectionUv = projectionMapMatrix * modelMatrix * vec4(position, 1.0);";

var projectionMapVertPars = "uniform mat4 projectionMapMatrix;\r\nvarying vec3 projectionPos;\r\nvarying vec4 projectionUv;";

var receiveShadowFrag = "  float shadowDepth = unpackRGBAToDepth(texture2DProj(tShadow, vShadowMapUV));\r\n  float shadowColor = (shadowDepth * vDepth.w < vDepth.z-shadowBias) ? 1.0 - shadowDensity : 1.0;\r\n  directLight.color *= vec3(shadowColor);";

var receiveShadowFragPars = "uniform sampler2D tShadow;\r\nuniform float shadowBias;\r\nuniform float shadowDensity;\r\nvarying vec4 vDepth;\r\nvarying vec4 vShadowMapUV;";

const receiveShadowUniforms = {
	lightViewProjectionMatrix: { value: new THREE$1.Matrix4() },
	shadowMatrix: { value: new THREE$1.Matrix4() },
	shadowBias: { value: 0.03 },
	shadowDensity: { value: 1.0 },
	tShadow: { value: null },
};

var receiveShadowVert = "  vDepth = lightViewProjectionMatrix * vec4(vWorldPosition, 1.0);\r\n  vShadowMapUV = shadowMatrix * vec4(vWorldPosition, 1.0);";

var receiveShadowVertPars = "uniform mat4 lightViewProjectionMatrix;\r\nuniform mat4 shadowMatrix;\r\nvarying vec4 vDepth;\r\nvarying vec4 vShadowMapUV;";

var reflectionFrag = "  vec3 cameraToVertex = normalize(vWorldPosition - cameraPosition);\r\n\r\n  // Transforming Normal Vectors with the Inverse Transformation\r\n  vec3 worldNormal = inverseTransformDirection(geometry.normal, viewMatrix);\r\n\r\n  vec3 vReflect = reflect(cameraToVertex, worldNormal);\r\n  vReflect.x = -vReflect.x; // flip\r\n  reflectedLight.indirectSpecular += textureCube(tEnvMap, vReflect).rgb * reflectionStrength;";

var reflectionFragPars = "uniform samplerCube tEnvMap;\r\nuniform float reflectionStrength;";

var reflectionStandardFrag = "  {\r\n    float blinnExponent = GGXRoughnessToBlinnExponent(material.specularRoughness);\r\n    \r\n    vec3 irradiance = getLightProbeIndirectIrradiance(geometry.normal, blinnExponent, 10);\r\n    irradiance *= PI; // punctual light\r\n    vec3 diffuse = irradiance * DiffuseLambert(material.diffuseColor);\r\n    reflectedLight.indirectDiffuse += diffuse;\r\n    \r\n    float NoV = saturate(dot(geometry.normal, geometry.viewDir));\r\n    vec3 radiance = getLightProbeIndirectRadiance(geometry.viewDir, geometry.normal, blinnExponent, 10);\r\n    vec3 specular = radiance * EnvBRDFApprox(material.specularColor, material.specularRoughness, NoV);\r\n    reflectedLight.indirectSpecular += specular * reflectionStrength;\r\n  }";

const reflectionUniforms = {
	reflectionStrength: { value: 1.0 },
	tEnvMap: { value: null },
};

var reliefMapFrag = "  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, vNormal);\r\n  float parallaxLimit = -length(vv.xy) / vv.z;\r\n  parallaxLimit *= parallaxScale;\r\n\r\n  vec2 vOffsetDir = normalize(vv.xy);\r\n  vec2 vMaxOffset = vOffsetDir * parallaxLimit;\r\n\r\n  float nNumSamples = mix(20.0, 10.0, dot(geometry.viewDir,vNormal));\r\n  float fStepSize = 1.0 / nNumSamples;\r\n\r\n  float fCurrRayHeight = 1.0;\r\n  vec2 vCurrOffset = vec2(0,0);\r\n  float fCurrSampledHeight = 1.;\r\n  for (int nCurrSample = 0; nCurrSample < 50; nCurrSample++) {\r\n    if (float(nCurrSample) > nNumSamples) break;\r\n    fCurrSampledHeight = texture2D(tHeightMap, uv + vCurrOffset).r;\r\n    if (fCurrSampledHeight > fCurrRayHeight) {\r\n\r\n      vec2 deltaOffset = vMaxOffset * fStepSize * 0.5;\r\n      float deltaHeight = fStepSize * 0.5;\r\n\r\n      vCurrOffset -= deltaOffset;\r\n      fCurrRayHeight += deltaHeight;\r\n\r\n      const int numSearches = 5;\r\n      for (int i=0; i<numSearches; i+=1) {\r\n        deltaOffset *= 0.5;\r\n        deltaHeight *= 0.5;\r\n        float fCurrSampledHeight = texture2D(tHeightMap, uv + vCurrOffset).r;\r\n        if (fCurrSampledHeight > fCurrRayHeight) {\r\n          // below the surface\r\n          vCurrOffset -= deltaOffset;\r\n          fCurrRayHeight += deltaHeight;\r\n        } else {\r\n          // above the surface\r\n          vCurrOffset += deltaOffset;\r\n          fCurrRayHeight -= deltaHeight;\r\n        }\r\n      }\r\n      break;\r\n    } else {\r\n      fCurrRayHeight -= fStepSize;\r\n      vCurrOffset += fStepSize * vMaxOffset;\r\n    }\r\n  }\r\n\r\n  uv += vCurrOffset;";

var reliefMapFragPars = "uniform float parallaxScale;\r\nuniform sampler2D tHeightMap;";

const reliefMapUniforms = {
	parallaxScale: { value: 0.03 },
	tHeightMap: { value: null },
};

var rimLightFrag = "  float rim = 1.0 - saturate(dot(geometry.normal, geometry.viewDir));\r\n  float LE = pow(max(dot(-geometry.viewDir, directLight.direction), 0.0), 30.0);\r\n  reflectedLight.directSpecular += rimLightColor * rim * LE * rimLightCoef;";

var rimLightFragPars = "uniform vec3 rimLightColor;\r\nuniform float rimLightCoef;";

const rimLightUniforms = {
	rimLightColor: { value: new THREE$1.Color() },
	rimLightCoef: { value: 1.0 },
};

var roughnessFrag = "  float roughnessFactor = max(0.04, roughness);";

var roughnessMapFrag = "  vec4 roughnessRGBA = texture2D(tRoughness, uv);\r\n  roughnessFactor *= roughnessRGBA.r;";

var roughnessMapFragPars = "uniform sampler2D tRoughness;";

const roughnessMapUniforms = {
	tRoughness: { value: null },
};

var screenVert = "  vScreenPos = hpos;";

var screenVertPars = "varying vec4 vScreenPos;";

var skyDomeFrag = "  float h = normalize(vWorldPosition + offset).y;\r\n  reflectedLight.indirectDiffuse += mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));";

var skyDomeFragPars = "uniform vec3 topColor;\r\nuniform vec3 bottomColor;\r\nuniform float offset;\r\nuniform float exponent;";

const skyDomeUniforms = {
	topColor: { value: new THREE$1.Color( 0x0077ff ) },
	bottomColor: { value: new THREE$1.Color( 0xffffff ) },
	offset: { value: 33 },
	exponent: { value: 0.6 },
};

var skyFrag = "  // https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/media/shaders/scattering.glsl\r\n\r\n  float sunfade = 1.0 - clamp(1.0 - exp((skySunPosition.y / 450000.0)), 0.0, 1.0);\r\n  // luminance = 1.0; // vPos.y / 450000.0 + 0.5; // skySunPosition.y / 450000.0 * 1.0 + 0.5\r\n  // reflectedLight.indirectDiffuse += vec3(sunfade);\",\r\n\r\n  float rayleighCoefficient = skyRayleigh - (1.0 * (1.0 - sunfade));\r\n\r\n  vec3 sunDirection = normalize(skySunPosition);\r\n\r\n  float sunE = sunIntensity(dot(sunDirection, up));\r\n\r\n  // extinction (absorbition + out scattering)\r\n  // rayleigh coefiiceneints\r\n  // vec3 betaR = totalRayleigh(lambda) * reyleighCoefficient;\r\n  vec3 betaR = simplifiedRayleigh() * rayleighCoefficient;\r\n\r\n  // mie coefficients\r\n  vec3 betaM = totalMie(lambda, K, skyTurbidity) * skyMieCoefficient;\r\n\r\n  // optical length\r\n  // cutoff angle at 90 to avoid singularity in next formula\r\n  float zenithAngle = acos(max(0.0, dot(up, -geometry.viewDir)));\r\n  float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\r\n  float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\r\n\r\n  // combined extinction factor\r\n  vec3 Fex = exp(-(betaR * sR + betaM * sM));\r\n\r\n  // in scattering\r\n\r\n  float cosTheta = dot(-geometry.viewDir, sunDirection);\r\n\r\n  // float rPhase = rayleighPhase(cosTheta);\r\n  float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);\r\n  vec3 betaRTheta = betaR * rPhase;\r\n\r\n  float mPhase = hgPhase(cosTheta, skyMieDirectionalG);\r\n  vec3 betaMTheta = betaM * mPhase;\r\n\r\n  // vec3 Lin = sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex);\r\n  vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex), vec3(1.5));\r\n  Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex, vec3(0.5)), clamp(pow(1.0 - dot(up, sunDirection), 5.0), 0.0, 1.0));\r\n\r\n  // nightsky\r\n  // float theta = acos(-geometry.viewDir.y); // elevation --> y-axis [-pi/2, pi/2]\r\n  // float phi = atan(-geometry.viewDir.z, -geometry.viewDir.x); // azimuth ---> x-axis [-pi/2, pi/2]\r\n  // vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);\r\n  // vec3 L0 = texture2D(tSky, uv).rgb * Fex;\r\n  // vec3 L0 = texture2D(tSky, uv).rgb + 0.1 * Fex;\r\n  vec3 L0 = vec3(0.1) * Fex;\r\n\r\n  // composition + solar disc\r\n  // if (cosTheta > sunAngularDiameterCos) {\r\n  //   L0 += sunE * Fex;\r\n  // }\r\n  float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);\r\n  // \"if (-geometry.viewDir.y > 0.0) {\r\n  L0 += (sunE * 19000.0 * Fex) * sundisk;\r\n\r\n  // vec3 whiteScale = 1.0 / Uncharted2ToneMapping(vec3(W));\r\n  vec3 whiteScale = 1.0 / Uncharted2Tonemap(vec3(W));\r\n  // vec3 whiteScale = Uncharted2Tonemap(vec3(toneMappingWhitePoint));\r\n\r\n  vec3 texColor = (Lin + L0);\r\n  texColor *= 0.04;\r\n  texColor += vec3(0.0, 0.001, 0.0025) * 0.3;\r\n\r\n  float g_fMaxLuminance = 1.0;\r\n  float fLumScaled = 0.1 / skyLuminance;\r\n  float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);\r\n\r\n  float ExposureBias = fLumCompressed;\r\n\r\n//   vec3 curr = Uncharted2ToneMapping((log2(2.0 / pow(skyLuminance, 4.0))) * texColor);\r\n  vec3 curr = Uncharted2Tonemap((log2(2.0 / pow(skyLuminance, 4.0))) * texColor * vec3(toneMappingExposure));\r\n  vec3 color = curr * whiteScale;\r\n\r\n  reflectedLight.indirectDiffuse += pow(color, vec3(1.0 / (1.2 + (1.2 * sunfade))));\r\n  // reflectedLight.indirectDiffuse += vec3(uv.x, uv.y, 0.0);\r\n  // reflectedLight.indirectDiffuse += Lin + L0;\r\n  // reflectedLight.indirectDiffuse += texColor;\r\n  // reflectedLight.indirectDiffuse += L0;\r\n  // reflectedLight.indirectDiffuse += Lin;\r\n  // reflectedLight.indirectDiffuse += vec3(cosTheta);\r\n  // reflectedLight.indirectDiffuse += vec3(sundisk);\r\n  // reflectedLight.indirectDiffuse += vec3(max(dot(sunDirection, up), 0.0));\r\n  // reflectedLight.indirectDiffuse += vec3(sunE);\r\n";

var skyFragPars = "// https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/media/shaders/scattering.glsl\r\n\r\n// uniform sampler2D tSky;\r\nuniform float skyLuminance;\r\nuniform float skyTurbidity;\r\nuniform float skyRayleigh;\r\nuniform float skyMieCoefficient;\r\nuniform float skyMieDirectionalG;\r\nuniform vec3 skySunPosition;\r\n\r\n// constants for atmospheric scattering\r\nconst float e = 2.71828182845904523536028747135266249775724709369995957;\r\nconst float pi = 3.141592653589793238462643383279502884197169;\r\nconst float n = 1.0003; // refractive index of air\r\nconst float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)\r\nconst float pn = 0.035; // depolatization factor for standard air\r\n\r\n// wavelength of used primaries, according to preetham\r\nconst vec3 lambda = vec3(680E-9, 550E-9, 450E-9);\r\n\r\n// mie stuff\r\n// K koefficient for the primaries\r\nconst vec3 K = vec3(0.686, 0.678, 0.666);\r\nconst float v = 4.0;\r\n\r\n// optical length at zenith for molecules\r\nconst float rayleighZenithLength = 8.4E3;\r\nconst float mieZenithLength = 1.25E3;\r\nconst vec3 up = vec3(0.0, 1.0, 0.0);\r\n\r\nconst float EE = 1000.0; \r\nconst float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324; // 66 arc seconds -> degrees, and the cosine of that\r\n\r\n// earth shadow hack\r\nconst float cutoffAngle = pi / 1.95;\r\nconst float steepness = 1.5;\r\n\r\n// Compute total rayleigh coefficient for a set of wavelengths (usually the tree primaries)\r\n// @param lambda wavelength in m\r\nvec3 totalRayleigh(vec3 lambda) {\r\n  return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));\r\n}\r\n\r\n// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness\r\n// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE\r\nvec3 simplifiedRayleigh() {\r\n  return 0.0005 / vec3(94, 40, 18);\r\n//   return 0.0054532832366 / (3.0 * 2.545E25 * pow(lambda, vec3(4.0)) * 6.245);\r\n}\r\n\r\n// Reileight phase function as a function of cos(theta)\r\nfloat rayleighPhase(float cosTheta) {\r\n// NOTE: there are a few scale factors for the phase function\r\n// (1) as give bei Preetheam, normalized over the sphere with 4pi sr\r\n// (2) normalized to intergral = 1\r\n// (3) nasa: integrates to 9pi / 4, looks best\r\n  return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0));\r\n//   return (1.0 / (3.0 * pi)) * (1.0 + pow(cosTheta, 2.0));\r\n//   return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));\r\n}\r\n\r\n// total mie scattering coefficient\r\n// @param labmda set of wavelengths in m\r\n// @param K corresponding scattering param\r\n// @param T turbidity, somewhere in the range of 0 to 20\r\nvec3 totalMie(vec3 lambda, vec3 K, float T) {\r\n// not the formula given py Preetham\r\n  float c = (0.2 * T) * 10E-18;\r\n  return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;\r\n}\r\n\r\n// Henyey-Greenstein approximataion as a function of cos(theta)\r\n// @param cosTheta\r\n// @param g geometric constant that defines the shape of the ellipse\r\nfloat hgPhase(float cosTheta, float g) {\r\n  return (1.0 / (4.0 * pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0 * g * cosTheta + pow(g, 2.0), 1.5));\r\n}\r\n\r\nfloat sunIntensity(float zenithAngleCos) {\r\n// This function originally used 'exp(n)', but it returns an incorrect value\r\n// on Samsung S6 phones. So it has been replaced with the equivalent 'pow(e,n)'\r\n// See https://github.com/mrdoob/three.js/issues/8382\r\n  return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos)) / steepness)));\r\n}\r\n\r\n// float logLuminance(vec3 c) {\r\n//   return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);\r\n// }\r\n\r\n// Filmic ToneMapping http://filmicgames.com/archives/75\",\r\nfloat A = 0.15;\r\nfloat B = 0.50;\r\nfloat C = 0.10;\r\nfloat D = 0.20;\r\nfloat E = 0.02;\r\nfloat F = 0.30;\r\nfloat W = 1000.0;\r\nvec3 Uncharted2Tonemap(vec3 x) {\r\n  return ((x*(A*x + C*B) + D*E) / (x*(A*x + B) + D*F)) - E/F;\r\n}";

const skyUniforms = {
	// tSky: { value: null },
	skyLuminance: { value: 1.0 },
	skyTurbidity: { value: 2.0 },
	skyRayleigh: { value: 1.0 },
	skyMieCoefficient: { value: 0.005 },
	skyMieDirectionalG: { value: 0.8 },
	skySunPosition: { value: new THREE$1.Vector3() },
};

var specularFrag = "  material.specularRoughness = specularStrength;";

var specularFragPars = "uniform float specularStrength;";

var specularMapFrag = "  material.specularRoughness = texture2D(tSpecular, vUv).r * specularStrength;";

var specularMapFragPars = "uniform sampler2D tSpecular;\r\nuniform float specularStrength;";

const specularMapUniforms = {
	tSpecular: { value: null },
	specularStrength: { value: 1.0 },
};

const specularUniforms = {
	specularStrength: { value: 1.0 },
};

var ssao2BlurFrag = "#define KERNEL_RADIUS 4\r\nuniform sampler2D tAO;\r\nuniform vec4 blurParams;\r\nvarying vec2 vUv;\r\n\r\nfloat CrossBilateralWeight(float r, float ddiff, inout float w_total) {\r\n  float w = exp(-r*r*blurParams.z) * (ddiff < blurParams.w ? 1.0 : 0.0);\r\n  w_total += w;\r\n  return w;\r\n}\r\n\r\n// Performs a gaussian blur in one direction\r\nvec2 Blur(vec2 texScale) {\r\n  vec2 centerCoord = vUv;\r\n  float w_total = 1.0;\r\n  vec2 aoDepth = texture2D(tAO, centerCoord).xy;\r\n  float totalAo = aoDepth.x;\r\n  float centerZ = aoDepth.y;\r\n  // [unroll]\r\n  for (int i=-KERNEL_RADIUS; i<KERNEL_RADIUS; i++) {\r\n    vec2 texCoord = centerCoord + (float(i)*texScale);\r\n    vec2 sampleAoZ = texture2D(tAO, texCoord).xy;\r\n    float diff = abs(sampleAoZ.y - centerZ);\r\n    float weight = CrossBilateralWeight(float(i), diff, w_total);\r\n    totalAo += sampleAoZ.x * weight;\r\n  }\r\n  \r\n  return vec2(totalAo / w_total, centerZ);\r\n}\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(Blur(vec2(blurParams.x, blurParams.y)), 0.0, 1.0);\r\n}";

const ssao2BlurUniforms = {
	tAO: { value: null },
	blurParams: { value: new THREE$1.Vector4() },
};

var ssao2CompositeFrag = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tAO;\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec4 colorRGBA = texture2D(tDiffuse, vUv);\r\n  vec4 aoRGBA = texture2D(tAO, vUv);\r\n  colorRGBA.rgb *= pow(aoRGBA.r, 2.0);\r\n  gl_FragColor = vec4(colorRGBA.rgb, 1.0);\r\n  // gl_FragColor = vec4(vec3(aoRGBA.r), 1.0);\r\n}";

const ssao2CompositeUniforms = {
	tDiffuse: { value: null },
	tAO: { value: null },
};

var ssao2Frag = "#define PI 3.14159265359\r\n#define SAMPLE_FIRST_STEP 1\r\n#define NUM_STEPS 4\r\n#define MAX_STEPS 16\r\n#define NUM_DIRECTIONS 8\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\nuniform vec4 radiusParams;\r\nuniform vec4 biasParams;\r\nuniform vec4 screenParams;\r\nuniform vec4 uvToViewParams;\r\nuniform vec4 focalParams;\r\nuniform vec2 cameraParams;\r\nvarying vec2 vUv;\r\n\r\n#ifndef saturate\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n#endif\r\n\r\n// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.\r\n// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/\r\n// highp float rand(const in vec2 uv) {\r\n//   const highp float a = 12.9898, b = 78.233, c = 43758.5453;\r\n//   highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);\r\n//   return fract(sin(sn) * c);\r\n// }\r\n// Value Noise by Inigo Quilez - iq/2013\r\n// https://www.shadertoy.com/view/lsf3WH\r\nvec2 rand(vec2 p) {\r\n  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));\r\n  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);\r\n}\r\n\r\n// vec2 round(vec2 a) {\r\n//   return floor(a + 0.5);\r\n// }\r\n\r\nfloat rsqrt(float a) {\r\n  return inversesqrt(a);\r\n}\r\n\r\nconst vec3 PackFactors = vec3(255.0, 65025.0, 16581375.0);\r\nconst vec4 UnpackFactors = vec4(1.0, 1.0 / PackFactors);\r\nconst float ShiftRight8 = 1.0 / 255.0;\r\nfloat unpackRGBAToDepth(vec4 rgba) {\r\n  return dot(rgba, UnpackFactors);\r\n}\r\n\r\nfloat viewZToOrthographicDepth(const in float viewZ, const in float near, const in float far) {\r\n  return (viewZ + near) / (near - far);\r\n}\r\n\r\nfloat perspectiveDepthToViewZ(const in float invClipZ, const in float near, const in float far) {\r\n  return (near * far) / ((far - near) * invClipZ - far);\r\n}\r\n\r\nvec3 uvToView(vec2 uv, float eye_z) {\r\n  uv = uvToViewParams.xy * uv + uvToViewParams.zw;\r\n  return vec3(uv * eye_z, eye_z);\r\n}\r\n\r\nvec3 viewPos(vec2 uv) {\r\n  float depth = texture2D(tDepth, uv).x;\r\n  float viewZ = -perspectiveDepthToViewZ(depth, cameraParams.x, cameraParams.y);\r\n  return uvToView(uv, viewZ);\r\n}\r\n\r\nfloat getLengthSqr(vec3 v) {\r\n  return dot(v,v);\r\n}\r\n\r\nvec3 minOfDiff(vec3 P, vec3 Pr, vec3 Pl) {\r\n  vec3 v1 = Pr - P;\r\n  vec3 v2 = P - Pl;\r\n  return (getLengthSqr(v1) < getLengthSqr(v2)) ? v1 : v2;\r\n}\r\n\r\nfloat falloffFactor(float d2) {\r\n  return d2 * radiusParams.z + 1.0;\r\n}\r\n\r\nvec2 snapUVOffset(vec2 uv) {\r\n  return round(uv * screenParams.xy) * screenParams.zw;\r\n}\r\n\r\nfloat TanToSin(float x) {\r\n  return x * rsqrt(x*x + 1.0);\r\n}\r\n\r\nfloat getTangent(vec3 T) {\r\n  return -T.z * rsqrt(dot(T.xy,T.xy));\r\n}\r\n\r\nfloat integerateOcclusion(\r\n  vec2 uv0,\r\n  vec2 snapped_duv,\r\n  vec3 P,\r\n  vec3 dPdu,\r\n  vec3 dPdv,\r\n  inout float tanH)\r\n{\r\n  float ao = 0.0;\r\n  \r\n  // Compute a tangent vector for snapped_duv\r\n  vec3 tangVec = snapped_duv.x * dPdu + snapped_duv.y * dPdv;\r\n  float invTanLen = rsqrt(dot(tangVec.xy,tangVec.xy));\r\n  float tanT = -tangVec.z * invTanLen;\r\n  tanT += biasParams.y;\r\n  \r\n  float sinT = TanToSin(tanT);\r\n  vec3 S = viewPos(uv0 + snapped_duv);\r\n  vec3 diff = S - P;\r\n  float tanS = getTangent(diff);\r\n  float sinS = TanToSin(tanS);\r\n  float d2 = getLengthSqr(diff);\r\n  \r\n  if ((d2 < radiusParams.y) && (tanS > tanT)) {\r\n    // Compute AO between the tangent plane and the sample\r\n    ao = falloffFactor(d2) * saturate(sinS - sinT);\r\n    \r\n    // Update the horizon angle\r\n    tanH = max(tanH, tanS);\r\n  }\r\n  \r\n  return ao;\r\n}\r\n\r\nfloat calculateHorizonOcclusion(\r\n  vec2 dUv, vec2 texelDeltaUV, vec2 uv0, vec3 P, float numSteps,\r\n  float randstep, vec3 dPdu, vec3 dPdv)\r\n{\r\n  float ao = 0.0;\r\n  \r\n  vec2 uv = uv0 + snapUVOffset(randstep * dUv);\r\n  vec2 deltaUV = snapUVOffset(dUv);\r\n  vec3 T = deltaUV.x * dPdu + deltaUV.y * dPdv;\r\n  \r\n  float invTanLen = rsqrt(dot(T.xy,T.xy));\r\n  float tanH = -T.z * invTanLen;\r\n  tanH += biasParams.y;\r\n  \r\n#if SAMPLE_FIRST_STEP\r\n// Take a first sample between uv0 and uv0 + deltaUV\r\nvec2 snapped_duv = snapUVOffset(randstep * deltaUV + texelDeltaUV);\r\nao = integerateOcclusion(uv0, snapped_duv, P, dPdu, dPdv, tanH);\r\n--numSteps;\r\n#endif\r\n\r\n  float sinH = TanToSin(tanH);\r\n  for (int j=1; j<MAX_STEPS; ++j) {\r\n    if (float(j) >= numSteps) {\r\n      break;\r\n    }\r\n    uv += deltaUV;\r\n    vec3 S = viewPos(uv);\r\n    vec3 diff = S - P;\r\n    float tanS = getTangent(diff);\r\n    float d2 = getLengthSqr(diff);\r\n    \r\n    // Use a merged dynamic branch\r\n    //[branch]\r\n    if ((d2 < radiusParams.y) && (tanS > tanH)) {\r\n      // Accumulate AO betrween the horizon and the sample\r\n      float sinS = TanToSin(tanS);\r\n      ao += falloffFactor(d2) * saturate(sinS - sinH);\r\n      \r\n      // Update the current horizon angle\r\n      tanH = tanS;\r\n      sinH = sinS;\r\n    }\r\n  }\r\n  \r\n  return ao;\r\n}\r\n\r\nvec2 rotateDirections(vec2 Dir, vec2 CosSin) {\r\n  return vec2(Dir.x*CosSin.x - Dir.y*CosSin.y, Dir.x*CosSin.y+Dir.y*CosSin.x);\r\n}\r\n\r\nvec3 randCosSinJitter(vec2 uv) {\r\n  vec2 r = rand(uv);\r\n\tfloat angle = 2.0 * PI * r.x / float(NUM_DIRECTIONS);\r\n  return vec3(cos(angle), sin(angle), r.y);\r\n}\r\n\r\nvoid calculateNumSteps(inout vec2 stepSizeInUV, inout float numSteps, float radiusInPixels, float rand) {\r\n  // Avoid oversampling if NUM_STEPS is greater than the kerenl radius in pixels\r\n  numSteps = min(float(NUM_STEPS), radiusInPixels);\r\n  \r\n  // Divide by Ns+1 so taht the farthest samples are not fully attenuated\r\n  float stepSizeInPixels = radiusInPixels / (numSteps+1.0);\r\n  \r\n  // Clamp numSteps if it is greater than the max kernel footprint\r\n  float maxNumSteps = radiusParams.w / stepSizeInPixels;\r\n  if (maxNumSteps < numSteps) {\r\n    // Use dithering to avoid AO discontinuities\r\n    numSteps = floor(maxNumSteps + rand);\r\n    numSteps = max(numSteps, 1.0);\r\n    stepSizeInPixels = radiusParams.w / numSteps;\r\n  }\r\n  \r\n  // Step size in uv space\r\n  stepSizeInUV = stepSizeInPixels * screenParams.zw;\r\n}\r\n\r\nvoid main() {\r\n  \r\n  vec2 uv = vUv;\r\n  // vec2 uv = vec2(0.5,0.5);\r\n  vec2 scr = vUv*screenParams.xy;\r\n  \r\n  vec3 posCenter = viewPos(uv);\r\n  \r\n  // (cos(alpha), sin(alpha), jitter)\r\n  vec3 rand = randCosSinJitter(uv);\r\n  // vec3 rand = randCosSinJitter(vUv*2.0-1.0);\r\n  // vec3 rand = randomTexture.Sample(PointWrapSampler, IN.position.xy / RANDOM_TEXTURE_WIDTH);\r\n  \r\n  // Compute projection of disk of radius g_R into uv space\r\n  // Multiply by 0.5 to scale from [-1,1]^2 to [0,1]^2\r\n  vec2 diskRadiusInUV = 0.5 * radiusParams.x * focalParams.xy / posCenter.z;\r\n  float radiusInPixels = diskRadiusInUV.x * screenParams.x;\r\n  if (radiusInPixels < 1.0) {\r\n    gl_FragColor = vec4(vec3(1.0), 1.0);\r\n    return;\r\n  }\r\n  \r\n  // vec3 rand = randomTexture.Load(int3(IN.position.xy,0) & 63);\r\n  //calculateNumSteps(stepSize, numSteps, radiusInPixels, rand.z);\r\n  \r\n  // Nearest neighbor pixels on the tangent plane\r\n  vec3 posRight  = viewPos(uv + vec2(screenParams.z, 0));\r\n  vec3 posLeft   = viewPos(uv + vec2(-screenParams.z, 0));\r\n  vec3 posTop    = viewPos(uv + vec2(0, screenParams.w));\r\n  vec3 posBottom = viewPos(uv + vec2(0,-screenParams.w));\r\n  \r\n  // Screen-aligned basis for the tangent plane\r\n  vec3 dPdu = minOfDiff(posCenter, posRight, posLeft);\r\n  vec3 dPdv = minOfDiff(posCenter, posTop, posBottom) * (screenParams.y * screenParams.z);\r\n  \r\n  float ao = 0.0;\r\n  float alpha = 2.0 * PI / float(NUM_DIRECTIONS);\r\n  //vec3 rand;\r\n  float numSteps;\r\n  vec2 stepSize;\r\n  for (int d=0; d<NUM_DIRECTIONS; ++d) {\r\n    //rand = randomTexture.Sample(PointWrapSampler, IN.uv * 100);\r\n    //rand = randomTexture.Load(int3(IN.position.xy + int2(d*5, d*17),0) & 31);\r\n    float angle = alpha * float(d);\r\n    \r\n    calculateNumSteps(stepSize, numSteps, radiusInPixels, rand.z);\r\n    vec2 dir = rotateDirections(vec2(cos(angle), sin(angle)), rand.xy);\r\n    vec2 deltaUV = dir * stepSize.xy;\r\n    vec2 texelDeltaUV = dir * screenParams.zw;\r\n    ao += calculateHorizonOcclusion(deltaUV, texelDeltaUV, uv, posCenter, numSteps, rand.z, dPdu, dPdv);\r\n    \r\n    // vec2 snapped_duv = snapUVOffset(deltaUV);\r\n    // vec2 snapped_uv = snapUVOffset(rand.z * snapped_duv + texelDeltaUV);\r\n    // vec2 snapped_scr = (uv + snapped_uv) * screenParams.xy;\r\n    // vec2 snapped_scr = (uv + snapped_uv) * screenParams.xy;\r\n    // vec2 snapped_scr = uv * screenParams.xy;\r\n    // if (snapped_scr.x >= scr.x && snapped_scr.x <= scr.x+1.0 && snapped_scr.y >= scr.y && snapped_scr.y <= scr.y+1.0) {\r\n    //   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\r\n    //   return;\r\n    // }\r\n  }\r\n  \r\n  ao = 1.0 - ao / float(NUM_DIRECTIONS) * biasParams.z;\r\n  gl_FragColor = vec4(saturate(ao), posCenter.z, 0.0, 1.0);\r\n  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n  // gl_FragColor = vec4(normalize(posCenter)*0.5+0.5, 1.0);\r\n  // gl_FragColor = vec4(vec3(saturate(ao)), 1.0);\r\n}\r\n  ";

const ssao2Uniforms = {
	tDiffuse: { value: null },
	tDepth: { value: null },
	angleBias: { value: 40.0 },
	radius: { value: 4.5 },
	maxRadius: { value: 0.5 },
	strength: { value: 10.0 },

	radiusParams: { value: new THREE$1.Vector4() },
	biasParams: { value: new THREE$1.Vector4() },
	screenParams: { value: new THREE$1.Vector4() },
	uvToViewParams: { value: new THREE$1.Vector4() },
	focalParams: { value: new THREE$1.Vector4() },
	cameraParams: { value: new THREE$1.Vector2() },
};

var ssaoFrag = "uniform float cameraNear;\r\nuniform float cameraFar;\r\nuniform bool onlyAO; // use only ambient occulusion pass?\r\nuniform vec2 size; // texture width, height\r\nuniform float aoClamp; // depth clamp - reduces haloing at screen edges\r\nuniform float lumInfluence;  // how much luminance affects occulusion\r\nuniform float radius; // ao radius\r\nuniform float diffArea; // self-shadowing reduction\r\nuniform float gDisplace; // gause bell center\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\nvarying vec2 vUv;\r\n\r\n// #define PI 3.14159265\r\n#define DL 2.399963229728653 // PI * (3.0 - sqrt(5.0))\r\n#define EULER 2.718281828459045\r\n\r\n// user variables\r\nconst int samples = 8; // ao sample count\r\n// const float radius = 5.0; // ao radius\r\nconst bool useNoise = false; // use noise instead of pattern for sample dithering\r\nconst float noiseAmount = 0.0003; // dithering amount\r\n// const float diffArea = 0.4; // self-shadowing reduction\r\n// const float gDisplace = 0.4; // gause bell center\r\n\r\n// generating noise / pattern texture for dithering\r\nvec2 rand(const vec2 coord) {\r\n  vec2 noise;\r\n  if (useNoise) {\r\n    float nx = dot(coord, vec2(12.9898, 78.233));\r\n    float ny = dot(coord, vec2(12.9898, 78.233) * 2.0);\r\n    noise = clamp(fract(43758.5453 * sin(vec2(nx, ny))), 0.0, 1.0);\r\n  } else {\r\n    float ff = fract(1.0 - coord.s * (size.x / 2.0));\r\n    float gg = fract(coord.t * (size.y / 2.0));\r\n    noise = vec2(0.25, 0.75) * vec2(ff) + vec2(0.75, 0.25) * gg;\r\n  }\r\n\r\n  return (noise * 2.0 - 1.0) * noiseAmount;\r\n}\r\n\r\nfloat readDepth(const in vec2 coord) {\r\n  float zfarPlusNear = cameraFar + cameraNear;\r\n  float zfarMinusNear = cameraFar - cameraNear;\r\n  float zcoef = 2.0 * cameraNear;\r\n\r\n//   return (2.0 * cameraNear) / (cameraFar + cameraNear - unpackDepth(texture2D(tDepth, coord)) * (cameraFar - cameraNear));\r\n  // return zcoef / (zfarPlusNear - unpackRGBAToDepth(texture2D(tDepth, coord)) * zfarMinusNear);\r\n  return zcoef / (zfarPlusNear - texture2D(tDepth, coord).r * zfarMinusNear);\r\n}\r\n\r\nfloat compareDepths(const in float depth1, const in float depth2, inout int far) {\r\n  float garea = 2.0; // gauss ball width\r\n  float diff = (depth1 - depth2) * 100.0; // depth difference (0-100)\r\n\r\n// reduce left bell width to avoid self-shadowing\r\n\r\n  if (diff < gDisplace) {\r\n    garea = diffArea;\r\n  } else {\r\n    far = 1;\r\n  }\r\n\r\n  float dd = diff - gDisplace;\r\n  float gauss = pow(EULER, -2.0 * dd * dd / (garea * garea));\r\n  return gauss;\r\n}\r\n\r\nfloat calcAO(float depth, float dw, float dh) {\r\n  float dd = radius - depth * radius;\r\n  vec2 vv = vec2(dw, dh);\r\n\r\n  vec2 coord1 = vUv + dd * vv;\r\n  vec2 coord2 = vUv - dd * vv;\r\n\r\n  float temp1 = 0.0;\r\n  float temp2 = 0.0;\r\n\r\n  int far = 0;\r\n  temp1 = compareDepths(depth, readDepth(coord1), far);\r\n\r\n// DEPTH EXTRAPOLATION\r\n\r\n  if (far > 0) {\r\n    temp2 = compareDepths(readDepth(coord2), depth, far);\r\n    temp1 += (1.0 - temp1) * temp2;\r\n  }\r\n\r\n  return temp1;\r\n}\r\n\r\nvoid main() {\r\n  vec2 noise = rand(vUv);\r\n  float depth = readDepth(vUv);\r\n  float tt = clamp(depth, aoClamp, 1.0);\r\n  float w = (1.0 / size.x) / tt + (noise.x * (1.0 - noise.x));\r\n  float h = (1.0 / size.y) / tt + (noise.y * (1.0 - noise.y));\r\n\r\n  float ao = 0.0;\r\n\r\n  float dz = 1.0 / float(samples);\r\n  float z = 1.0 - dz / 2.0;\r\n  float l = 0.0;\r\n\r\n  for (int i=0; i<=samples; i++) {\r\n    float r = sqrt(1.0 - z);\r\n    float pw = cos(l) * r;\r\n    float ph = sin(l) * r;\r\n    ao += calcAO(depth, pw * w, ph * h);\r\n    z = z - dz;\r\n    l = l + DL;\r\n  }\r\n\r\n  ao /= float(samples);\r\n  ao = 1.0 - ao;\r\n\r\n  vec3 color = texture2D(tDiffuse, vUv).rgb;\r\n\r\n  vec3 lumcoeff = vec3(0.299, 0.587, 0.114);\r\n  float lum = dot(color.rgb, lumcoeff);\r\n  vec3 luminance = vec3(lum);\r\n\r\n  vec3 final = vec3(color * mix(vec3(ao), vec3(1.0), luminance * lumInfluence)); // mix(color * ao, white, luminance)\r\n  if (onlyAO) {\r\n    final = vec3(mix(vec3(ao), vec3(1.0), luminance * lumInfluence));\r\n  }\r\n\r\n  gl_FragColor = vec4(final, 1.0);\r\n}";

const ssaoUniforms = {
	tDiffuse: { value: null },
	tDepth: { value: null },
	size: { value: new THREE$1.Vector2( 512, 512 ) },
	cameraNear: { value: 1 },
	cameraFar: { value: 100 },
	onlyAO: { value: 0 },
	aoClamp: { value: 0.5 },
	lumInfluence: { value: 0.5 },
	radius: { value: 5.0 },
	diffArea: { value: 0.4 },
	gDisplace: { value: 0.4 },
};

var ssaoVert = "varying vec2 vUv;\r\nvoid main() {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

var standardAreaLightFrag = "void computeAreaLight(const in AreaLight areaLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {\r\n  vec3 L = areaLight.position - geometry.position;\r\n  float Ld = length(L);\r\n\r\n  if (areaLight.distance == 0.0 || Ld < areaLight.distance) {\r\n    \r\n    vec3 Ln = normalize(L);\r\n  \r\n    vec3 N = geometry.normal;\r\n    vec3 V = geometry.viewDir;\r\n  \r\n    vec3 r = reflect(-V,N);\r\n    vec3 centerToRay = dot(L,r)*r - L;\r\n    vec3 closestPoint = L + centerToRay * clamp(areaLight.radius / length(centerToRay), 0.0, 1.0);\r\n    Ln = normalize(closestPoint);\r\n    \r\n    float NoL = saturate(dot(N, Ln));\r\n    float NoV = saturate(dot(N, V));\r\n    vec3 H = normalize(Ln+V);\r\n    float NoH = saturate(dot(N, H));\r\n    float VoH = saturate(dot(V, H));\r\n    float LoV = saturate(dot(Ln, V));\r\n    float a = pow2(material.specularRoughness);\r\n    \r\n    float Lc = pow(saturate(-Ld / areaLight.distance + 1.0), areaLight.decay);\r\n    float alphaPrime = clamp(areaLight.distance / (Ld*2.0) + a, 0.0, 1.0);\r\n    float D = D_GGX_AreaLight(a, alphaPrime, NoH);\r\n    float G = PBR_Specular_G(material.specularRoughness, NoV, NoL, NoH, VoH, LoV);\r\n    vec3 F = PBR_Specular_F(material.specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);\r\n    \r\n    vec3 cdiff = DiffuseLambert(material.diffuseColor);\r\n    vec3 cspec = F*(G*D);\r\n    \r\n    vec3 irradiance = areaLight.color * NoL * Lc;\r\n    irradiance *= PI; // punctual light\r\n    \r\n    reflectedLight.directDiffuse += irradiance * cdiff;\r\n    reflectedLight.directSpecular += irradiance * cspec;\r\n  }\r\n}";

var standardFrag = "  vec3 N = geometry.normal;\r\n  vec3 L = directLight.direction;\r\n  vec3 V = geometry.viewDir;\r\n\r\n  float NoL = saturate(dot(N, L));\r\n  float NoV = saturate(dot(N, V));\r\n  vec3 H = normalize(L+V);\r\n  float NoH = saturate(dot(N, H));\r\n  float VoH = saturate(dot(V, H));\r\n  float LoV = saturate(dot(L, V));\r\n          \r\n  float a = pow2(material.specularRoughness);\r\n\r\n  vec3 cdiff = DiffuseLambert(material.diffuseColor);\r\n  vec3 cspec = PBR_Specular_CookTorrance(material.specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);\r\n\r\n  vec3 irradiance = directLight.color * NoL;\r\n  irradiance *= PI; // punctual light\r\n\r\n  reflectedLight.directDiffuse += cdiff * irradiance;\r\n  reflectedLight.directSpecular += cspec * irradiance;";

var standardFragPars = "uniform float roughness;\r\nuniform float metalness;\r\n\r\nfloat PBR_Specular_D(float a, float NoH) {\r\n  // return D_BlinnPhong(a, NoH);\r\n  // return D_Beckmann(a, NoH);\r\n  return D_GGX(a, NoH);\r\n}\r\n\r\nfloat PBR_Specular_G(float a, float NoV, float NoL, float NoH, float VoH, float LoV) {\r\n  // return G_Implicit(a, NoV, NoL);\r\n  // return G_Neuman(a, NoV, NoL);\r\n  // return G_CookTorrance(a, NoV, NoL, NoH, VoH);\r\n  // return G_Keleman(a, NoV, NoL, LoV);\r\n  // return G_Smith_Beckmann(a, NoV, NoL);\r\n  // return G_Smith_GGX(a, NoV, NoL);\r\n  return G_Smith_Schlick_GGX(a, NoV, NoL);\r\n  // return G_SmithCorrelated_GGX(a, NoV, NoL);\r\n}\r\n\r\nvec3 PBR_Specular_F(vec3 specularColor, vec3 H, vec3 V) {\r\n  // return F_None(specularColor);\r\n  // return F_Schlick(specularColor, H, V);\r\n  return F_SchlickApprox(specularColor, saturate(dot(H,V)));\r\n  // return F_CookTorrance(specularColor, H, V);\r\n}\r\n\r\n// Calculates specular intensity according to the Cook - Torrance model\r\n// F: Fresnel - 入射角に対する反射光の量\r\n// D: Microfacet Distribution - 与えられた方向に向いているマイクロファセットの割合\r\n// G: Geometrical Attenuation - マイクロファセットの自己シャドウ\r\nvec3 PBR_Specular_CookTorrance(vec3 specularColor, vec3 H, vec3 V, vec3 L, float a, float NoL, float NoV, float NoH, float VoH, float LoV) {\r\n  float D = PBR_Specular_D(a, NoH);\r\n  float G = PBR_Specular_G(a, NoV, NoL, NoH, VoH, LoV);\r\n  vec3 F = PBR_Specular_F(specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);\r\n  return F * (D*G);\r\n}\r\n";

var standardOrenNayarFrag = "vec3 N = geometry.normal;\r\nvec3 L = directLight.direction;\r\nvec3 V = geometry.viewDir;\r\n\r\nfloat NoL = saturate(dot(N, L));\r\nfloat NoV = saturate(dot(N, V));\r\nvec3 H = normalize(L+V);\r\nfloat NoH = saturate(dot(N, H));\r\nfloat VoH = saturate(dot(V, H));\r\nfloat LoV = saturate(dot(L, V));\r\n        \r\nfloat a = pow2(material.specularRoughness);\r\n\r\nvec3 cdiff = DiffuseOrenNayar(material.diffuseColor, NoV, NoL, LoV, material.specularRoughness);\r\nvec3 cspec = PBR_Specular_CookTorrance(material.specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);\r\n\r\nvec3 irradiance = directLight.color * NoL;\r\nirradiance *= PI; // punctual light\r\n\r\nreflectedLight.directDiffuse += cdiff * directLight.color * PI;\r\nreflectedLight.directSpecular += cspec * irradiance;";

var standardRectLightFrag = "//------------------------------------------------------------\r\n// Real-time Collision Detection\r\nvec3 closestPointPToRay(in vec3 p, in vec3 start, in vec3 dir) {\r\n  float t = max(dot(p-start, dir) / dot(dir,dir), 0.0);\r\n  return start + dir*t;\r\n}\r\nvec3 closestPointPToSegment(in vec3 p, in vec3 a, in vec3 b) {\r\n  vec3 ab = b-a;\r\n  float t = dot(p-a,ab);\r\n  if (t <= 0.0) {\r\n    return a;\r\n  }\r\n  else {\r\n    float denom = dot(ab,ab);\r\n    if (t >= denom) {\r\n      return b;\r\n    }\r\n    \r\n    return a + ab*(t/denom);\r\n  }\r\n  // vec3 ab = b-a;\r\n  // float t = clamp(dot(p-a, ab) / dot(ab,ab), 0.0, 1.0);\r\n  // return a + ab*t;\r\n}\r\n\r\nvec3 closestPointPToTriangle(in vec3 p, in vec3 a, in vec3 b, in vec3 c) {\r\n  // Check if P in vertex region outside A\r\n  vec3 ap = p-a;\r\n  vec3 ab = b-a;\r\n  vec3 ac = c-a;\r\n  float d1 = dot(ab,ap);\r\n  float d2 = dot(ac,ap);\r\n  if (d1 <= 0.0 && d2 <= 0.0) {\r\n    return a; // voronoi=0. barycentric coordinates (1,0,0)\r\n  }\r\n  \r\n  vec3 bp = p-b;\r\n  \r\n  // Check if P in vertex region outside B\r\n  float d3 = dot(ab,bp);\r\n  float d4 = dot(ac,bp);\r\n  if (d3 >= 0.0 && d4 <= d3) {\r\n    return b; // voronoi=1. barycentric coordinates (0,1,0)\r\n  }\r\n  \r\n  // Check if P in edge region of AB,k if so return projection of P onto AB\r\n  float vc = d1*d4 - d3*d2;\r\n  if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0) {\r\n    // float v = d1/(d1-d3)\r\n    return a + ab * (d1/(d1-d3)); // voronoi=2. barycentric coordinates (1-v,v,0)\r\n  }\r\n  \r\n  // Check if P in vertex region outside C\r\n  vec3 cp = p-c;\r\n  float d5 = dot(ab, cp);\r\n  float d6 = dot(ac, cp);\r\n  if (d6 >= 0.0 && d5 <= d6) {\r\n    return c; // voronoi=3. barycentric coordinates (0,0,1)\r\n  }\r\n  \r\n  // Check if P in edge region of AC, if so return projection of P onto AC\r\n  float vb = d5*d2 - d1*d6;\r\n  if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0) {\r\n    // float w = d2/(d2-d6)\r\n    return a + ac * (d2/(d2-d6)); // voronoi=4. barycentric cooridnates (1-w,w,0)\r\n  }\r\n  \r\n  // Check if P in edge region of BC, if so return projection of P onto BC\r\n  float va = d3*d6 - d5*d4;\r\n  if (va <= 0.0 && (d4-d3) >= 0.0 && (d5-d6) >= 0.0) {\r\n    // float w = (d4-d3)/(d4-d3+d5-d6)\r\n    return b + (c-b) * ((d4-d3)/(d4-d3+d5-d6)); // voronoi=5. barycentric coordinates (0,1-w,w)\r\n  }\r\n  \r\n  // P inside face region. Compute Q through its barycentric coordinates (u,v,w)\r\n  float denom = 1.0 / (va+vb+vc);\r\n  float v = vb * denom;\r\n  float w = vc * denom;\r\n  return a + ab*v + ac*w; // voronoi=6\r\n}\r\n\r\nint pointInTriangle(in vec3 p, in vec3 a, in vec3 b, in vec3 c) {\r\n  a -= p;\r\n  b -= p;\r\n  c -= p;\r\n  float ab = dot(a,b);\r\n  float ac = dot(a,c);\r\n  float bc = dot(b,c);\r\n  float cc = dot(c,c);\r\n  if (bc*ac - cc*ab < 0.0) return 0;\r\n  float bb = dot(b,b);\r\n  if (ab*bc - ac*bb < 0.0) return 0;\r\n  return 1;\r\n}\r\n//--------------------------------------------------\r\nvec3 Specular_AreaLight(vec3 specularColor, vec3 N, float roughnessFactor, vec3 L, vec3 Lc, vec3 V) {\r\n  // Compute some useful values\r\n  float NoL = saturate(dot(N, L));\r\n  float NoV = saturate(dot(N, V));\r\n  vec3 H = normalize(L+V);\r\n  float NoH = saturate(dot(N, H));\r\n  float VoH = saturate(dot(V, H));\r\n  float LoV = saturate(dot(L, V));\r\n  \r\n  float a = pow2(roughnessFactor);\r\n  \r\n  vec3 cspec = PBR_Specular_CookTorrance(specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);\r\n  return Lc * NoL * cspec;\r\n}\r\n//--------------------------------------------------\r\nvoid computeRectLight_Triangle(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {\r\n  \r\n  vec4 lpos[3];\r\n  vec3 lvec[3];\r\n  \r\n  // direction vectors from point to area light corners\r\n  for (int i=0; i<3; ++i) {\r\n    // lpos[i] = lightMatrixWorld * vec4(rectLight.positions[i], 1.0); // in world space\r\n    lpos[i] = vec4(rectLight.positions[i], 1.0); // in camera space\r\n    lvec[i] = normalize(lpos[i].xyz - geometry.position); // dir from vertex to area light\r\n  }\r\n  \r\n  // bail if the point is on the wrong side of the light... there must be a better way...\r\n  float tmp = dot(lvec[0], cross((lpos[2]-lpos[0]).xyz, (lpos[1]-lpos[0]).xyz));\r\n  if (tmp > 0.0) return;\r\n  \r\n  // vector irradiance at point\r\n  vec3 lightVec = vec3(0.0);\r\n  for (int i=0; i<3; ++i) {\r\n    vec3 v0 = lvec[i];\r\n    vec3 v1 = lvec[int(mod(float(i+1), float(3)))];\r\n    // if (tmp > 0.0) { // double side\r\n    //   lightVec += acos(dot(v0,v1)) * normalize(cross(v1,v0));\r\n    // }\r\n    // else {\r\n      lightVec += acos(dot(v0,v1)) * normalize(cross(v0,v1));\r\n    // }\r\n  }\r\n  \r\n  vec3 N = geometry.normal;\r\n  vec3 V = geometry.viewDir;\r\n  \r\n  // irradiance factor at point\r\n  float factor = max(dot(lightVec, N), 0.0) / (2.0 * PI);\r\n  \r\n  vec3 irradiance = rectLight.color * rectLight.intensity * factor;\r\n  irradiance *= PI; // punctual light\r\n  \r\n  \r\n  vec3 planePosition = (lpos[0].xyz + lpos[1].xyz + lpos[2].xyz) / 3.0;\r\n  vec3 planeNormal = rectLight.normal;\r\n  planeNormal = normalize(planeNormal - planePosition);\r\n  \r\n  // project onto plane and calculate direction from center to the projection\r\n  // vec3 projection = projectOnPlane(P, planePosition, planeNormal);\r\n  \r\n  // calculate distance from area\r\n  // vec3 nearestPointInside = closestPointPToTriangle(projection, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz);\r\n  // float Ld = distance(P, nearestPointInside);\r\n  // if (cutoffDistance == 0.0 || Ld < cutoffDistance) {\r\n  //   float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), 2.0);\r\n    // float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), decayExponent);\r\n    float NoL = saturate(dot(N, lightVec));\r\n    reflectedLight.directDiffuse += irradiance * NoL * DiffuseLambert(material.diffuseColor);\r\n  // }\r\n  \r\n  /// SPECULAR\r\n  \r\n  // shoot a ray to calculate specular\r\n  vec3 R = reflect(-V, N);\r\n  vec3 E = linePlaneIntersect(geometry.position, -R, planePosition, planeNormal);\r\n  float specAngle = dot(-R, planeNormal);\r\n  if (specAngle > 0.0) {\r\n    \r\n    if (pointInTriangle(E, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz) == 1) {\r\n      reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * specAngle, V);\r\n    }\r\n    else {\r\n      vec3 nearestPointInside = closestPointPToTriangle(E, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz);\r\n      float Ld = length(nearestPointInside-E);\r\n      \r\n      if (rectLight.distance == 0.0 || Ld < rectLight.distance) {\r\n        float Lc = pow(saturate(-Ld / rectLight.distance + 1.0), rectLight.decay);\r\n        reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * Lc * specAngle, V);\r\n      }\r\n    }\r\n  }\r\n}\r\n//--------------------------------------------------\r\nvoid computeRectLight_Rectangle(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {\r\n  \r\n  vec4 lpos[4];\r\n  vec3 lvec[4];\r\n  \r\n  // direction vectors from point to area light corners\r\n  for (int i=0; i<4; ++i) {\r\n    // lpos[i] = lightMatrixWorld * vec4(lightverts[i], 1.0); // in world space\r\n    lpos[i] = vec4(rectLight.positions[i], 1.0); // in camera space\r\n    lvec[i] = normalize(lpos[i].xyz - geometry.position); // dir from vertex to area light\r\n  }\r\n  \r\n  // bail if the point is on the wrong side of the light... there must be a better way...\r\n  float tmp = dot(lvec[0], cross((lpos[2]-lpos[0]).xyz, (lpos[1]-lpos[0]).xyz));\r\n  if (tmp > 0.0) return;\r\n  \r\n  // vector irradiance at point\r\n  vec3 lightVec = vec3(0.0);\r\n  for (int i=0; i<4; ++i) {\r\n    vec3 v0 = lvec[i];\r\n    vec3 v1 = lvec[int(mod(float(i+1), 4.0))];\r\n    // if (tmp > 0.0) { // double side\r\n    //   lightVec += acos(dot(v0,v1)) * normalize(cross(v1,v0));\r\n    // }\r\n    // else {\r\n      lightVec += acos(dot(v0,v1)) * normalize(cross(v0,v1));\r\n    // }\r\n  }\r\n  \r\n  vec3 N = geometry.normal;\r\n  vec3 V = geometry.viewDir;\r\n  \r\n  // irradiance factor at point\r\n  float factor = max(dot(lightVec, N), 0.0) / (2.0 * PI);\r\n  \r\n  vec3 irradiance = rectLight.color * rectLight.intensity * factor;\r\n  irradiance *= PI; // punctual light\r\n  \r\n  vec3 planePosition = (lpos[0].xyz + lpos[1].xyz + lpos[2].xyz + lpos[3].xyz) / 4.0;\r\n  vec3 planeNormal = rectLight.normal;\r\n  vec3 right = rectLight.tangent;\r\n  planeNormal = normalize(planeNormal - planePosition);\r\n  right = normalize(right - planePosition);\r\n  vec3 up = normalize(cross(right, planeNormal));\r\n  \r\n  // project onto plane and calculate direction from center to the projection\r\n  // vec3 projection = projectOnPlane(P, planePosition, planeNormal);\r\n  // vec3 dir = projection - planePosition;\r\n  \r\n  // calculate distance from area\r\n  // vec2 diagonal = vec2(dot(dir,right), dot(dir,up));\r\n  // vec2 nearest2D = vec2(clamp(diagonal.x, -width, width), clamp(diagonal.y, -height, height));\r\n  // vec3 nearestPointInside = planePosition + (right*nearest2D.x + up*nearest2D.y);\r\n  \r\n  // float Ld = distance(P, nearestPointInside); // real distance to area rectangle\r\n  // if (cutoffDistance == 0.0 || Ld < cutoffDistance) {\r\n  //   float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), 2.0);\r\n    float NoL = saturate(dot(N, lightVec));\r\n    reflectedLight.directDiffuse += irradiance * NoL * DiffuseLambert(material.diffuseColor);\r\n  // }\r\n  \r\n  // shoot a ray to calculate specular\r\n  vec3 R = reflect(-V, N);\r\n  vec3 E = linePlaneIntersect(geometry.position, -R, planePosition, planeNormal);\r\n  float specAngle = dot(-R, planeNormal);\r\n  if (specAngle > 0.0) {\r\n    vec3 dirSpec = E - planePosition;\r\n    vec2 dirSpec2D = vec2(dot(dirSpec,right), dot(dirSpec,up));\r\n    vec2 nearestSpec2D = vec2(clamp(dirSpec2D.x,-rectLight.width,rectLight.width), clamp(dirSpec2D.y,-rectLight.height,rectLight.height));\r\n    \r\n    float Ld = length(nearestSpec2D-dirSpec2D);\r\n    if (rectLight.distance == 0.0 || Ld < rectLight.distance) {\r\n      float Lc = pow(saturate(-Ld / rectLight.distance + 1.0), rectLight.decay);\r\n      reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * Lc * specAngle, V);\r\n    }\r\n  }\r\n}\r\n//------------------------------------------------------------\r\nvoid computeRectLight(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {\r\n  \r\n  if (rectLight.numPositions <= 3) {\r\n    computeRectLight_Triangle(rectLight, geometry, material, reflectedLight);\r\n  }\r\n  else {\r\n    computeRectLight_Rectangle(rectLight, geometry, material, reflectedLight);\r\n  }\r\n}";

var standardTubeLightFrag = "void computeTubeLight(const in TubeLight tubeLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {\r\n  \r\n  vec3 N = geometry.normal;\r\n  vec3 V = geometry.viewDir;\r\n  \r\n  vec3 r = reflect(-V, N);\r\n  vec3 L0 = tubeLight.start - geometry.position;\r\n  vec3 L1 = tubeLight.end - geometry.position;\r\n  float Ld0 = length(L0);\r\n  float Ld1 = length(L1);\r\n  float NoL0 = dot(L0, N) / (2.0 * Ld0);\r\n  float NoL1 = dot(L1, N) / (2.0 * Ld1);\r\n  float NoL = (2.0 * clamp(NoL0 + NoL1, 0.0, 1.0)) / (Ld0 * Ld1 + dot(L0,L1) + 2.0);\r\n  vec3 Lv = L1-L0;\r\n  float RoL0 = dot(r, L0);\r\n  float RoLv = dot(r, Lv);\r\n  float LoLv = dot(L0, Lv);\r\n  float Ld = length(Lv);\r\n  float t = (RoL0 * RoLv - LoLv) / (Ld*Ld - RoLv*RoLv);\r\n  \r\n  vec3 closestPoint = L0 + Lv * clamp(t, 0.0, 1.0);\r\n  vec3 centerToRay = dot(closestPoint, r) * r - closestPoint;\r\n  closestPoint = closestPoint + centerToRay * clamp(tubeLight.radius / length(centerToRay), 0.0, 1.0);\r\n  vec3 Ln = normalize(closestPoint);\r\n  \r\n  // float NoL = saturate(dot(N, Ln));\r\n  float NoV = saturate(dot(N, V));\r\n  vec3 H = normalize(Ln+V);\r\n  float NoH = saturate(dot(N, H));\r\n  float VoH = saturate(dot(V, H));\r\n  float LoV = saturate(dot(Ln, V));\r\n  float a = pow2(material.specularRoughness);\r\n  \r\n  Ld = length(closestPoint);\r\n  float Lc = pow(saturate(-Ld / tubeLight.distance + 1.0), tubeLight.decay);\r\n  float alphaPrime = clamp(tubeLight.radius / (Ld*2.0) + a, 0.0, 1.0);\r\n  float D = D_GGX_AreaLight(a, alphaPrime, NoH);\r\n  float G = PBR_Specular_G(material.specularRoughness, NoV, NoL, NoH, VoH, LoV);\r\n  vec3 F = PBR_Specular_F(material.specularColor, V, H) / (4.0 * NoL * NoV + 1e-5);\r\n  \r\n  vec3 cdiff = DiffuseLambert(material.diffuseColor);\r\n  vec3 cspec = F*(G*D);\r\n  \r\n  // vec3 irradiance = areaLight.color * NoL * Lc;\r\n  vec3 irradiance = tubeLight.color * Lc;\r\n  irradiance *= PI; // punctual light\r\n  \r\n  reflectedLight.directDiffuse += irradiance * cdiff;\r\n  reflectedLight.directSpecular += irradiance * cspec;\r\n}";

const standardUniforms = {
	roughness: { value: 1.0 },
	metalness: { value: 0.0 },
};

var tangentFragPars = "varying vec3 vTangent;\r\nvarying vec3 vBinormal;";

var tangentVert = "  vNormal = normalize(normalMatrix * normal);\r\n  vTangent = normalize(normalMatrix * tangent.xyz);\r\n  vBinormal = normalize(cross(vNormal, vTangent) * tangent.w);";

var tangentVertPars = "attribute vec4 tangent;\r\nvarying vec3 vTangent;\r\nvarying vec3 vBinormal;";

var timePars = "uniform float time;";

const timeUniforms = {
	time: { value: 0.0 },
};

var toneMapFrag = "uniform float exposure;\r\nuniform float whitePoint;\r\nuniform sampler2D tDiffuse;\r\n\r\n#ifndef saturate\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n#endif\r\n\r\n// exposure only\r\nvec3 PixyLinearToneMapping(vec3 color) {\r\n  return exposure * color;\r\n}\r\n\r\n// source: https://www.cs.utah.edu/~reinhard/cdrom/\r\nvec3 PixyReinhardToneMapping(vec3 color) {\r\n  color *= exposure;\r\n  return saturate(color / (vec3(1.0) + color));\r\n}\r\n\r\n// source: http://filmicgames.com/archives/75\r\n#define PixyUncharted2Helper(x) max(((x * (0.15 * x + 0.10 * 0.50) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02 / 0.30, vec3(0.0))\r\nvec3 PixyUncharted2ToneMapping(vec3 color) {\r\n// John Hable's filmic operator from Uncharted 2 video game\r\n  color *= exposure;\r\n  return saturate(PixyUncharted2Helper(color) / PixyUncharted2Helper(vec3(whitePoint)));\r\n}\r\n\r\n// source: http://filmicgames.com/archives/75\r\nvec3 PixyOptimizedCineonToneMapping(vec3 color) {\r\n// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson\r\n  color *= exposure;\r\n  color = max(vec3(0.0), color - 0.004);\r\n  return pow((color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06), vec3(2.2));\r\n}\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n  vec4 colorRGBA = texture2D(tDiffuse, vUv);\r\n  gl_FragColor = vec4(PixyUncharted2ToneMapping(colorRGBA.rgb), 1.0);\r\n  \r\n}\r\n";

var toneMappingFrag = "  outgoingLight.rgb = toneMapping(outgoingLight.rgb);";

var toneMappingFragPars = "uniform float toneMappingExposure;\r\nuniform float toneMappingWhitePoint;\r\n// \r\n// // exposure only\r\n// vec3 LinearToneMapping(vec3 color) {\r\n//   return toneMappingExposure * color;\r\n// }\r\n// \r\n// // source: https://www.cs.utah.edu/~reinhard/cdrom/\r\n// vec3 ReinhardToneMapping(vec3 color) {\r\n//   color *= toneMappingExposure;\r\n//   return saturate(color / (vec3(1.0) + color));\r\n// }\r\n// \r\n// source: http://filmicgames.com/archives/75\r\n#define Uncharted2Helper(x) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )\r\nvec3 Uncharted2ToneMapping(vec3 color) {\r\n// John Hable's filmic operator from Uncharted 2 video game\r\n  color *= toneMappingExposure;\r\n  return saturate(Uncharted2Helper(color) / Uncharted2Helper(vec3(toneMappingWhitePoint)));\r\n}\r\n// \r\n// // source: http://filmicgames.com/archives/75\r\n// vec3 OptimizedCineonToneMapping(vec3 color) {\r\n// // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson\r\n//   color *= toneMappingExposure;\r\n//   color = max(vec3(0.0), color - 0.004);\r\n//   return pow((color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06), vec3(2.2));\r\n// \"}\"\r\n";

const toneMappingUniforms = {
	toneMappingExposure: { value: 3.0 },
	toneMappingWhitePoint: { value: 5.0 },
};

const toneMapUniforms = {
	exposure: { value: 3.0 },
	whitePoint: { value: 5.0 },
	tDiffuse: { value: null },
};

var toneMapVert = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n  vUv = uv;\r\n}";

var toonFrag$1 = "  float NoL = dot(directLight.direction, geometry.normal);\r\n  vec3 H = normalize(geometry.viewDir + directLight.direction);\r\n  float HoN = max(dot(H, geometry.normal), 0.0);\r\n\r\n  vec2 toonUV = vec2(NoL * 0.495 + 0.5, 1.0 - (HoN * 0.98 + 0.01));\r\n  vec3 toonColor = texture2D(tToon, toonUV).rgb;\r\n  reflectedLight.directDiffuse += material.diffuseColor * directLight.color * toonColor;\r\n\r\n  // reflectedLight.directSpecular += material.specularStrength * directLight.color * toonColor;";

var toonFragPars$1 = "uniform sampler2D tToon;";

const toonUniforms$1 = {
	tToon: { value: null },
};

var uvFrag = "  vec2 uv = vUv;";

var uvHemiSphericalFrag = "  vec3 wdir = normalize(vWorldPosition);\r\n  float theta = acos(wdir.y); // y-axis [0, pi]\r\n  float phi = atan(wdir.z, wdir.x); // x-axis [-pi/2, pi/2]\r\n  // uv = vec2(0.5, 1.0) - vec2(phi, theta * 2.0 - PI) / vec2(2.0*PI, PI);\r\n  uv = vec2(0.5 - phi / (2.0 * PI), 1.0 - theta * 2.0 / PI);";

var uvProjectionVert = "  vUv = hpos.xy / hpos.w;";

var uvScaleFrag = "  uv *= uvScale;";

var uvScaleFragPars = "uniform float uvScale;";

const uvScaleUniforms = {
	uvScale: { value: 1.0 },
};

var uvScroll2Vert = "  vUv2 += fract(vec2(uvScrollSpeedU, uvScrollSpeedV) * uvScrollTime);";

const uvScrollUniforms = {
	uvScrollTime: { value: 0.0 },
	uvScrollSpeedU: { value: 1.0 },
	uvScrollSpeedV: { value: 1.0 },
};

var uvScrollVert = "  vUv += fract(vec2(uvScrollSpeedU, uvScrollSpeedV) * uvScrollTime);";

var uvScrollVertPars = "uniform float uvScrollTime;\r\nuniform float uvScrollSpeedU;\r\nuniform float uvScrollSpeedV;";

var uvSphericalFrag = "  vec3 wdir = normalize(vWorldPosition);\r\n  float theta = acos(wdir.y); // y-axis [0, pi]\r\n  float phi = atan(wdir.z, wdir.x); // x-axis [-pi/2, pi/2]\r\n  uv = vec2(0.5, 1.0) - vec2(phi, theta) / vec2(2.0*PI, PI);";

var uvVert = "  vUv = uv;";

var uvVertFragPars = "varying vec2 vUv;";

var velvetFrag = "  // float NoL = max(dot(directLight.direction, geometry.normal), 0.0);\r\n  reflectedLight.directDiffuse += surfaceColor * directLight.color * NoL;\r\n\r\n  float subLamb = max(smoothstep(-rollOff, 1.0, NoL) - smoothstep(0.0, 1.0, NoL), 0.0);\r\n  reflectedLight.directDiffuse += subColor * subLamb * velvetStrength;\r\n\r\n  float VoN = 1.0 - dot(geometry.viewDir, geometry.normal);\r\n  reflectedLight.directSpecular += (vec3(VoN) * fuzzySpecColor) * velvetStrength;";

var velvetFragPars = "uniform vec3 surfaceColor;\r\nuniform vec3 fuzzySpecColor;\r\nuniform vec3 subColor;\r\nuniform float rollOff;\r\nuniform float velvetStrength;";

const velvetUniforms = {
	surfaceColor: { value: new THREE$1.Color() },
	fuzzySpecColor: { value: new THREE$1.Color() },
	subColor: { value: new THREE$1.Color() },
	rollOff: { value: 0.3 },
	velvetStrength: { value: 0.3 },
};

var viewFrag = "#include <packing>\r\nuniform sampler2D tDiffuse;\r\nuniform int type;\r\nuniform float cameraNear;\r\nuniform float cameraFar;\r\nvarying vec2 vUv;\r\n\r\nfloat readDepth(sampler2D depthSampler, vec2 coord) {\r\n  float fragCoordZ = texture2D(depthSampler, coord).x;\r\n  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);\r\n}\r\n\r\nvoid main() {\r\n  vec4 diffuse = texture2D(tDiffuse, vUv);\r\n  if (type == 0) {\r\n    gl_FragColor = vec4(diffuse.xyz, 1.0);\r\n  } else if (type == 1) {\r\n    gl_FragColor = vec4(diffuse.www, 1.0);\r\n  } else if (type == 2) {\r\n    gl_FragColor = vec4(diffuse.xxx, 1.0);\r\n  } else if (type == 3) {\r\n    gl_FragColor = vec4(diffuse.yyy, 1.0);\r\n  } else if (type == 4) {\r\n    gl_FragColor = vec4(diffuse.zzz, 1.0);\r\n  } else if (type == 5) {\r\n    gl_FragColor = vec4(diffuse.xyz*2.0-1.0, 1.0);\r\n  } else if (type == 6) {\r\n    float depth = unpackRGBAToDepth(diffuse);\r\n    gl_FragColor = vec4(depth, depth, depth, 1.0);\r\n  } else if (type == 7) {\r\n    float depth = readDepth(tDiffuse, vUv);\r\n    gl_FragColor = vec4(depth, depth, depth, 1.0);\r\n  } else {\r\n    gl_FragColor = diffuse;\r\n  }\r\n}";

const viewUniforms = {
	tDiffuse: { value: null },
	type: { value: 0 },
	cameraNear: { value: 1.0 },
	cameraFar: { value: 100.0 },
};

var worldPositionVert = "  vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;";

var worldPositionVertFragPars = "varying vec3 vWorldPosition;";

var ShaderChunk$1 = {
	accumulateFrag: accumulateFrag,
	ambientFrag: ambientFrag,
	ambientFragPars: ambientFragPars,
	ambientHemisphereFrag: ambientHemisphereFrag,
	ambientHemisphereFragPars: ambientHemisphereFragPars,
	ambientHemisphereUniforms: ambientHemisphereUniforms,
	ambientUniforms: ambientUniforms,
	anisotropyFrag: anisotropyFrag,
	anisotropyFragPars: anisotropyFragPars,
	anisotropyUniforms: anisotropyUniforms,
	antiAliasFrag: antiAliasFrag,
	antiAliasUniforms: antiAliasUniforms,
	antiAliasVert: antiAliasVert,
	aoMapFrag: aoMapFrag,
	aoMapFragPars: aoMapFragPars,
	aoMapUniforms: aoMapUniforms,
	beginFrag: beginFrag,
	beginFragDebug: beginFragDebug,
	billboardDefaultVert: billboardDefaultVert,
	billboardRotZVertEnd: billboardRotZVertEnd,
	billboardUniforms: billboardUniforms,
	billboardVert: billboardVert,
	billboardVertEnd: billboardVertEnd,
	billboardVertPars: billboardVertPars,
	billboardYVert: billboardYVert,
	bsdfs: bsdfs,
	bumpMapFrag: bumpMapFrag,
	bumpMapFragPars: bumpMapFragPars,
	bumpMapUniforms: bumpMapUniforms,
	castShadowFrag: castShadowFrag,
	castShadowFragPars: castShadowFragPars,
	castShadowUniforms: castShadowUniforms,
	castShadowVert: castShadowVert,
	castShadowVertPars: castShadowVertPars,
	clippingPlaneFrag: clippingPlaneFrag,
	clippingPlaneFragPars: clippingPlaneFragPars,
	clippingPlaneUniforms: clippingPlaneUniforms,
	cloudsFrag: cloudsFrag$1,
	cloudsFragPars: cloudsFragPars$1,
	cloudsUniforms: cloudsUniforms$1,
	colorBalanceFrag: colorBalanceFrag$1,
	colorBalanceUniforms: colorBalanceUniforms$1,
	colorMap2Frag: colorMap2Frag,
	colorMap2FragPars: colorMap2FragPars,
	colorMap2Uniforms: colorMap2Uniforms,
	colorMapAlphaFrag: colorMapAlphaFrag,
	colorMapFrag: colorMapFrag,
	colorMapFragPars: colorMapFragPars,
	colorMapUniforms: colorMapUniforms,
	common: common$1,
	copyFrag: copyFrag$1,
	copyUniforms: copyUniforms,
	copyVert: copyVert,
	deferredGeometryFrag: deferredGeometryFrag,
	deferredGeometryUniforms: deferredGeometryUniforms,
	deferredGeometryVert: deferredGeometryVert,
	deferredLightFrag: deferredLightFrag,
	deferredLightUniforms: deferredLightUniforms,
	deferredLightVert: deferredLightVert,
	depthFrag: depthFrag,
	depthFragPars: depthFragPars,
	depthShadowFrag: depthShadowFrag,
	depthShadowFragPars: depthShadowFragPars,
	depthShadowUniforms: depthShadowUniforms,
	discardFrag: discardFrag,
	displacementMapUniforms: displacementMapUniforms,
	displacementMapVert: displacementMapVert,
	displacementMapVertPars: displacementMapVertPars,
	distortionFrag: distortionFrag,
	distortionFragPars: distortionFragPars,
	distortionUniforms: distortionUniforms,
	distortionVert: distortionVert,
	distortionVertPars: distortionVertPars,
	ditherFrag: ditherFrag,
	ditherFragPars: ditherFragPars,
	edgeCompositeFrag: edgeCompositeFrag,
	edgeCompositeUniforms: edgeCompositeUniforms,
	edgeCompositeVert: edgeCompositeVert,
	edgeExpandFrag: edgeExpandFrag,
	edgeExpandUniforms: edgeExpandUniforms,
	edgeExpandVert: edgeExpandVert,
	edgeFrag: edgeFrag,
	edgeIDFrag: edgeIDFrag,
	edgeIDUniforms: edgeIDUniforms,
	edgeIDVert: edgeIDVert,
	edgeUniforms: edgeUniforms,
	edgeVert: edgeVert,
	emissiveFrag: emissiveFrag,
	emissiveFragPars: emissiveFragPars,
	emissiveMapFrag: emissiveMapFrag,
	emissiveMapFragPars: emissiveMapFragPars,
	emissiveMapUniforms: emissiveMapUniforms,
	emissiveUniforms: emissiveUniforms,
	endFrag: endFrag,
	endFragDebug: endFragDebug,
	fogFrag: fogFrag,
	fogFragPars: fogFragPars,
	fogUniforms: fogUniforms,
	fogVert: fogVert,
	fogVertPars: fogVertPars,
	fresnelFrag: fresnelFrag,
	fresnelFragPars: fresnelFragPars,
	fresnelUniforms: fresnelUniforms,
	glassFrag: glassFrag,
	glassFragPars: glassFragPars,
	glassUniforms: glassUniforms,
	glassVert: glassVert,
	glsl3Frag: glsl3Frag$1,
	glsl3Vert: glsl3Vert$1,
	grassUniforms: grassUniforms,
	grassVert: grassVert,
	grassVertPars: grassVertPars,
	heightFogFrag: heightFogFrag,
	heightFogFragPars: heightFogFragPars,
	heightFogMapFrag: heightFogMapFrag,
	heightFogMapFragPars: heightFogMapFragPars,
	heightFogMapUniforms: heightFogMapUniforms,
	heightFogUniforms: heightFogUniforms,
	heightFogVert: heightFogVert,
	heightFogVertPars: heightFogVertPars,
	idFrag: idFrag,
	idUniforms: idUniforms,
	idVert: idVert,
	innerGlowFrag: innerGlowFrag,
	innerGlowFragPars: innerGlowFragPars,
	innerGlowSubtractFrag: innerGlowSubtractFrag,
	innerGlowUniforms: innerGlowUniforms,
	instanceCastShadowVert: instanceCastShadowVert,
	instanceCastShadowVertPars: instanceCastShadowVertPars,
	instanceColorMapDiscardFrag: instanceColorMapDiscardFrag,
	lambertFrag: lambertFrag,
	lightMapFrag: lightMapFrag,
	lightMapFragPars: lightMapFragPars,
	lightMapUniforms: lightMapUniforms,
	lightsAreaLightFrag: lightsAreaLightFrag,
	lightsAreaLightFragUnroll: lightsAreaLightFragUnroll,
	lightsAreaLightUniforms: lightsAreaLightUniforms,
	lightsDirectFrag: lightsDirectFrag,
	lightsDirectFragUnroll: lightsDirectFragUnroll,
	lightsDirectUniforms: lightsDirectUniforms,
	lightsFragPars: lightsFragPars,
	lightsPars: lightsPars,
	lightsPointFrag: lightsPointFrag,
	lightsPointFragUnroll: lightsPointFragUnroll,
	lightsPointUniforms: lightsPointUniforms,
	lightsRectLightFrag: lightsRectLightFrag,
	lightsRectLightFragUnroll: lightsRectLightFragUnroll,
	lightsRectLightUniforms: lightsRectLightUniforms,
	lightsSpotFrag: lightsSpotFrag,
	lightsSpotFragUnroll: lightsSpotFragUnroll,
	lightsSpotUniforms: lightsSpotUniforms,
	lightsStandardDisneyFrag: lightsStandardDisneyFrag,
	lightsStandardFrag: lightsStandardFrag,
	lightsTubeLightFrag: lightsTubeLightFrag,
	lightsTubeLightFragUnroll: lightsTubeLightFragUnroll,
	lightsTubeLightUniforms: lightsTubeLightUniforms,
	lineGlowFrag: lineGlowFrag,
	lineGlowFragPars: lineGlowFragPars,
	lineGlowUniforms: lineGlowUniforms,
	luminosityFrag: luminosityFrag,
	luminosityHighPassFrag: luminosityHighPassFrag,
	luminosityHighPassUniforms: luminosityHighPassUniforms,
	luminosityHighPassVert: luminosityHighPassVert,
	luminosityUniforms: luminosityUniforms,
	luminosityVert: luminosityVert,
	metalnessFrag: metalnessFrag,
	metalnessMapFrag: metalnessMapFrag,
	metalnessMapFragPars: metalnessMapFragPars,
	metalnessMapUniforms: metalnessMapUniforms,
	nolitFrag: nolitFrag,
	normalMapFrag: normalMapFrag,
	normalMapFragPars: normalMapFragPars,
	normalMapUniforms: normalMapUniforms,
	opacityFrag: opacityFrag,
	opacityUniforms: opacityUniforms,
	opacityVert: opacityVert,
	overlayFrag: overlayFrag,
	overlayFragPars: overlayFragPars,
	overlayNormalFrag: overlayNormalFrag,
	overlayNormalFragPars: overlayNormalFragPars,
	overlayNormalUniforms: overlayNormalUniforms,
	overlayUniforms: overlayUniforms,
	packing: packing,
	parallaxFrag: parallaxFrag,
	parallaxMapFrag: parallaxMapFrag,
	parallaxMapFragPars: parallaxMapFragPars,
	parallaxMapUniforms: parallaxMapUniforms,
	parallaxOcclusionMapFrag: parallaxOcclusionMapFrag,
	parallaxOcclusionMapFragPars: parallaxOcclusionMapFragPars,
	parallaxOcclusionMapUniforms: parallaxOcclusionMapUniforms,
	phongFrag: phongFrag,
	phongFragPars: phongFragPars,
	phongUniforms: phongUniforms,
	projectionMapFrag: projectionMapFrag,
	projectionMapFragPars: projectionMapFragPars,
	projectionMapUniforms: projectionMapUniforms,
	projectionMapVert: projectionMapVert,
	projectionMapVertPars: projectionMapVertPars,
	receiveShadowFrag: receiveShadowFrag,
	receiveShadowFragPars: receiveShadowFragPars,
	receiveShadowUniforms: receiveShadowUniforms,
	receiveShadowVert: receiveShadowVert,
	receiveShadowVertPars: receiveShadowVertPars,
	reflectionFrag: reflectionFrag,
	reflectionFragPars: reflectionFragPars,
	reflectionStandardFrag: reflectionStandardFrag,
	reflectionUniforms: reflectionUniforms,
	reliefMapFrag: reliefMapFrag,
	reliefMapFragPars: reliefMapFragPars,
	reliefMapUniforms: reliefMapUniforms,
	rimLightFrag: rimLightFrag,
	rimLightFragPars: rimLightFragPars,
	rimLightUniforms: rimLightUniforms,
	roughnessFrag: roughnessFrag,
	roughnessMapFrag: roughnessMapFrag,
	roughnessMapFragPars: roughnessMapFragPars,
	roughnessMapUniforms: roughnessMapUniforms,
	screenVert: screenVert,
	screenVertPars: screenVertPars,
	skyDomeFrag: skyDomeFrag,
	skyDomeFragPars: skyDomeFragPars,
	skyDomeUniforms: skyDomeUniforms,
	skyFrag: skyFrag,
	skyFragPars: skyFragPars,
	skyUniforms: skyUniforms,
	specularFrag: specularFrag,
	specularFragPars: specularFragPars,
	specularMapFrag: specularMapFrag,
	specularMapFragPars: specularMapFragPars,
	specularMapUniforms: specularMapUniforms,
	specularUniforms: specularUniforms,
	ssao2BlurFrag: ssao2BlurFrag,
	ssao2BlurUniforms: ssao2BlurUniforms,
	ssao2CompositeFrag: ssao2CompositeFrag,
	ssao2CompositeUniforms: ssao2CompositeUniforms,
	ssao2Frag: ssao2Frag,
	ssao2Uniforms: ssao2Uniforms,
	ssaoFrag: ssaoFrag,
	ssaoUniforms: ssaoUniforms,
	ssaoVert: ssaoVert,
	standardAreaLightFrag: standardAreaLightFrag,
	standardFrag: standardFrag,
	standardFragPars: standardFragPars,
	standardOrenNayarFrag: standardOrenNayarFrag,
	standardRectLightFrag: standardRectLightFrag,
	standardTubeLightFrag: standardTubeLightFrag,
	standardUniforms: standardUniforms,
	tangentFragPars: tangentFragPars,
	tangentVert: tangentVert,
	tangentVertPars: tangentVertPars,
	timePars: timePars,
	timeUniforms: timeUniforms,
	toneMapFrag: toneMapFrag,
	toneMappingFrag: toneMappingFrag,
	toneMappingFragPars: toneMappingFragPars,
	toneMappingUniforms: toneMappingUniforms,
	toneMapUniforms: toneMapUniforms,
	toneMapVert: toneMapVert,
	toonFrag: toonFrag$1,
	toonFragPars: toonFragPars$1,
	toonUniforms: toonUniforms$1,
	uvFrag: uvFrag,
	uvHemiSphericalFrag: uvHemiSphericalFrag,
	uvProjectionVert: uvProjectionVert,
	uvScaleFrag: uvScaleFrag,
	uvScaleFragPars: uvScaleFragPars,
	uvScaleUniforms: uvScaleUniforms,
	uvScroll2Vert: uvScroll2Vert,
	uvScrollUniforms: uvScrollUniforms,
	uvScrollVert: uvScrollVert,
	uvScrollVertPars: uvScrollVertPars,
	uvSphericalFrag: uvSphericalFrag,
	uvVert: uvVert,
	uvVertFragPars: uvVertFragPars,
	velvetFrag: velvetFrag,
	velvetFragPars: velvetFragPars,
	velvetUniforms: velvetUniforms,
	viewFrag: viewFrag,
	viewUniforms: viewUniforms,
	worldPositionVert: worldPositionVert,
	worldPositionVertFragPars: worldPositionVertFragPars,
};

const ShaderUtils = {

	UpdateShaderParameters( shader, parameters, camera ) {

		camera.updateMatrixWorld();
		camera.matrixWorldInverse = camera.matrixWorld.clone().invert();
		const viewMatrix = camera.matrixWorldInverse; // alias

		if ( shader.isEnable( [ 'AMBIENT', 'HEMISPHERE' ] ) ) {

			shader.uniforms.skyDirection.value
				.set( parameters.skyDirectionX, parameters.skyDirectionY, parameters.skyDirectionZ )
				.normalize()
				.transformDirection( viewMatrix );

		}

		const numDirectLight = shader.enables[ 'DIRECTLIGHT' ] || 0;
		const numPointLight = shader.enables[ 'POINTLIGHT' ] || 0;
		const numSpotLight = shader.enables[ 'SPOTLIGHT' ] || 0;
		if ( numDirectLight > 0 ) {

			for ( let i = 0; i < numDirectLight; ++i ) {

				shader.uniforms.directLights.value[ i ].direction
					.set( parameters.directLightX, parameters.directLightY, parameters.directLightZ )
					.normalize()
					.transformDirection( viewMatrix );

			}

		}

		if ( numPointLight > 0 ) {

			for ( let i = 0; i < numPointLight; ++i ) {

				shader.uniforms.pointLights.value[ i ].position.set(
					parameters.pointLightX,
					parameters.pointLightY,
					parameters.pointLightZ
				);
				shader.uniforms.pointLights.value[ i ].position.applyMatrix4( viewMatrix );

			}

		}

		if ( numSpotLight > 0 ) {

			for ( let i = 0; i < numSpotLight; ++i ) {

				shader.uniforms.spotLights.value[ i ].position.set(
					parameters.spotLightX,
					parameters.spotLightY,
					parameters.spotLightZ
				);
				shader.uniforms.spotLights.value[ i ].position.applyMatrix4( viewMatrix );
				shader.uniforms.spotLights.value[ i ].direction.copy( shader.uniforms.spotLights.value[ i ].position ).normalize();

			}

		}

	},

	GenerateShaderParametersGUI( shader, callback ) {

		const gui = new GUI();
		let h;
		let parameters = {};
		if ( callback === undefined ) callback = function ( key, value ) {};

		const updateCallback = function ( key, value ) {

			shader.uniforms[ key ].value = value;
			callback( key, value );

		};

		{

			h = gui.addFolder( 'Base' );

			if ( shader.isEnable( 'SKYDOME' ) ) {

				parameters.topColor = shader.uniforms.topColor.value.getHex();
				parameters.bottomColor = shader.uniforms.bottomColor.value.getHex();
				parameters.exponent = shader.uniforms.exponent.value;

				h.addColor( parameters, 'topColor' ).onChange( function ( value ) {

					shader.uniforms.topColor.value.setHex( value );
					callback( 'topColor', value );

				} );
				h.addColor( parameters, 'bottomColor' ).onChange( function ( value ) {

					shader.uniforms.bottomColor.value.setHex( value );
					callback( 'bottomColor', value );

				} );
				h.add( parameters, 'exponent', 0.0, 1.0 ).onChange( function ( value ) {

					updateCallback( 'exponent', value );

				} );

			} else {

				parameters.baseColor = shader.uniforms.diffuseColor.value.getHex();
				parameters.opacity = shader.uniforms.opacity.value;

				h.addColor( parameters, 'baseColor' ).onChange( function ( value ) {

					shader.uniforms.diffuseColor.value.setHex( value );
					callback( 'baseColor', value );

				} );
				h.add( parameters, 'opacity', 0.0, 1.0 ).onChange( function ( value ) {

					updateCallback( 'opacity', value );

				} );

			}

			if ( shader.isEnable( 'STANDARD' ) ) {

				parameters.roughness = shader.uniforms.roughness.value;
				parameters.metalness = shader.uniforms.metalness.value;
				h.add( parameters, 'roughness', 0.0, 1.0, 0.01 ).onChange( function ( value ) {

					updateCallback( 'roughness', value );

				} );
				h.add( parameters, 'metalness', 0.0, 1.0, 0.01 ).onChange( function ( value ) {

					updateCallback( 'metalness', value );

				} );

			}

		}

		if ( shader.isEnable( [ '+PHONG', '+FRESNEL', '+REFLECTION', '+ANISOTROPY' ] ) ) {

			h = gui.addFolder( 'Specular' );

			if ( shader.isEnable( 'FRESNEL' ) ) {

				parameters.fresnelExponent = shader.uniforms.fresnelExponent.value;
				parameters.fresnelReflectionScale = shader.uniforms.fresnelReflectionScale.value;
				h.add( parameters, 'fresnelExponent', 0.0, 5.0, 0.025 )
					.name( 'fresnel exponent' )
					.onChange( function ( value ) {

						updateCallback( 'fresnelExponent', value );

					} );
				h.add( parameters, 'fresnelReflectionScale', 0.0, 1.0, 0.025 )
					.name( 'fresnel scale' )
					.onChange( function ( value ) {

						updateCallback( 'fresnelReflectionScale', value );

					} );

			}

			if ( shader.isEnable( 'REFLECTION' ) ) {

				parameters.reflectionStrength = shader.uniforms.reflectionStrength.value;
				h.add( parameters, 'reflectionStrength', 0.0, 1.0, 0.025 )
					.name( 'reflectionStrength' )
					.onChange( function ( value ) {

						updateCallback( 'reflectionStrength', value );

					} );

			}

			if ( shader.isEnable( 'PHONG' ) ) {

				parameters.shininess = shader.uniforms.shininess.value;
				h.add( parameters, 'shininess', 1.0, 400.0, 1.0 ).onChange( function ( value ) {

					updateCallback( 'shininess', value );

				} );

			}

			if ( shader.isEnable( [ '+PHONG', '+SPECULARMAP' ] ) ) {

				parameters.specularStrength = shader.uniforms.specularStrength.value;
				h.add( parameters, 'specularStrength', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'specularStrength', value );

				} );

			}

			if ( shader.isEnable( 'ANISOTROPY' ) ) {

				parameters.anisotropyExponent = shader.uniforms.anisotropyExponent.value;
				parameters.anisotropyStrength = shader.uniforms.anisotropyStrength.value;
				parameters.anisotropyFresnel = shader.uniforms.anisotropyFresnel.value;
				parameters.anisotropyColor = shader.uniforms.anisotropyColor.value.getHex();
				h.add( parameters, 'anisotropyExponent', 0.0, 5000.0, 1.0 ).onChange( function ( value ) {

					updateCallback( 'anisotropyExponent', value );

				} );
				h.add( parameters, 'anisotropyStrength', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'anisotropyStrength', value );

				} );
				h.add( parameters, 'anisotropyFresnel', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'anisotropyFresnel', value );

				} );
				h.addColor( parameters, 'anisotropyColor' ).onChange( function ( value ) {

					shader.uniforms.anisotropyColor.value.setHex( value );
					callback( 'anisotropyColor', value );

				} );

			}

		}

		if ( shader.isEnable( 'EMISSIVE' ) ) {

			h = gui.addFolder( 'Emissive' );
			parameters.emissiveR = shader.uniforms.emissiveColor.value.r;
			parameters.emissiveG = shader.uniforms.emissiveColor.value.g;
			parameters.emissiveB = shader.uniforms.emissiveColor.value.b;

			const emissiveCallback = function ( _value ) {

				shader.uniforms.emissiveColor.value.setRGB( parameters.emissiveR, parameters.emissiveG, parameters.emissiveB );
				callback( 'emissiveColor', shader.uniforms.emissiveColor.value );

			};

			h.add( parameters, 'emissiveR', 0.0, 5.0, 0.01 ).onChange( emissiveCallback );
			h.add( parameters, 'emissiveG', 0.0, 5.0, 0.01 ).onChange( emissiveCallback );
			h.add( parameters, 'emissiveB', 0.0, 5.0, 0.01 ).onChange( emissiveCallback );

		}

		if ( shader.isEnable( [ '+NORMALMAP', '+BUMPMAP', '+PARALLAXMAP' ] ) ) {

			h = gui.addFolder( 'Bump' );

			if ( shader.isEnable( [ '+NORMALMAP', '+BUMPMAP' ] ) ) {

				parameters.bumpiness = shader.uniforms.bumpiness.value;
				h.add( parameters, 'bumpiness', 0.0, 1.0, 0.01 ).onChange( function ( value ) {

					updateCallback( 'bumpiness', value );

				} );

			}

			if ( shader.isEnable( 'PARALLAXMAP' ) ) {

				parameters.parallaxHeight = shader.uniforms.parallaxHeight.value;
				parameters.parallaxScale = shader.uniforms.parallaxScale.value;
				h.add( parameters, 'parallaxHeight', -1, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'parallaxHeight', value );

				} );
				h.add( parameters, 'parallaxScale', -1, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'parallaxScale', value );

				} );

			}

		}

		if ( shader.isEnable( [ '+BUMPOFFSET', '+PARALLAXOCCLUSIONMAP', '+RELIEFMAP' ] ) ) {

			h = gui.addFolder( 'Parallax' );
			if ( shader.isEnable( 'BUMPOFFSET' ) ) {

				parameters.parallaxHeight = shader.uniforms.parallaxHeight.value;
				h.add( parameters, 'parallaxHeight', 0.0, 0.5, 0.001 ).onChange( function ( value ) {

					updateCallback( 'parallaxHeight', value );

				} );

			}

			if ( shader.isEnable( [ '+PARALLAXOCCLUSIONMAP', '+RELIEFMAP' ] ) ) {

				parameters.parallaxScale = shader.uniforms.parallaxScale.value;
				h.add( parameters, 'parallaxScale', 0, 0.2, 0.001 ).onChange( function ( value ) {

					updateCallback( 'parallaxScale', value );

				} );

			}

		}

		if ( shader.isEnable( 'AOMAP' ) ) {

			h = gui.addFolder( 'Ambient Occlusion' );
			parameters.aoStrength = shader.uniforms.aoStrength.value;
			h.add( parameters, 'aoStrength', 0.0, 1.0, 0.01 ).onChange( function ( value ) {

				updateCallback( 'aoStrength', value );

			} );

		}

		if ( shader.isEnable( 'VELVET' ) ) {

			h = gui.addFolder( 'Velvet' );

			parameters.surfaceColor = shader.uniforms.surfaceColor.value.getHex();
			parameters.fuzzySpecColor = shader.uniforms.fuzzySpecColor.value.getHex();
			parameters.subColor = shader.uniforms.subColor.value.getHex();
			parameters.rollOff = shader.uniforms.rollOff.value;
			parameters.velvetStrength = shader.uniforms.velvetStrength.value;
			h.addColor( parameters, 'surfaceColor' ).onChange( function ( value ) {

				shader.unifomrs.surfaceColor.value.setHex( value );
				callback( 'surfaceColor', value );

			} );
			h.addColor( parameters, 'fuzzySpecColor' ).onChange( function ( value ) {

				shader.uniforms.fuzzySpecColor.value.setHex( value );
				callback( 'fuzzySpecColor', value );

			} );
			h.addColor( parameters, 'subColor' ).onChange( function ( value ) {

				shader.uniforms.subColor.value.setHex( value );
				callback( 'subColor', value );

			} );
			h.add( parameters, 'rollOff', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'rollOff', value );

			} );
			h.add( parameters, 'velvetStrength', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'velvetStrength', value );

			} );

		}

		if ( shader.isEnable( 'INNERGLOW' ) ) {

			h = gui.addFolder( 'InnerGlow' );

			parameters.innerGlowColor = shader.uniforms.innerGlowColor.value.getHex();
			parameters.innerGlowBase = shader.uniforms.innerGlowBase.value;
			parameters.innerGlowSub = shader.uniforms.innerGlowSub.value;
			parameters.innerGlowRange = shader.uniforms.innerGlowRange.value;
			h.addColor( parameters, 'innerGlowColor' ).onChange( function ( value ) {

				shader.uniforms.innerGlowColor.value.setHex( value );
				callback( 'innerGlowColor', value );

			} );
			h.add( parameters, 'innerGlowBase', 0.0, 128.0, 0.1 ).onChange( function ( value ) {

				updateCallback( 'innerGlowBase', value );

			} );
			h.add( parameters, 'innerGlowSub', 0.0, 10.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'innerGlowSub', value );

			} );
			h.add( parameters, 'innerGlowRange', 0.0, 1.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'innerGlowRange', value );

			} );

		}

		if ( shader.isEnable( 'LINEGLOW' ) ) {

			h = gui.addFolder( 'LineGlow' );

			parameters.lineGlowRange = shader.uniforms.lineGlowRange.value;
			parameters.lineGlowPower = shader.uniforms.lineGlowPower.value;
			parameters.lineGlowPlaneX = shader.uniforms.lineGlowPlane.value.x;
			parameters.lineGlowPlaneY = shader.uniforms.lineGlowPlane.value.y;
			parameters.lineGlowPlaneZ = shader.uniforms.lineGlowPlane.value.z;

			const cb = function ( _value ) {

				shader.uniforms.lineGlowPlane.value.set(
					parameters.lineGlowPlaneX,
					parameters.lineGlowPlaneY,
					parameters.lineGlowPlaneZ,
					shader.uniforms.lineGlowPlane.value.w
				);
				callback( 'lienGlowPlane', shader.uniforms.lineGlowPlane.value );

			};

			// h.addColor(effectparametersController, "lineGlowColor").onChange(callback);
			h.add( parameters, 'lineGlowRange', 0.0, 5.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'lineGlowRange', value );

			} );
			h.add( parameters, 'lineGlowPower', 0.0, 10.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'lineGlowPower', value );

			} );
			h.add( parameters, 'lineGlowPlaneX', 0.0, 1.0, 0.05 ).onChange( cb );
			h.add( parameters, 'lineGlowPlaneY', 0.0, 1.0, 0.05 ).onChange( cb );
			h.add( parameters, 'lineGlowPlaneZ', 0.0, 1.0, 0.05 ).onChange( cb );

		}

		if ( shader.isEnable( 'DISTORTION' ) ) {

			h = gui.addFolder( 'Distortion' );

			parameters.distortionStrength = shader.uniforms.distortionStrength.value;
			h.add( parameters, 'distortionStrength', -5, 5.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'distortionStrength', value );

			} );

		}

		if ( shader.isEnable( 'UVSCROLL' ) ) {

			h = gui.addFolder( 'UV Scroll' );

			parameters.uvScrollSpeedU = shader.uniforms.uvScrollSpeedU.value;
			parameters.uvScrollSpeedV = shader.uniforms.uvScrollSpeedV.value;
			h.add( parameters, 'uvScrollSpeedU', -5, 5.0, 0.01 ).onChange( function ( value ) {

				updateCallback( 'uvScrollSpeedU', value );

			} );
			h.add( parameters, 'uvScrollSpeedV', -5, 5.0, 0.01 ).onChange( function ( value ) {

				updateCallback( 'uvScrollSpeedV', value );

			} );

		}

		if ( shader.isEnable( 'GLASS' ) ) {

			h = gui.addFolder( 'Glass' );

			parameters.glassStrength = shader.uniforms.glassStrength.value;
			parameters.glassCurvature = shader.uniforms.glassCurvature.value;
			h.add( parameters, 'glassStrength', 0.0, 1.0, 0.01 ).onChange( function ( value ) {

				updateCallback( 'glassStrength', value );

			} );
			h.add( parameters, 'glassCurvature', 0.0, 2.0, 0.01 ).onChange( function ( value ) {

				updateCallback( 'glassCurvature', value );

			} );

		}

		if ( shader.isEnable( 'AMBIENT' ) ) {

			h = gui.addFolder( 'Ambient Light' );

			parameters.ambientColor = shader.uniforms.ambientColor.value.getHex();
			h.addColor( parameters, 'ambientColor' ).onChange( function ( value ) {

				shader.uniforms.ambientColor.value.setHex( value );
				callback( 'ambientColor', value );

			} );

			if ( shader.isEnable( 'HEMISPHERE' ) ) {

				// var skyDirectionCallback = function(value) {
				//   shader.uniforms.skyDirection.value.set(parameters.skyDirectionX, parameters.skyDirectionY, parameters.skyDirectionZ);
				//   callback("skyDirection", shader.uniforms.skyDirection.value);
				// };

				parameters.skyDirectionX = shader.uniforms.skyDirection.value.x;
				parameters.skyDirectionY = shader.uniforms.skyDirection.value.y;
				parameters.skyDirectionZ = shader.uniforms.skyDirection.value.z;
				parameters.groundColor = shader.uniforms.groundColor.value.getHex();
				h.add( parameters, 'skyDirectionX', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					callback( 'skyDirectionX', value );

				} );
				h.add( parameters, 'skyDirectionY', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					callback( 'skyDirectionY', value );

				} );
				h.add( parameters, 'skyDirectionZ', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					callback( 'skyDirectionZ', value );

				} );
				// h.add(parameters, "skyDirectionX", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
				// h.add(parameters, "skyDirectionY", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
				// h.add(parameters, "skyDirectionZ", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
				h.addColor( parameters, 'groundColor' ).onChange( function ( value ) {

					shader.uniforms.groundColor.value.setHex( value );
					callback( 'groundColor', value );

				} );

			}

		}

		const numDirectLight = shader.enables[ 'DIRECTLIGHT' ] || 0;
		const numPointLight = shader.enables[ 'POINTLIGHT' ] || 0;
		const numSpotLight = shader.enables[ 'SPOTLIGHT' ] || 0;
		if ( numDirectLight > 0 || numPointLight > 0 || numSpotLight > 0 ) {

			if ( numDirectLight > 0 ) {

				h = gui.addFolder( 'Direct Light' );

				parameters.directLightX = shader.uniforms.directLights.value[ 0 ].direction.x;
				parameters.directLightY = shader.uniforms.directLights.value[ 0 ].direction.y;
				parameters.directLightZ = shader.uniforms.directLights.value[ 0 ].direction.z;
				parameters.directLightColor = shader.uniforms.directLights.value[ 0 ].color.getHex();

				// var directLightDirCallback = function(value) {
				//   shader.uniforms.directLights.value[0].direction.set(parameters.directLightX, parameters.directLightY, parameters.directLightZ).normalize();
				//   callback("directLightDirection", shader.uniforms.directLights.value[0].direction);
				// };
				// h.add(parameters, "directLightX", -1.0, 1.0, 0.025).name("x").onChange(directLightDirCallback);
				// h.add(parameters, "directLightY", -1.0, 1.0, 0.025).name("y").onChange(directLightDirCallback);
				// h.add(parameters, "directLightZ", -1.0, 1.0, 0.025).name("z").onChange(directLightDirCallback);
				h.add( parameters, 'directLightX', -1, 1.0, 0.025 )
					.name( 'x' )
					.onChange( function ( value ) {

						callback( 'directLightX', value );

					} );
				h.add( parameters, 'directLightY', -1, 1.0, 0.025 )
					.name( 'y' )
					.onChange( function ( value ) {

						callback( 'directLightY', value );

					} );
				h.add( parameters, 'directLightZ', -1, 1.0, 0.025 )
					.name( 'z' )
					.onChange( function ( value ) {

						callback( 'directLightZ', value );

					} );
				h.addColor( parameters, 'directLightColor' )
					.name( 'color' )
					.onChange( function ( value ) {

						shader.uniforms.directLights.value[ 0 ].color.setHex( value );
						callback( 'directLightColor', value );

					} );

			}

			if ( numPointLight > 0 ) {

				h = gui.addFolder( 'Point Light' );

				parameters.pointLightX = shader.uniforms.pointLights.value[ 0 ].position.x;
				parameters.pointLightY = shader.uniforms.pointLights.value[ 0 ].position.y;
				parameters.pointLightZ = shader.uniforms.pointLights.value[ 0 ].position.z;
				parameters.pointLightColor = shader.uniforms.pointLights.value[ 0 ].color.getHex();
				parameters.pointLightDistance = shader.uniforms.pointLights.value[ 0 ].distance;
				parameters.pointLightDecay = shader.uniforms.pointLights.value[ 0 ].decay;
				// var pointLightPosCallback = function(value) {
				//   shader.uniforms.pointLights.value[0].position.set(parameters.pointLightX, parameters.pointLightY, parameters.pointLightZ);
				//   callback("pointLightPosition", shader.uniforms.pointLights.value[0].position);
				// };
				//
				// h.add(parameters, "pointLightX", -10.0, 10.0, 0.025).name("x").onChange(pointLightPosCallback);
				// h.add(parameters, "pointLightY", -10.0, 10.0, 0.025).name("y").onChange(pointLightPosCallback);
				// h.add(parameters, "pointLightZ", -10.0, 10.0, 0.025).name("z").onChange(pointLightPosCallback);
				h.add( parameters, 'pointLightX', -10, 10.0, 0.025 )
					.name( 'x' )
					.onChange( function ( value ) {

						callback( 'pointLightX', value );

					} );
				h.add( parameters, 'pointLightY', -10, 10.0, 0.025 )
					.name( 'y' )
					.onChange( function ( value ) {

						callback( 'pointLightY', value );

					} );
				h.add( parameters, 'pointLightZ', -10, 10.0, 0.025 )
					.name( 'z' )
					.onChange( function ( value ) {

						callback( 'pointLightZ', value );

					} );
				h.addColor( parameters, 'pointLightColor' )
					.name( 'color' )
					.onChange( function ( value ) {

						shader.uniforms.pointLights.value[ 0 ].color.setHex( value );
						callback( 'pointLightColor', value );

					} );
				h.add( parameters, 'pointLightDistance', 0.0, 100.0, 1.0 ).onChange( function ( value ) {

					shader.uniforms.pointLights.value[ 0 ].distance = value;
					callback( 'pointLightDistance', value );

				} );
				h.add( parameters, 'pointLightDecay', 0.0, 10.0, 0.025 ).onChange( function ( value ) {

					shader.uniforms.pointLights.value[ 0 ].decay = value;
					callback( 'pointLightDecay', value );

				} );

			}

			if ( numSpotLight > 0 ) {

				h = gui.addFolder( 'Spot Light' );

				parameters.spotLightX = shader.uniforms.spotLights.value[ 0 ].position.x;
				parameters.spotLightY = shader.uniforms.spotLights.value[ 0 ].position.y;
				parameters.spotLightZ = shader.uniforms.spotLights.value[ 0 ].position.z;
				parameters.spotLightColor = shader.uniforms.spotLights.value[ 0 ].color.getHex();
				parameters.spotLightDistance = shader.uniforms.spotLights.value[ 0 ].distance;
				parameters.spotLightDecay = shader.uniforms.spotLights.value[ 0 ].decay;
				parameters.spotLightAngle = shader.uniforms.spotLights.value[ 0 ].coneCos;
				parameters.spotLightPenumbra = shader.uniforms.spotLights.value[ 0 ].penumbraCos;
				// var spotLightPosCallback = function(value) {
				//   shader.uniforms.spotLights.value[0].position.set(parameters.spotLightX, parameters.spotLightY, parameters.spotLightZ);
				//   shader.uniforms.spotLights.value[0].direction.copy(shader.uniforms.spotLights.value[0].position).normalize();
				//   callback("spotLightPosition", shader.uniforms.spotLights.value[0].position);
				// };
				//
				// h.add(parameters, "spotLightX", -10.0, 10.0, 0.025).name("x").onChange(spotLightPosCallback);
				// h.add(parameters, "spotLightY", -10.0, 10.0, 0.025).name("y").onChange(spotLightPosCallback);
				// h.add(parameters, "spotLightZ", -10.0, 10.0, 0.025).name("z").onChange(spotLightPosCallback);
				h.add( parameters, 'spotLightX', -10, 10.0, 0.025 )
					.name( 'x' )
					.onChange( function ( value ) {

						callback( 'spotLightX', value );

					} );
				h.add( parameters, 'spotLightY', -10, 10.0, 0.025 )
					.name( 'y' )
					.onChange( function ( value ) {

						callback( 'spotLightY', value );

					} );
				h.add( parameters, 'spotLightZ', -10, 10.0, 0.025 )
					.name( 'z' )
					.onChange( function ( value ) {

						callback( 'spotLightZ', value );

					} );
				h.addColor( parameters, 'spotLightColor' )
					.name( 'color' )
					.onChange( function ( value ) {

						shader.uniforms.spotLights.value[ 0 ].color.setHex( value );
						callback( 'spotLightColor', value );

					} );
				h.add( parameters, 'spotLightDistance', 0.0, 50.0, 1.0 ).onChange( function ( value ) {

					shader.uniforms.spotLights.value[ 0 ].distance = value;
					callback( 'spotLightDistance', value );

				} );
				h.add( parameters, 'spotLightDecay', 1.0, 10.0, 0.025 ).onChange( function ( value ) {

					shader.uniforms.spotLights.value[ 0 ].decay = value;
					callback( 'spotLightDecay', value );

				} );
				h.add( parameters, 'spotLightAngle', 0.0001, Math.PI / 2.0, 0.025 ).onChange( function ( value ) {

					shader.uniforms.spotLights.value[ 0 ].coneCos = Math.cos( value );
					callback( 'spotLightConeCos', value );

				} );
				h.add( parameters, 'spotLightPenumbra', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					shader.uniforms.spotLights.value[ 0 ].penumbraCos = Math.cos( parameters.spotLightAngle * ( 1.0 - value ) );
					callback( 'spotLightPenumbraCos', value );

				} );

			}

		}

		if ( shader.isEnable( 'RIMLIGHT' ) ) {

			h = gui.addFolder( 'Rim Light' );

			parameters.rimLightColor = shader.uniforms.rimLightColor.value.getHex();
			parameters.rimLightCoef = shader.uniforms.rimLightCoef.value;
			h.addColor( parameters, 'rimLightColor' ).onChange( function ( value ) {

				shader.uniforms.rimLightColor.value.setHex( value );
				callback( 'rimLightColor', value );

			} );
			h.add( parameters, 'rimLightCoef', 0.0, 1.0, 0.05 ).onChange( function ( value ) {

				updateCallback( 'rimLightCoef', value );

			} );

		}

		if ( shader.isEnable( 'LIGHTMAP' ) ) {

			h = gui.addFolder( 'Light Map' );

			parameters.lightMapPower = shader.uniforms.lightMapPower.value;
			parameters.lightMapStrength = shader.uniforms.lightMapStrength.value;
			h.add( parameters, 'lightMapPower', 0.0, 10.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'lightMapPower', value );

			} );
			h.add( parameters, 'lightMapStrength', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'lightMapStrength', value );

			} );

		}

		if ( shader.isEnable( [ '+FOG', '+HEIGHTFOG' ] ) ) {

			h = gui.addFolder( 'Fog' );

			if ( shader.isEnable( 'FOG' ) ) {

				parameters.fogAlpha = shader.uniforms.fogAlpha.value;
				parameters.fogFar = shader.uniforms.fogFar.value;
				parameters.fogNear = shader.uniforms.fogNear.value;
				parameters.fogColor = shader.uniforms.fogColor.value.getHex();
				h.add( parameters, 'fogAlpha', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'fogAlpha', value );

				} );
				h.add( parameters, 'fogFar', 0.0, 100.0, 0.1 ).onChange( function ( value ) {

					updateCallback( 'fogFar', value );

				} );
				h.add( parameters, 'fogNear', 0.0, 100.0, 0.1 ).onChange( function ( value ) {

					updateCallback( 'fogNear', value );

				} );
				h.addColor( parameters, 'fogColor' ).onChange( function ( value ) {

					shader.uniforms.fogColor.value.setHex( value );
					callback( 'fogColor', value );

				} );

			}

			if ( shader.isEnable( 'HEIGHTFOG' ) ) {

				parameters.heightFogAlpha = shader.uniforms.heightFogAlpha.value;
				parameters.heightFogFar = shader.uniforms.heightFogFar.value;
				parameters.heightFogNear = shader.uniforms.heightFogNear.value;
				parameters.heightFogColor = shader.uniforms.heightFogColor.value.getHex();
				h.add( parameters, 'heightFogAlpha', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

					updateCallback( 'heightFogAlpha', value );

				} );
				h.add( parameters, 'heightFogFar', 0.0, 100.0, 0.1 ).onChange( function ( value ) {

					updateCallback( 'heightFogFar', value );

				} );
				h.add( parameters, 'heightFogNear', 0.0, 100.0, 0.1 ).onChange( function ( value ) {

					updateCallback( 'heightFogNear', value );

				} );
				h.addColor( parameters, 'heightFogColor' ).onChange( function ( value ) {

					shader.uniforms.heightFogColor.value.setHex( value );
					callback( 'heightFogColor', value );

				} );

			}

		}

		// if (shader.isEnable("PROJECTIONMAP")) {
		//   h = gui.addFolder("Projection Map");
		//
		//   parameters.projectionScale = shader.uniforms.projectionScale.value;
		//   h.add(parameters, "projectionScale", 0.0, 10.0, 0.025).onChange(function(value) { updateCallback("projectionScale", value); });
		// }

		if ( shader.isEnable( 'DISPLACEMENT' ) ) {

			h = gui.addFolder( 'Displacement' );

			parameters.displacementScale = shader.uniforms.displacementScale.value;
			parameters.displacementBias = shader.uniforms.displacementBias.value;
			h.add( parameters, 'displacementScale', 0.0, 10.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'displacementScale', value );

			} );
			h.add( parameters, 'displacementBias', 0.0, 10.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'displacementBias', value );

			} );

		}

		if ( shader.isEnable( 'SKY' ) ) {

			h = gui.addFolder( 'Sky' );

			parameters.skyTurbidity = shader.uniforms.skyTurbidity.value;
			parameters.skyRayleigh = shader.uniforms.skyRayleigh.value;
			parameters.skyMieCoefficient = shader.uniforms.skyMieCoefficient.value;
			parameters.skyMieDirectionalG = shader.uniforms.skyMieDirectionalG.value;
			parameters.skyLuminance = shader.uniforms.skyLuminance.value;
			// parameters.skyInclinataion = shader.uniforms.skyInclination.value;
			// parameters.skyAzimuth = shader.uniforms.skyAzimuth.value;
			h.add( parameters, 'skyTurbidity', 1.0, 20.0, 0.1 ).onChange( function ( value ) {

				updateCallback( 'skyTurbidity', value );

			} );
			h.add( parameters, 'skyRayleigh', 0.0, 4.0, 0.001 ).onChange( function ( value ) {

				updateCallback( 'skyRayleigh', value );

			} );
			h.add( parameters, 'skyMieCoefficient', 0.0, 0.1, 0.001 ).onChange( function ( value ) {

				updateCallback( 'skyMieCoefficient', value );

			} );
			h.add( parameters, 'skyMieDirectionalG', 0.0, 1.0, 0.001 ).onChange( function ( value ) {

				updateCallback( 'skyMieDirectionalG', value );

			} );
			h.add( parameters, 'skyLuminance', 0.0, 2.0, 0.1 ).onChange( function ( value ) {

				updateCallback( 'skyLuminance', value );

			} );
			// h.add(parameters, "skyInclination", 0, 1.0, 0.001).onChange(function(value) { updateCallback("skyInclination", value); });
			// h.add(parameters, "skyAzimuth", 0, 1.0, 0.001).onChange(function(value) { updateCallback("skyAzimuth", value); });

		}

		if ( shader.isEnable( 'GRASS' ) ) {

			h = gui.addFolder( 'Grass' );

			parameters.grassWindDirectionX = shader.uniforms.grassWindDirection.value.x;
			parameters.grassWindDirectionY = shader.uniforms.grassWindDirection.value.y;
			parameters.grassWindDirectionZ = shader.uniforms.grassWindDirection.value.z;
			parameters.grassWindPower = shader.uniforms.grassWindPower.value;

			var grassCallback = function ( _value ) {

				shader.uniforms.grassWindDirection.value.set(
					parameters.grassWindDirectionX,
					parameters.grassWindDirectionY,
					parameters.grassWindDirectionZ
				);
				callback( 'grassWindDirection', shader.uniforms.grassWindDirection.value );

			};

			h.add( parameters, 'grassWindDirectionX', 0.0, 1.0, 0.025 ).onChange( grassCallback );
			h.add( parameters, 'grassWindDirectionY', 0.0, 1.0, 0.025 ).onChange( grassCallback );
			h.add( parameters, 'grassWindDirectionZ', 0.0, 1.0, 0.025 ).onChange( grassCallback );
			h.add( parameters, 'grassWindPower', 0.0, 2.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'grassWindPower', value );

			} );

		}

		if ( shader.isEnable( 'CLOUDS' ) ) {

			h = gui.addFolder( 'Clouds' );

			parameters.cloudsScale = shader.uniforms.cloudsScale.value;
			parameters.cloudsBrightness = shader.uniforms.cloudsBrightness.value;
			// parameters.cloudsSpeed = shader.uniforms.cloudsSpeed.value;
			h.add( parameters, 'cloudsScale', 0.0, 1.0 ).onChange( function ( value ) {

				updateCallback( 'cloudsScale', value );

			} );
			h.add( parameters, 'cloudsBrightness', 0.0, 1.0 ).onChange( function ( value ) {

				updateCallback( 'cloudsBrightness', value );

			} );
			// h.add(parameters, "cloudsSpeed", 0.0, 2.0).onChange(function(value) { updateCallback("cloudsSpeed", value); });

		}

		if ( shader.isEnable( 'GODRAY' ) ) {

			h = gui.addFolder( 'GodRay' );

			parameters.godRayStrength = shader.uniforms.godRayStrength.value;
			parameters.godRayIntensity = shader.uniforms.godRayIntensity.value;
			parameters.godRaySunColor = shader.uniforms.godRaySunColor.value.getHex();
			parameters.godRayBgColor = shader.uniforms.godRayBgColor.value.getHex();
			h.add( parameters, 'godRayStrength', 0.0, 1.0 ).onChange( function ( value ) {

				updateCallback( 'godRayStrength', value );

			} );
			h.add( parameters, 'godRayIntensity', 0.0, 2.0 ).onChange( function ( value ) {

				updateCallback( 'godRayIntensity', value );

			} );
			h.addColor( parameters, 'godRaySunColor' ).onChange( function ( value ) {

				shader.uniforms.godRaySunColor.value.setHex( value );
				callback( 'godRaySunColor', value );

			} );
			h.addColor( parameters, 'godRayBgColor' ).onChange( function ( value ) {

				shader.uniforms.godRayBgColor.value.setHex( value );
				callback( 'godRayBgColor', value );

			} );

		}

		if ( shader.isEnable( 'RECEIVESHADOW' ) ) {

			h = gui.addFolder( 'Shadow' );

			parameters.shadowBias = shader.uniforms.shadowBias.value;
			parameters.shadowDensity = shader.uniforms.shadowDensity.value;
			h.add( parameters, 'shadowBias', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'shadowBias', value );

			} );
			h.add( parameters, 'shadowDensity', 0.0, 1.0, 0.025 ).onChange( function ( value ) {

				updateCallback( 'shadowDensity', value );

			} );

		}

		if ( shader.isEnable( 'TONEMAPPING' ) || shader.isEnable( 'SKY' ) ) {

			h = gui.addFolder( 'ToneMapping', 0, 10 );

			parameters.toneMappingExposure = shader.uniforms.toneMappingExposure.value;
			parameters.toneMappingWhitePoint = shader.uniforms.toneMappingWhitePoint.value;
			h.add( parameters, 'toneMappingExposure', 0.0, 10.0 ).onChange( function ( value ) {

				updateCallback( 'toneMappingExposure', value );

			} );
			h.add( parameters, 'toneMappingWhitePoint', 0.0, 10.0 ).onChange( function ( value ) {

				updateCallback( 'toneMappingWhitePoint', value );

			} );

		}

		return { gui: gui, parameters: parameters };

	},
};

class AreaLight {

	constructor() {

		this.position = new THREE$1.Vector3();
		this.color = new THREE$1.Color( 0xffffff );
		this.distance = 50.0;
		this.decay = 1.0;
		this.radius = 1.0;

	}

}

class TubeLight {

	constructor() {

		this.start = new THREE$1.Vector3();
		this.end = new THREE$1.Vector3();
		this.color = new THREE$1.Color( 0xffffff );
		this.distance = 50.0;
		this.decay = 1.0;
		this.radius = 1.0;

	}

}

class RectLight {

	constructor() {

		this.positions = [];
		this.normal = new THREE$1.Vector3( 0, 0, 1 );
		this.tangent = new THREE$1.Vector3( 1, 0, 0 );
		this.color = new THREE$1.Color( 0xffffff );
		this.intensity = 1.0;
		this.width = 1.0;
		this.height = 1.0;
		this.distance = 50.0;
		this.decay = 1.0;
		this.matrix = new THREE$1.Matrix4();
		this.numPositions = 4;

	}

}

class Shader {

	constructor() {

		this.enables = {};
		this.uniforms = [];
		this.material = null;
		this.debugCode = [];

	}

	enable( key, value ) {

		this.enables[ key ] = value === undefined ? 1 : value;

	}

	clear() {

		this.enables = {};

	}

	setParameter( key, value ) {

		if ( key in this.uniforms ) {

			if ( this.uniforms[ key ].value instanceof THREE$1.Color ) {

				if ( value instanceof THREE$1.Color ) {

					this.uniforms[ key ].value.copy( value );

				} else {

					this.uniforms[ key ].value.copy( new THREE$1.Color( value ) );

				}

			} else if (
				this.uniforms[ key ].value instanceof THREE$1.Color ||
				this.uniforms[ key ].value instanceof THREE$1.Vector2 ||
				this.uniforms[ key ].value instanceof THREE$1.Vector3 ||
				this.uniforms[ key ].value instanceof THREE$1.Vector4 ||
				this.uniforms[ key ].value instanceof THREE$1.Matrix3 ||
				this.uniforms[ key ].value instanceof THREE$1.Matrix4
			) {

				this.uniforms[ key ].value.copy( value );

			} else if (
				this.uniforms[ key ].value instanceof THREE$1.CubeTexture ||
				this.uniforms[ key ].value instanceof THREE$1.Texture
			) {

				this.uniforms[ key ].value = value;

			} else if ( this.uniforms[ key ].value instanceof Array ) {

				for ( let i = 0; i < value.length; ++i ) {

					this.uniforms[ key ].value[ i ] = value[ i ];

				}

			} else {

				this.uniforms[ key ].value = value;

			}

		}

	}

	setParameters( values ) {

		for ( let key in values ) {

			this.setParameter( key, values[ key ] );

		}

	}

	setArrayParameter( arrayKey, index, key, value ) {

		if ( arrayKey in this.uniforms ) {

			if ( key in this.uniforms[ arrayKey ].value[ index ] ) {

				if (
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Color ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector2 ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector3 ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector4 ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Matrix3 ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Matrix4
				) {

					this.uniforms[ arrayKey ].value[ index ][ key ].copy( value );

				} else if (
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.CubeTexture ||
					this.uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Texture
				) {

					this.uniforms[ arrayKey ].value[ index ][ key ] = value;

				} else if ( this.uniforms[ arrayKey ].value[ index ][ key ] instanceof Array ) {

					for ( var i = 0; i < value.length; ++i ) {

						this.uniforms[ arrayKey ].value[ index ][ key ][ i ] = value[ i ];

					}

				} else {

					this.uniforms[ arrayKey ].value[ index ][ key ] = value;

				}

			}

		}

	}

	setLightParameter( index, light, camera ) {

		camera.updateMatrixWorld();
		camera.matrixWorldInverse = camera.matrixWorld.clone().invert();

		if ( light instanceof THREE$1.DirectionalLight ) {

			const direction = light.position.clone().applyMatrix4( camera.matrixWorldInverse );
			const targetPos = light.target.position.clone().applyMatrix4( camera.matrixWorldInverse );
			direction.sub( targetPos ).normalize();
			this.setDirectLightParameter( index, direction, light.color );

		} else if ( light instanceof THREE$1.PointLight ) {

			const viewPos = light.position.clone();
			viewPos.applyMatrix4( camera.matrixWorldInverse );
			this.setPointLightParameter( index, viewPos, light.color, light.distance, light.decay );

		} else if ( light instanceof THREE$1.SpotLight ) {

			const viewPos = light.position.clone();
			viewPos.applyMatrix4( camera.matrixWorldInverse );
			const viewDir = viewPos.clone().normalize();
			this.setSpotLightParameter(
				index,
				viewPos,
				viewDir,
				light.color,
				light.distance,
				light.decay,
				Math.cos( light.angle ),
				Math.cos( light.angle * ( 1.0 - light.penumbra ) )
			);

		} else if ( light instanceof THREE$1.AmbientLight ) {

			this.setParameter( 'ambientColor', light.color );

		} else if ( light instanceof AreaLight ) {

			const viewPos = light.position.clone();
			viewPos.applyMatrix4( camera.matrixWorldInverse );
			this.setAreaLightParameter( index, viewPos, light.color, light.distance, light.decay, light.radius );

		} else if ( light instanceof TubeLight ) {

			const start = new THREE$1.Vector3().copy( light.start );
			start.applyMatrix4( camera.matrixWorldInverse );
			const end = new THREE$1.Vector3().copy( light.end );
			end.applyMatrix4( camera.matrixWorldInverse );
			this.setTubeLightParameter( index, start, end, light.color, light.distance, light.decay, light.radius );

		} else if ( light instanceof RectLight ) {

			const matrix = new THREE$1.Matrix4();
			matrix.copy( camera.matrixWorldInverse );
			matrix.multiply( light.matrix );

			const positions = [];
			for ( let i = 0; i < light.positions.length; ++i ) {

				const p = new THREE$1.Vector3().copy( light.positions[ i ] );
				p.applyMatrix4( matrix );
				positions.push( p );

			}

			const normal = new THREE$1.Vector3( 0, 0, 1 ).applyMatrix4( matrix );
			const tangent = new THREE$1.Vector3( 1, 0, 0 ).applyMatrix4( matrix );

			this.setRectLightParameter(
				index,
				positions,
				normal,
				tangent,
				light.width,
				light.height,
				light.color,
				light.intensity,
				light.distance,
				light.decay
			);

		}

	}

	setDirectLightParameter( index, direction, color ) {

		this.setArrayParameter( 'directLights', index, 'direction', direction );
		this.setArrayParameter( 'directLights', index, 'color', color );

	}

	setPointLightParameter( index, position, color, distance, decay ) {

		this.setArrayParameter( 'pointLights', index, 'position', position );
		this.setArrayParameter( 'pointLights', index, 'color', color );
		this.setArrayParameter( 'pointLights', index, 'distance', distance );
		this.setArrayParameter( 'pointLights', index, 'decay', decay );

	}

	setSpotLightParameter( index, position, direction, color, distance, decay, coneCos, penumbraCos ) {

		this.setArrayParameter( 'spotLights', index, 'position', position );
		this.setArrayParameter( 'spotLights', index, 'direction', direction );
		this.setArrayParameter( 'spotLights', index, 'color', color );
		this.setArrayParameter( 'spotLights', index, 'distance', distance );
		this.setArrayParameter( 'spotLights', index, 'decay', decay );
		this.setArrayParameter( 'spotLights', index, 'coneCos', coneCos );
		this.setArrayParameter( 'spotLights', index, 'penumbraCos', penumbraCos );

	}

	setAreaLightParameter( index, position, color, distance, decay, radius ) {

		this.setArrayParameter( 'areaLights', index, 'position', position );
		this.setArrayParameter( 'areaLights', index, 'color', color );
		this.setArrayParameter( 'areaLights', index, 'distance', distance );
		this.setArrayParameter( 'areaLights', index, 'decay', decay );
		this.setArrayParameter( 'areaLights', index, 'radius', radius );

	}

	setTubeLightParameter( index, start, end, color, distance, decay, radius ) {

		this.setArrayParameter( 'tubeLights', index, 'start', start );
		this.setArrayParameter( 'tubeLights', index, 'end', end );
		this.setArrayParameter( 'tubeLights', index, 'color', color );
		this.setArrayParameter( 'tubeLights', index, 'distance', distance );
		this.setArrayParameter( 'tubeLights', index, 'decay', decay );
		this.setArrayParameter( 'tubeLights', index, 'radius', radius );

	}

	setRectLightParameter(
		index,
		positions,
		normal,
		tangent,
		width,
		height,
		color,
		intensity,
		distance,
		decay
	) {

		this.setArrayParameter( 'rectLights', index, 'numPositions', positions.length );
		for ( let i = 0; i < positions.length; ++i ) {

			this.uniforms.rectLights.value[ index ].positions[ i ].copy( positions[ i ] );

		}

		this.setArrayParameter( 'rectLights', index, 'normal', normal );
		this.setArrayParameter( 'rectLights', index, 'tangent', tangent );
		this.setArrayParameter( 'rectLights', index, 'width', width );
		this.setArrayParameter( 'rectLights', index, 'height', height );
		this.setArrayParameter( 'rectLights', index, 'color', color );
		this.setArrayParameter( 'rectLights', index, 'intensity', intensity );
		this.setArrayParameter( 'rectLights', index, 'distance', distance );
		this.setArrayParameter( 'rectLights', index, 'decay', decay );

	}

	////////////////////////////////////////////////////////////////////////////

	// +AAA : OR
	// -BBB : NOT
	isEnable( keys ) {

		if ( !keys ) return true;

		if ( keys instanceof Array ) {

			if ( keys.length === 0 ) {

				return true;

			}

			let check = 0;
			for ( let i in keys ) {

				if ( keys[ i ][ 0 ] === '-' ) {

					if ( this.isEnable( keys[ i ].substr( 1 ) ) ) {

						return false;

					}

				} else if ( keys[ i ][ 0 ] === '+' ) {

					if ( check === 0 ) {

						check = 1;

					}

					if ( this.isEnable( keys[ i ].substr( 1 ) ) ) {

						check = 2;

					}

				} else {

					if ( this.isEnable( keys[ i ] ) === false ) {

						return false;

					}

				}

			}

			if ( check > 0 && check < 2 ) {

				return false;

			}

			return true;

		} else {

			return keys in this.enables;

		}

	}

	_addUniform( uniforms, keys, chunk ) {

		if ( this.isEnable( keys ) ) {

			uniforms.push( ShaderChunk$1[ chunk ] );

		}

	}

	// MARK: UNIFORMS
	_generateUniforms() {

		const result = [];

		result.push( {
			diffuseColor: { value: new THREE$1.Color() },
			opacity: { value: 1.0 },
		} );

		const numDirectLight = this.enables[ 'DIRECTLIGHT' ] || 0;
		const numPointLight = this.enables[ 'POINTLIGHT' ] || 0;
		const numSpotLight = this.enables[ 'SPOTLIGHT' ] || 0;
		if ( numDirectLight > 0 ) result.push( ShaderChunk$1.lightsDirectUniforms );
		if ( numPointLight > 0 ) result.push( ShaderChunk$1.lightsPointUniforms );
		if ( numSpotLight > 0 ) result.push( ShaderChunk$1.lightsSpotUniforms );

		const numAreaLight = this.enables[ 'AREALIGHT' ] || 0;
		const numTubeLight = this.enables[ 'TUBELIGHT' ] || 0;
		const numRectLight = this.enables[ 'RECTLIGHT' ] || 0;
		if ( numAreaLight > 0 ) result.push( ShaderChunk$1.lightsAreaLightUniforms );
		if ( numTubeLight > 0 ) result.push( ShaderChunk$1.lightsTubeLightUniforms );
		if ( numRectLight > 0 ) result.push( ShaderChunk$1.lightsRectLightUniforms );

		this._addUniform( result, [ 'AMBIENT' ], 'ambientUniforms' );
		this._addUniform( result, [ 'AMBIENT', 'HEMISPHERE' ], 'ambientHemisphereUniforms' );
		this._addUniform( result, [ 'PHONG' ], 'phongUniforms' );
		this._addUniform( result, [ 'PHONG', 'SPECULARMAP' ], 'specularMapUniforms' );
		this._addUniform( result, [ 'PHONG', '-SPECULARMAP' ], 'specularUniforms' );
		this._addUniform( result, [ 'STANDARD' ], 'standardUniforms' );
		this._addUniform( result, [ 'ROUGHNESSMAP' ], 'roughnessMapUniforms' );
		this._addUniform( result, [ 'METALNESSMAP' ], 'metalnessMapUniforms' );
		this._addUniform( result, [ 'TOON' ], 'toonUniforms' );
		this._addUniform( result, [ 'REFLECTION' ], 'reflectionUniforms' );
		this._addUniform( result, [ 'REFLECTION', 'FRESNEL' ], 'fresnelUniforms' );
		this._addUniform( result, [ 'VELVET' ], 'velvetUniforms' );
		this._addUniform( result, [ 'INNERGLOW' ], 'innerGlowUniforms' );
		this._addUniform( result, [ 'LINEGLOW' ], 'lineGlowUniforms' );
		this._addUniform( result, [ 'RIMLIGHT' ], 'rimLightUniforms' );
		this._addUniform( result, [ 'COLORMAP' ], 'colorMapUniforms' );
		this._addUniform( result, [ 'NORMALMAP' ], 'normalMapUniforms' );
		this._addUniform( result, [ 'BUMPMAP' ], 'bumpMapUniforms' );
		this._addUniform( result, [ '+BUMPOFFSET', '+PARALLAXMAP' ], 'parallaxMapUniforms' );
		this._addUniform( result, [ 'PARALLAXOCCLUSIONMAP' ], 'parallaxOcclusionMapUniforms' );
		this._addUniform( result, [ 'RELIEFMAP' ], 'reliefMapUniforms' );
		this._addUniform( result, [ 'DISTORTION' ], 'distortionUniforms' );
		this._addUniform( result, [ '+UVSCROLL', '+UVSCROLL2' ], 'uvScrollUniforms' );
		this._addUniform( result, [ 'UVSCALE' ], 'uvScaleUniforms' );
		this._addUniform( result, [ 'GLASS' ], 'glassUniforms' );
		this._addUniform( result, [ 'ANISOTROPY' ], 'anisotropyUniforms' );
		this._addUniform( result, [ 'AOMAP' ], 'aoMapUniforms' );
		this._addUniform( result, [ 'LIGHTMAP' ], 'lightMapUniforms' );
		this._addUniform( result, [ 'BILLBOARD' ], 'billboardUniforms' );
		this._addUniform( result, [ 'FOG' ], 'fogUniforms' );
		this._addUniform( result, [ 'HEIGHTFOG' ], 'heightFogUniforms' );
		this._addUniform( result, [ 'HEIGHTFOG', 'HEIGHTFOGMAP' ], 'heightFogMapUniforms' );
		this._addUniform( result, [ 'PROJECTIONMAP' ], 'projectionMapUniforms' );
		this._addUniform( result, [ 'DISPLACEMENTMAP' ], 'displacementMapUniforms' );
		this._addUniform( result, [ 'CLIPPINGPLANE' ], 'clippingPlaneUniforms' );
		this._addUniform( result, [ 'SKY' ], 'skyUniforms' );
		this._addUniform( result, [ 'SKYDOME' ], 'skyDomeUniforms' );
		this._addUniform( result, [ 'GRASS' ], 'grassUniforms' );
		this._addUniform( result, [ 'OVERLAY' ], 'overlayUniforms' );
		this._addUniform( result, [ 'OVERLAYNORMAL' ], 'overlayNormalUniforms' );
		this._addUniform( result, [ '+DITHER' ], 'timeUniforms' );
		this._addUniform( result, [ 'CASTSHADOW' ], 'castShadowUniforms' );
		this._addUniform( result, [ 'RECEIVESHADOW' ], 'receiveShadowUniforms' );
		this._addUniform( result, [ 'DEPTHSHADOW' ], 'depthShadowUniforms' );
		this._addUniform( result, [ 'CLOUDS' ], 'cloudsUniforms' );
		this._addUniform( result, [ '+TONEMAPPING', '+SKY' ], 'toneMappingUniforms' );
		this._addUniform( result, [ 'DEFERRED_GEOMETRY' ], 'deferredGeometryUniforms' );
		this._addUniform( result, [ 'DEFERRED_LIGHT' ], 'deferredLightUniforms' );
		this._addUniform( result, [ 'VIEW' ], 'viewUniforms' );
		this._addUniform( result, [ 'EMISSIVE' ], 'emissiveUniforms' );
		this._addUniform( result, [ 'EMISSIVEMAP' ], 'emissiveMapUniforms' );
		return THREE$1.UniformsUtils.clone( THREE$1.UniformsUtils.merge( result ) );

	}

	_addCode( codes, keys, chunk, chunk2 ) {

		if ( this.isEnable( keys ) ) {

			codes.push( '// begin [' + chunk + ']' );
			codes.push( ShaderChunk$1[ chunk ] );
			codes.push( '// end [' + chunk + ']' );
			codes.push( '' );

		} else if ( chunk2 !== undefined ) {

			codes.push( '// begin [' + chunk2 + ']' );
			codes.push( ShaderChunk$1[ chunk2 ] );
			codes.push( '// end [' + chunk2 + ']' );
			codes.push( '' );

		}

	}

	_addDebugCode( codes, keys ) {

		if ( this.isEnable( keys ) ) {

			codes.push( '// begin [DEBUGCODE]' );
			for ( let l of this.debugCode ) {

				codes.push( l );

			}

			codes.push( '// end [DEBUGCODE]' );
			codes.push( '' );

		}

	}

	// MARK: VERTEX
	_generateVertexShader() {

		const codes = [];
		this._addCode( codes, [ 'GLSL3' ], 'glsl3Vert' );

		// DEFFERED

		if ( this.isEnable( 'DEFERRED_GEOMETRY' ) ) {

			this._addCode( codes, [], 'deferredGeometryVert' );
			return codes.join( '\n' );

		}

		if ( this.isEnable( 'DEFERRED_LIGHT' ) ) {

			this._addCode( codes, [], 'deferredLightVert' );
			return codes.join( '\n' );

		}

		// FORWARD

		this._addCode( codes, [], 'common' );
		this._addCode( codes, [ '+CASTSHADOW', '+RECEIVESHADOW' ], 'packing' );
		this._addCode( codes, [], 'worldPositionVertFragPars' );
		codes.push( 'varying vec3 vViewPosition;' );
		codes.push( 'varying vec3 vNormal;' );
		codes.push( '' );

		this._addCode(
			codes,
			[
				'+COLORMAP',
				'+NORMALMAP',
				'+BUMPMAP',
				'+PROJECTIONMAP',
				'+OVERLAY',
				'+DEPTHSHADOW',
				'+CLOUDS',
				'+VIEW',
				'+EMISSIVEMAP',
			],
			'uvVertFragPars'
		);
		this._addCode(
			codes,
			[ '+NORMALMAP', '+BUMPOFFSET', '+PARALLAXOCCLUSIONMAP', '+RELIEFMAP', '+ANISOTROPY', '+OVERLAYNORMAL' ],
			'tangentVertPars'
		);
		this._addCode( codes, [ '+UVSCROLL', '+UVSCROLL2' ], 'uvScrollVertPars' );
		this._addCode( codes, [ '+GLASS', '+DITHER' ], 'screenVertPars' );
		this._addCode( codes, [ 'DISTORTION' ], 'distortionVertPars' );
		this._addCode( codes, [ 'ANISOTROPY' ], 'anisotropyVertPars' );
		this._addCode( codes, [ 'FOG' ], 'fogVertPars' );
		this._addCode( codes, [ 'HEIGHTFOG' ], 'heightFogVertPars' );
		this._addCode( codes, [ 'PROJECTIONMAP' ], 'projectionMapVertPars' );
		this._addCode( codes, [ 'DISPLACEMENTMAP' ], 'displacementMapVertPars' );
		this._addCode( codes, [ 'GRASS' ], 'grassVertPars' );
		this._addCode( codes, [ 'CASTSHADOW', 'GRASS' ], 'instanceCastShadowVertPars' );
		this._addCode( codes, [ 'CASTSHADOW', '-GRASS' ], 'castShadowVertPars' );
		this._addCode( codes, [ 'RECEIVESHADOW' ], 'receiveShadowVertPars' );

		if ( this.isEnable( [ 'BILLBOARD' ] ) ) {

			this._addCode( codes, [], 'billboardVertPars' );
			this._addCode( codes, [], 'billboardVert' );
			this._addCode( codes, [ 'BILLBOARDY' ], 'billboardYVert', 'billboardDefaultVert' );
			this._addCode( codes, [ 'BILLBOARDROTZ' ], 'billboardRotZVertEnd', 'billboardVertEnd' );

		} else if ( this.isEnable( [ 'CASTSHADOW' ] ) ) {

			codes.push( 'void main() {' );
			this._addCode( codes, [ 'GRASS' ], 'instanceCastShadowVert' );
			this._addCode( codes, [ '-GRASS' ], 'castShadowVert' );

		} else {

			codes.push( 'void main() {' );
			codes.push( '  vec3 transformed = position;' );
			codes.push( '  vec3 objectNormal = vec3(normal);' );

			this._addCode( codes, [ 'DISPLACEMENTMAP' ], 'displacementMapVert' );
			this._addCode( codes, [], 'worldPositionVert' );
			this._addCode( codes, [ 'GRASS' ], 'grassVert' );

			codes.push( '  vec4 mvPosition = viewMatrix * vec4(vWorldPosition, 1.0);' );
			codes.push( '  vec4 hpos = projectionMatrix * mvPosition;' );

			if ( this.isEnable( [ '+NORMALMAP', '+ANISOTROPY', '+OVERLAYNORMAL' ] ) ) {

				codes.push( '  vNormal.xyz = inverseTransformDirection(objectNormal, modelMatrix);' );

			} else {

				codes.push( '  vNormal.xyz = normalMatrix * objectNormal;' );

			}

			codes.push( '  vViewPosition = -mvPosition.xyz;' );
			codes.push( '' );

		}

		// chunk here
		if (
			this.isEnable( [
				'+COLORMAP',
				'+NORMALMAP',
				'+BUMPMAP',
				'+OVERLAY',
				'+DEPTHSHADOW',
				'+CLOUDS',
				'+VIEW',
				'+EMISSIVEMAP',
			] )
		) {

			this._addCode( codes, [ 'UVPROJECTION' ], 'uvProjectionVert', 'uvVert' );
			this._addCode( codes, [ 'UVSCROLL' ], 'uvScrollVert' );
			this._addCode( codes, [ 'DISTORTION' ], 'distortionVert' );
			this._addCode( codes, [ 'UVSCROLL2' ], 'uvScroll2Vert' );

		}

		this._addCode(
			codes,
			[ '+NORMALMAP', '+BUMPOFFSET', '+PARALLAXOCCLUSIONMAP', '+RELIEFMAP', '+ANISOTROPY', '+OVERLAYNORMAL' ],
			'tangentVert'
		);
		this._addCode( codes, [ '+GLASS', '+DITHER' ], 'screenVert' );
		this._addCode( codes, [ 'GLASS' ], 'glassVert' );
		this._addCode( codes, [ 'ANISOTRPY' ], 'anisotropyVert' );
		this._addCode( codes, [ 'FOG' ], 'fogVert' );
		this._addCode( codes, [ 'HEIGHTFOG' ], 'heightFogVert' );
		this._addCode( codes, [ 'PROJECTIONMAP' ], 'projectionMapVert' );
		this._addCode( codes, [ 'RECEIVESHADOW' ], 'receiveShadowVert' );

		codes.push( '  gl_Position = hpos;' );
		codes.push( '}' );

		return codes.join( '\n' );

	}

	// MARK: FRAGMENTS
	_generateFragmentShader() {

		const codes = [];

		// DEFERRED

		if ( this.isEnable( 'DEFERRED_GEOMETRY' ) ) {

			codes.push( "#define MULTIRENDERCOLOR" );
			this._addCode( codes, [ 'GLSL3' ], 'glsl3Frag' );
			this._addCode( codes, [], 'deferredGeometryFrag' );
			return codes.join( '\n' );

		}

		if ( this.isEnable( 'DEFERRED_LIGHT' ) ) {

			this._addCode( codes, [ 'GLSL3' ], 'glsl3Frag' );
			this._addCode( codes, [], 'deferredLightFrag' );
			return codes.join( '\n' );

		}

		this._addCode( codes, [ 'GLSL3' ], 'glsl3Frag' );

		// FORWARD

		if ( this.isEnable( 'VIEW' ) ) {

			this._addCode( codes, [], 'viewFrag' );
			return codes.join( '\n' );

		}

		this._addCode( codes, [], 'common' );

		if ( this.isEnable( [ 'CASTSHADOW' ] ) ) {

			this._addCode( codes, [], 'packing' );
			this._addCode( codes, [], 'castShadowFragPars' );
			this._addCode( codes, [ 'GRASS' ], 'uvVertFragPars' );
			this._addCode( codes, [ 'GRASS' ], 'colorMapFragPars' );

			codes.push( '' );
			codes.push( 'void main() {' );

			this._addCode( codes, [ 'GRASS' ], 'instanceColorMapDiscardFrag' );
			this._addCode( codes, [], 'castShadowFrag' );

			codes.push( '}' );
			return codes.join( '\n' );

		}

		if ( this.isEnable( [ 'DEPTHSHADOW' ] ) ) {

			this._addCode( codes, [], 'packing' );
			this._addCode( codes, [], 'uvVertFragPars' );
			this._addCode( codes, [], 'depthShadowFragPars' );

			codes.push( '' );
			codes.push( 'void main() {' );

			this._addCode( codes, [], 'depthShadowFrag' );

			codes.push( '}' );
			return codes.join( '\n' );

		}

		if ( this.isEnable( [ 'DEPTH' ] ) ) {

			// this._addCode(codes, [], "packing");
			this._addCode( codes, [], 'depthFragPars' );

			codes.push( '' );
			codes.push( 'void main() {' );

			this._addCode( codes, [], 'depthFrag' );

			codes.push( '}' );
			return codes.join( '\n' );

		}

		this._addCode( codes, [ 'RECEIVESHADOW' ], 'packing' );
		this._addCode( codes, [ 'AMBIENT' ], 'ambientFragPars' );
		this._addCode( codes, [ 'AMBIENT', 'HEMISPHERE' ], 'ambientHemisphereFragPars' );
		// this._addCode(codes, ["DEPTH"], "depthFragPars");

		const numDirectLight = this.enables[ 'DIRECTLIGHT' ] || 0;
		const numPointLight = this.enables[ 'POINTLIGHT' ] || 0;
		const numSpotLight = this.enables[ 'SPOTLIGHT' ] || 0;
		codes.push( this._generateLightsFragPars( numDirectLight, numPointLight, numSpotLight ) );

		const numAreaLight = this.enables[ 'AREALIGHT' ] || 0;
		const numTubeLight = this.enables[ 'TUBELIGHT' ] || 0;
		const numRectLight = this.enables[ 'RECTLIGHT' ] || 0;
		codes.push( this._generateAreaLightsFragPars( numAreaLight, numTubeLight, numRectLight ) );

		codes.push( 'uniform vec3 diffuseColor;' );
		codes.push( 'uniform float opacity;' );
		codes.push( 'varying vec3 vNormal;' );
		codes.push( 'varying vec3 vViewPosition;' );
		codes.push( '' );

		this._addCode( codes, [], 'worldPositionVertFragPars' );
		this._addCode( codes, [ 'STANDARD' ], 'bsdfs' );
		this._addCode( codes, [ 'STANDARD' ], 'standardFragPars' );
		this._addCode( codes, [ 'STANDARD', 'ROUGHNESSMAP' ], 'roughnessMapFragPars' );
		this._addCode( codes, [ 'STANDARD', 'METALNESSMAP' ], 'metalnessMapFragPars' );
		this._addCode( codes, [ 'PHONG' ], 'phongFragPars' );
		this._addCode( codes, [ 'PHONG', 'SPECULARMAP' ], 'specularMapFragPars' );
		this._addCode( codes, [ 'PHONG', '-SPECULARMAP' ], 'specularFragPars' );
		this._addCode( codes, [ 'TOON' ], 'toonFragPars' );
		this._addCode( codes, [ 'REFLECTION' ], 'reflectionFragPars' );
		this._addCode( codes, [ 'REFLECTION', 'FRESNEL' ], 'fresnelFragPars' );
		this._addCode( codes, [ 'REFLECTION', '-FRESNEL', 'STANDARD' ], 'lightsPars' );
		this._addCode( codes, [ 'VELVET' ], 'velvetFragPars' );
		this._addCode( codes, [ 'INNERGLOW' ], 'innerGlowFragPars' );
		this._addCode( codes, [ 'LINEGLOW' ], 'lineGlowFragPars' );
		this._addCode( codes, [ 'RIMLIGHT' ], 'rimLightFragPars' );
		this._addCode(
			codes,
			[ '+COLORMAP', '+NORMALMAP', '+PROJECTIONMAP', '+OVERLAY', '+CLOUDS', '+EMISSIVEMAP' ],
			'uvVertFragPars'
		);
		this._addCode( codes, [ 'UVSCALE' ], 'uvScaleFragPars' );
		this._addCode( codes, [ 'COLORMAP' ], 'colorMapFragPars' );
		this._addCode(
			codes,
			[ '+NORMALMAP', '+BUMPOFFSET', '+PARALLAXOCCLUSIONMAP', '+RELIEFMAP', '+ANISOTROPY', '+OVERLAYNORMAL' ],
			'tangentFragPars'
		);
		this._addCode( codes, [ 'NORMALMAP' ], 'normalMapFragPars' );
		this._addCode( codes, [ '+BUMPOFFSET', '+PARALLAXMAP' ], 'parallaxMapFragPars' );
		this._addCode( codes, [ 'PARALLAXOCCLUSIONMAP' ], 'parallaxOcclusionMapFragPars' );
		this._addCode( codes, [ 'RELIEFMAP' ], 'reliefMapFragPars' );
		this._addCode( codes, [ 'BUMPMAP' ], 'bumpMapFragPars' );
		this._addCode( codes, [ 'PROJECTIONMAP' ], 'projectionMapFragPars' );
		this._addCode( codes, [ 'DISTORTION' ], 'distortionFragPars' );
		this._addCode( codes, [ 'GLASS' ], 'glassFragPars' );
		this._addCode( codes, [ 'ANISOTROPY' ], 'anisotropyFragPars' );
		this._addCode( codes, [ 'AOMAP' ], 'aoMapFragPars' );
		this._addCode( codes, [ 'LIGHTMAP' ], 'lightMapFragPars' );
		this._addCode( codes, [ 'FOG' ], 'fogFragPars' );
		this._addCode( codes, [ 'HEIGHTFOG' ], 'heightFogFragPars' );
		this._addCode( codes, [ 'HEIGHTFOG', 'HEIGHTFOGMAP' ], 'heightFogMapFragPars' );
		this._addCode( codes, [ 'CLIPPINGPLANE' ], 'clippingPlaneFragPars' );
		this._addCode( codes, [ 'SKY' ], 'skyFragPars' );
		this._addCode( codes, [ 'SKYDOME' ], 'skyDomeFragPars' );
		this._addCode( codes, [ 'OVERLAY' ], 'overlayFragPars' );
		this._addCode( codes, [ 'OVERLAYNORMAL' ], 'overlayNormalFragPars' );
		this._addCode( codes, [ 'DITHER' ], 'ditherFragPars' );
		this._addCode( codes, [ '+DITHER' ], 'timeFragPars' );
		this._addCode( codes, [ 'RECEIVESHADOW' ], 'receiveShadowFragPars' );
		this._addCode( codes, [ 'CLOUDS' ], 'cloudsFragPars' );
		this._addCode( codes, [ '+TONEMAPPING', '+SKY' ], 'toneMappingFragPars' );
		this._addCode( codes, [ 'EMISSIVE' ], 'emissiveFragPars' );
		this._addCode( codes, [ 'EMISSIVEMAP' ], 'emissiveMapFragPars' );

		// if (this.check(["TONEMAPPING"])) {
		//   codes.push("vec3 toneMapping(vec3) { return " + this.enables["TONEMAPPING"] + "ToneMapping(x); }");
		// }

		if ( numAreaLight > 0 ) {

			this._addCode( codes, [], 'standardAreaLightFrag' );

		}

		if ( numTubeLight > 0 ) {

			this._addCode( codes, [], 'standardTubeLightFrag' );

		}

		if ( numRectLight > 0 ) {

			this._addCode( codes, [], 'standardRectLightFrag' );

		}

		if ( numDirectLight > 0 || numPointLight > 0 || numSpotLight > 0 ) {

			codes.push( 'void updateLight(inout IncidentLight directLight) {' );

			this._addCode( codes, [ '-SKY', '-NOLIT', 'RECEIVESHADOW' ], 'receiveShadowFrag' );

			codes.push( '}' );
			codes.push( '' );
			codes.push(
				'void computeLight(const in IncidentLight directLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {'
			);

			// lighting chunk here
			this._addCode( codes, [ 'PHONG', 'TOON' ], 'toonFrag' );
			this._addCode( codes, [ 'PHONG', '-TOON' ], 'phongFrag' );
			this._addCode( codes, [ 'STANDARD', 'ORENNAYAR' ], 'standardOrenNayarFrag' );
			this._addCode( codes, [ 'STANDARD', '-ORENNAYAR' ], 'standardFrag' );
			this._addCode( codes, [ '-STANDARD', '-PHONG' ], 'lambertFrag' );
			this._addCode( codes, [ 'VELVET' ], 'velvetFrag' );
			this._addCode( codes, [ 'RIMLIGHT' ], 'rimLightFrag' );
			this._addCode( codes, [ 'ANISOTROPY' ], 'anisotropyFrag' );

			codes.push( '}' );
			codes.push( '' );

		}

		codes.push( 'void main() {' );

		this._addCode( codes, [ 'CLIPPINGPLANE' ], 'clippingPlaneFrag' );
		this._addCode( codes, [], 'beginFrag' );
		this._addCode( codes, [ 'DEBUG' ], 'beginFragDebug' );
		// this._addCode(codes, ["CLIPPINGPLANEALPHA"], "clippingPlaneFrag");

		// chunk here
		this._addCode( codes, [ 'AMBIENT', 'HEMISPHERE' ], 'ambientHemisphereFrag' );
		this._addCode( codes, [ 'AMBIENT', '-HEMISPHERE' ], 'ambientFrag' );
		this._addCode( codes, [ '+COLORMAP', '+NORMALMAP', '+BUMPMAP', '+OVERLAY', '+CLOUDS', '+EMISSIVEMAP' ], 'uvFrag' );
		this._addCode( codes, [ 'UVSPHERICAL' ], 'uvSphericalFrag' );
		this._addCode( codes, [ 'UVHEMISPHERICAL' ], 'uvHemiSphericalFrag' );
		this._addCode( codes, [ 'UVSCALE' ], 'uvScaleFrag' );
		this._addCode( codes, [ 'PARALLAXMAP' ], 'parallaxMapFrag' );
		this._addCode( codes, [ 'PARALLAXOCCLUSIONMAP' ], 'parallaxOcclusionMapFrag' );
		this._addCode( codes, [ 'RELIEFMAP' ], 'reliefMapFrag' );
		this._addCode( codes, [ 'BUMPOFFSET' ], 'parallaxFrag' );
		this._addCode( codes, [ 'DISTORTION' ], 'distortionFrag' );
		this._addCode( codes, [ 'COLORMAP' ], 'colorMapFrag' );
		this._addCode( codes, [ 'COLORMAP', 'COLORMAPALPHA' ], 'colorMapAlphaFrag' );
		this._addCode( codes, [ 'OPACITY' ], 'opacityFrag' );
		this._addCode( codes, [ 'DITHER' ], 'ditherFrag' );
		this._addCode( codes, [ 'DISCARD' ], 'discardFrag' );
		this._addCode( codes, [ 'OVERLAY' ], 'overlayFrag' );
		this._addCode( codes, [ 'OVERLAYNORMAL' ], 'overlayNormalFrag' );
		this._addCode( codes, [ 'NORMALMAP' ], 'normalMapFrag' );
		this._addCode( codes, [ 'BUMPMAP' ], 'bumpMapFrag' );
		this._addCode( codes, [ 'PHONG', 'SPECULARMAP' ], 'specularMapFrag' );
		this._addCode( codes, [ 'PHONG', '-SPECULARMAP' ], 'specularFrag' );
		this._addCode( codes, [ 'STANDARD' ], 'roughnessFrag' );
		this._addCode( codes, [ 'STANDARD', 'ROUGHNESSMAP' ], 'roughnessMapFrag' );
		this._addCode( codes, [ 'STANDARD' ], 'metalnessFrag' );
		this._addCode( codes, [ 'STANDARD', 'METALNESSMAP' ], 'metalnessMapFrag' );
		this._addCode( codes, [ 'STANDARD' ], 'lightsStandardFrag' );
		this._addCode( codes, [ 'SKY' ], 'skyFrag' );
		this._addCode( codes, [ '-SKY', 'NOLIT' ], 'nolitFrag' );
		if ( this.isEnable( [ '-SKY', '-NOLIT' ] ) ) {

			codes.push( this._generateLightsFrag( numDirectLight, numPointLight, numSpotLight ) );
			codes.push( this._generateAreaLightsFrag( numAreaLight, numTubeLight, numRectLight ) );

		}

		this._addCode( codes, [ 'SKYDOME' ], 'skyDomeFrag' );
		this._addCode( codes, [ 'REFLECTION', 'FRESNEL' ], 'fresnelFrag' );
		this._addCode( codes, [ 'REFLECTION', '-FRESNEL', 'STANDARD' ], 'reflectionStandardFrag' );
		this._addCode( codes, [ 'REFLECTION', '-FRESNEL', '-STANDARD' ], 'reflectionFrag' );
		this._addCode( codes, [ 'LIGHTMAP' ], 'lightMapFrag' );
		this._addCode( codes, [ 'GLASS' ], 'glassFrag' );
		this._addCode( codes, [ 'AOMAP' ], 'aoMapFrag' );
		this._addCode( codes, [ 'PROJECTIONMAP' ], 'projectionMapFrag' );
		this._addCode( codes, [ 'INNERGLOW', 'INNERGLOWSUBTRACT' ], 'innerGlowSubtractFrag' );
		this._addCode( codes, [ 'INNERGLOW', '-INNERGLOWSUBTRACT' ], 'innerGlowFrag' );
		this._addCode( codes, [ 'LINEGLOW' ], 'lineGlowFrag' );
		// this._addCode(codes, ["DEPTH"], "depthFrag");
		this._addCode( codes, [ 'CLOUDS' ], 'cloudsFrag' );

		this._addCode( codes, [ 'EMISSIVE' ], 'emissiveFrag' );
		this._addCode( codes, [ 'EMISSIVEMAP' ], 'emissiveMapFrag' );
		this._addCode( codes, [], 'accumulateFrag' );

		this._addCode( codes, [ 'FOG' ], 'fogFrag' );
		this._addCode( codes, [ 'HEIGHTFOG', 'HEIGHTFOGMAP' ], 'heightFogMapFrag' );
		this._addCode( codes, [ 'HEIGHTFOG', '-HEIGHTFOGMAP' ], 'heightFogFrag' );
		this._addCode( codes, [ 'TONEMAPPING' ], 'toneMappingFrag' );

		this._addCode( codes, [], 'endFrag' );
		this._addCode( codes, [ 'DEBUG' ], 'endFragDebug' );
		this._addDebugCode( codes, [ 'DEBUGCODE' ] );
		codes.push( '}' );

		return codes.join( '\n' );

	}

	_generateLightsFragPars( numDirect, numPoint, numSpot ) {

		if ( numDirect <= 0 && numPoint <= 0 && numSpot <= 0 ) {

			return '';

		}

		const code = [];
		code.push( ShaderChunk$1[ 'lightsFragPars' ] );

		if ( numDirect > 0 ) {

			code.push( '#define PIXY_DIRECT_LIGHTS_NUM ' + numDirect );
			code.push( 'uniform DirectLight directLights[ PIXY_DIRECT_LIGHTS_NUM ];' );

		}

		if ( numPoint > 0 ) {

			code.push( '#define PIXY_POINT_LIGHTS_NUM ' + numPoint );
			code.push( 'uniform PointLight pointLights[ PIXY_POINT_LIGHTS_NUM ];' );

		}

		if ( numSpot > 0 ) {

			code.push( '#define PIXY_SPOT_LIGHTS_NUM ' + numSpot );
			code.push( 'uniform SpotLight spotLights[ PIXY_SPOT_LIGHTS_NUM ];' );

		}

		return code.join( '\n' );

	}

	_generateAreaLightsFragPars( numArea, numTube, numRect ) {

		if ( numArea <= 0 && numTube <= 0 && numRect <= 0 ) {

			return '';

		}

		const code = [];
		code.push( ShaderChunk$1[ 'lightsFragPars' ] );

		if ( numArea > 0 ) {

			code.push( '#define PIXY_AREA_LIGHTS_NUM ' + numArea );
			code.push( 'uniform AreaLight areaLights[ PIXY_AREA_LIGHTS_NUM ];' );

		}

		if ( numTube > 0 ) {

			code.push( '#define PIXY_TUBE_LIGHTS_NUM ' + numTube );
			code.push( 'uniform TubeLight tubeLights[ PIXY_TUBE_LIGHTS_NUM ];' );

		}

		if ( numRect > 0 ) {

			code.push( '#define PIXY_RECT_LIGHTS_NUM ' + numRect );
			code.push( 'uniform RectLight rectLights[ PIXY_RECT_LIGHTS_NUM ];' );

		}

		return code.join( '\n' );

	}

	_generateLightsFrag( numDirect, numPoint, numSpot ) {

		if ( numDirect <= 0 && numPoint <= 0 && numSpot <= 0 ) {

			return '';

		}

		const code = [];

		code.push( '  IncidentLight directLight;' );

		if ( numDirect == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsDirectFragUnroll' ] );

		} else if ( numDirect > 0 ) {

			code.push( ShaderChunk$1[ 'lightsDirectFrag' ] );

		}

		if ( numPoint == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsPointFragUnroll' ] );

		} else if ( numPoint > 0 ) {

			code.push( ShaderChunk$1[ 'lightsPointFrag' ] );

		}

		if ( numSpot == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsSpotFragUnroll' ] );

		} else if ( numSpot > 0 ) {

			code.push( ShaderChunk$1[ 'lightsSpotFrag' ] );

		}

		return code.join( '\n' );

	}

	_generateAreaLightsFrag( numArea, numTube, numRect ) {

		if ( numArea <= 0 && numTube <= 0 && numRect <= 0 ) {

			return '';

		}

		const code = [];

		code.push( '  IncidentLight directLight;' );

		if ( numArea == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsAreaLightFragUnroll' ] );

		} else if ( numArea > 0 ) {

			code.push( ShaderChunk$1[ 'lightsAreaLightFrag' ] );

		}

		if ( numTube == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsTubeLightFragUnroll' ] );

		} else if ( numTube > 0 ) {

			code.push( ShaderChunk$1[ 'lightsTubeLightFrag' ] );

		}

		if ( numRect == 1 ) {

			// THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
			code.push( ShaderChunk$1[ 'lightsRectLightFragUnroll' ] );

		} else if ( numRect > 0 ) {

			code.push( ShaderChunk$1[ 'lightsRectLightFrag' ] );

		}

		return code.join( '\n' );

	}

	setDebugCode( debugCode ) {

		this.debugCode = debugCode;

	}

	build( options ) {

		this.uniforms = this._generateUniforms();

		const params = {
			uniforms: this.uniforms,
			vertexShader: this._generateVertexShader(),
			fragmentShader: this._generateFragmentShader(),
		};

		if ( this.isEnable( [ '+DEFERRED_GEOMETRY', '+DEFERRED_LIGHT' ] ) ) {

			this.material = new THREE$1.RawShaderMaterial( Object.assign( params, options ) );

			if ( this.isEnable( [ 'GLSL3' ] ) ) {

				this.material.glslVersion = THREE$1.GLSL3;

			}

			this.material.extensions.derivatives = true;

			return;

		}

		this.material = new THREE$1.ShaderMaterial( Object.assign( params, options ) );

		if ( /* this.isEnable('NORMALMAP') || */ this.isEnable( 'BUMPMAP' ) /* || this.isEnable('PARALLAXOCCLUSIONMAP')*/ ) {

			this.material.extensions.derivatives = true;

		}

		if ( this.isEnable( [ 'STANDARD', 'REFLECTION' ] ) /* || this.isEnable('PARALLAXOCCLUSIONMAP')*/ ) {

			this.material.extensions.shaderTextureLOD = true;

		}

	}

}

const ShaderLib = {
	copy: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.copyUniforms ] ),
		vertexShader: ShaderChunk$1.copyVert,
		fragmentShader: ShaderChunk$1.copyFrag,
	},

	// convolution: {
	//   uniforms: THREE.UniformsUtils.merge([
	//     ShaderChunk.convolutionUniforms
	//   ]),
	//   vertexShader: ShaderChunk.convolutionVert,
	//   fragmentShader: ShaderChunk.convolutionFrag
	// },

	id: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.idUniforms ] ),
		vertexShader: ShaderChunk$1.idVert,
		fragmentShader: ShaderChunk$1.idFrag,
	},

	edge: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.edgeUniforms ] ),
		vertexShader: ShaderChunk$1.edgeVert,
		fragmentShader: ShaderChunk$1.edgeFrag,
	},

	edgeExpand: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.edgeExpandUniforms ] ),
		vertexShader: ShaderChunk$1.edgeExpandVert,
		fragmentShader: ShaderChunk$1.edgeExpnadFrag,
	},

	edgeID: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.edgeIDUniforms ] ),
		vertexShader: ShaderChunk$1.edgeIDVert,
		fragmentShader: ShaderChunk$1.edgeIDFrag,
	},

	edgeComposite: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.edgeCompositeUniforms ] ),
		vertexShader: ShaderChunk$1.edgeCompositeVert,
		fragmentShader: ShaderChunk$1.edgeCompositeFrag,
	},

	luminosityHighPass: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.luminosityHighPassUniforms ] ),
		vertexShader: ShaderChunk$1.luminosityHighPassVert,
		fragmentShader: ShaderChunk$1.luminosityHighPassFrag,
	},

	luminosity: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.luminosityUniforms ] ),
		vertexShader: ShaderChunk$1.luminosityVert,
		fragmentShader: ShaderChunk$1.luminosityFrag,
	},

	toneMap: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.toneMapUniforms ] ),
		vertexShader: ShaderChunk$1.toneMapVert,
		fragmentShader: ShaderChunk$1.toneMapFrag,
	},

	ssao: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.ssaoUniforms ] ),
		vertexShader: ShaderChunk$1.ssaoVert,
		fragmentShader: ShaderChunk$1.ssaoFrag,
	},

	ssao2: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.ssao2Uniforms ] ),
		vertexShader: ShaderChunk$1.ssaoVert,
		fragmentShader: ShaderChunk$1.ssao2Frag,
	},

	ssao2Blur: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.ssao2BlurUniforms ] ),
		vertexShader: ShaderChunk$1.copyVert,
		fragmentShader: ShaderChunk$1.ssao2BlurFrag,
	},

	ssao2Composite: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.ssao2CompositeUniforms ] ),
		vertexShader: ShaderChunk$1.copyVert,
		fragmentShader: ShaderChunk$1.ssao2CompositeFrag,
	},

	fxaa: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.antiAliasUniforms ] ),
		vertexShader: ShaderChunk$1.antiAliasVert,
		fragmentShader: ShaderChunk$1.antiAliasFrag,
	},

	colorBalance: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.colorBalanceUniforms ] ),
		vertexShader: ShaderChunk$1.copyVert,
		fragmentShader: ShaderChunk$1.colorBalanceFrag,
	},

	view: {
		uniforms: THREE$1.UniformsUtils.merge( [ ShaderChunk$1.viewUniforms ] ),
		vertexShader: ShaderChunk$1.copyVert,
		fragmentShader: ShaderChunk$1.viewFrag,
	},
};

//-------------------------------------------------------------------------
// http://stackoverflow.com/questions/23674744/what-is-the-equivalent-of-python-any-and-all-functions-in-javascript
function any( iterable ) {

	for ( let i = 0; i < iterable.length; ++i ) {

		if ( iterable[ i ] ) {

			return true;

		}

	}

	return false;

}

function all( iterable ) {

	for ( let i = 0; i < iterable.length; ++i ) {

		if ( !iterable[ i ] ) {

			return false;

		}

	}

	return true;

}

//-------------------------------------------------------------------------
function radians( deg ) {

	return ( deg * Math.PI ) / 180;

}

function degrees( rad ) {

	return ( rad * 180 ) / Math.PI;

}

function pow2( x ) {

	return x * x;

}

//-------------------------------------------------------------------------
// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.
function gauss( x, sigma ) {

	return Math.exp( -( x * x ) / ( 2.0 * sigma * sigma ) );

}

//-------------------------------------------------------------------------
function buildKernel( sigma ) {

	const kMaxKernelSize = 25;
	let kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;
	if ( kernelSize > kMaxKernelSize ) {

		kernelSize = kMaxKernelSize;

	}

	const halfWidth = ( kernelSize - 1 ) * 0.5;
	const values = new Array( kernelSize );
	const sum = 0.0;
	for ( let i = 0; i < kernelSize; ++i ) {

		values[ i ] = gauss( i - halfWidth, sigma );
		sum += values[ i ];

	}

	// normalize the kenrel
	for ( let i = 0; i < kernelSize; ++i ) {

		values[ i ] /= sum;

	}

	return values;

}

//-------------------------------------------------------------------------
function buildGause( sigma, num ) {

	const weights = new Array( num );
	const d = sigma * sigma;
	let t = 0.0;
	for ( let i = 0; i < weights.length; ++i ) {

		const r = 1.0 + 2.0 * i;
		weights[ i ] = Math.exp( ( -0.5 * ( r * r ) ) / d );
		t += weights[ i ];

	}

	for ( let i = 0; i < weights.length; ++i ) {

		weights[ i ] /= t;

	}

	return weights;

}

//-------------------------------------------------------------------------
// export function createCubeMap() {

// 	const path = 'assets/textures/cubemap/parliament/';
// 	const format = '.jpg';
// 	const urls = [
// 		path + 'posx' + format,
// 		path + 'negx' + format,
// 		path + 'posy' + format,
// 		path + 'negy' + format,
// 		path + 'posz' + format,
// 		path + 'negz' + format,
// 	];

// 	const textureCube = THREE.ImageUtils.loadTextureCube( urls );
// 	return textureCube;

// }

//-------------------------------------------------------------------------
// export function createMesh( geom, texture, normal ) {

// 	geom.computeVertexNormals();
// 	if ( normal ) {

// 		const t = THREE.ImageUtils.loadTexture( 'assets/textures/general/' + texture );
// 		const m = THREE.ImageUtils.loadTexture( 'assets/textures/general/' + normal );
// 		const mat2 = new THREE.MeshPhongMaterial( {
// 			map: t,
// 			normalMap: m,
// 		} );
// 		const mesh = new THREE.Mesh( geom, mat2 );
// 		return mesh;

// 	} else {

// 		// const t = THREE.ImageUtils.loadTexture( 'assets/textures/general/' + texture );
// 		const mat1 = new THREE.MeshPhongMaterial( {} );
// 		const mesh = new THREE.Mesh( geom, mat1 );
// 		return mesh;

// 	}

// }

//-------------------------------------------------------------------------
function createPlaneReflectMatrix( n, d ) {

	const matrix = new THREE$1.Matrix4();
	matrix.set(
		1 - Math.pow( 2 * n.x, 2.0 ),
		-2 * n.x * n.y,
		-2 * n.x * n.z,
		0,
		-2 * n.x * n.y,
		1 - Math.pow( 2 * n.y, 2.0 ),
		-2 * n.y * n.z,
		0,
		-2 * n.x * n.z,
		-2 * n.y * n.z,
		1 - Math.pow( 2 * n.z, 2.0 ),
		0,
		-2 * d * n.x,
		-2 * d * n.y,
		-2 * d * n.z,
		1
	);
	return matrix;

}

//-------------------------------------------------------------------------
function createShadowedLight( x, y, z, color, intensity ) {

	const light = new THREE$1.DirectionalLight( color, intensity );
	const d = 1;
	light.position.set( x, y, z );
	light.castShadow = true;
	light.shadow.camera.left = -1;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = -1;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 4;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.bias = -5e-3;
	return light;

}

//-------------------------------------------------------------------------
function clearTextOut( id ) {

	document.getElementById( id ).innerHTML = '';

}

//-------------------------------------------------------------------------
function textOut( id, text ) {

	document.getElementById( id ).innerHTML += text + '<br>';

}

//-------------------------------------------------------------------------
function textOutMatrix4( matrix ) {

	let s = '';
	for ( let i = 0; i < 4; ++i ) {

		s += ( '        ' + matrix.elements[ i * 4 + 0 ] ).slice( -8 ) + ', ';
		s += ( '        ' + matrix.elements[ i * 4 + 1 ] ).slice( -8 ) + ', ';
		s += ( '        ' + matrix.elements[ i * 4 + 2 ] ).slice( -8 ) + ', ';
		s += ( '        ' + matrix.elements[ i * 4 + 3 ] ).slice( -8 ) + '<br>';

	}

	textOut( s.replace( /\ /g, '&nbsp;' ) );

}

//-------------------------------------------------------------------------
function floatFormat( number, n ) {

	const _pow = Math.pow( 10, n );
	return Math.ceil( number * _pow ) / _pow;

}

//-------------------------------------------------------------------------
function dumpMatrix4( matrix ) {

	const s = '';
	for ( const i = 0; i < 4; ++i ) {

		// s += ("        " + matrix.elements[i*4+0]).slice(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+1]).slice(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+2]).slice(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+3]).slice(-8) + "\n";
		s += ( '        ' + floatFormat( matrix.elements[ i * 4 + 0 ], 5 ) ).slice( -8 ) + ', ';
		s += ( '        ' + floatFormat( matrix.elements[ i * 4 + 1 ], 5 ) ).slice( -8 ) + ', ';
		s += ( '        ' + floatFormat( matrix.elements[ i * 4 + 2 ], 5 ) ).slice( -8 ) + ', ';
		s += ( '        ' + floatFormat( matrix.elements[ i * 4 + 3 ], 5 ) ).slice( -8 ) + '\n';

	}

	console.log( s );

}

const Solar = {
	// https://github.com/LocusEnergy/solar-calculations/blob/master/src/main/java/com/locusenergy/solarcalculations/SolarCalculations.java

	calcJulianDate: function ( date ) {

		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		if ( month <= 2 ) {

			year--;
			month += 12;

		}

		const a = Math.floor( year / 100 );
		const b = 2 - a + Math.floor( a / 4 );
		return (
			Math.floor( 365.25 * ( year + 4716 ) ) +
			Math.floor( 30.6001 * ( month + 1 ) ) +
			day +
			b -
			1524.5
		);

	},

	calcTimeDecimal: function ( date ) {

		return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

	},

	getOffset: function ( _date ) {

		// UTC -> JST
		return ( 9 * 60 * 60 * 1000 ) / 3600000; // msec

	},

	// assumes datetime given in local time
	calcTimeJulian: function ( date ) {

		const jd = this.calcJulianDate( date );
		const time = this.calcTimeDecimal( date );
		const offset = this.getOffset( date );
		return ( jd + ( time - offset ) / 24 - 2451545 ) / 36525;

	},

	calcMeanObliquityOfEcliptic: function ( timeJulian ) {

		const seconds =
			21.448 -
			timeJulian * ( 46.815 + timeJulian * ( 0.00059 - timeJulian * 0.001813 ) );
		return 23 + ( 26 + seconds / 60 ) / 60;

	},

	calcObliquityCorrection: function ( timeJulian ) {

		const e0 = this.calcMeanObliquityOfEcliptic( timeJulian );
		const omega = 125.04 - 1934.136 * timeJulian;
		return e0 + 0.00256 * Math.cos( radians( omega ) );

	},

	calcGeomMeanLongSun: function ( timeJulian ) {

		let output =
			280.46646 + timeJulian * ( 36000.76983 + 0.0003032 * timeJulian );
		while ( output > 360 ) output -= 360;
		while ( output < 0 ) output += 360;
		return output;

	},

	calcGeomMeanAnomalySun: function ( timeJulian ) {

		return 357.52911 + timeJulian * ( 35999.05029 - 0.0001537 * timeJulian );

	},

	calcEccentricityEarthOrbit: function ( timeJulian ) {

		return 0.016708634 - timeJulian * ( 0.000042037 + 0.0000001267 * timeJulian );

	},

	calcSunEqOfCenter: function ( timeJulian ) {

		const m = this.calcGeomMeanAnomalySun( timeJulian );
		return (
			Math.sin( radians( m ) ) *
				( 1.914602 - timeJulian * ( 0.004817 + 0.000014 * timeJulian ) ) +
			Math.sin( radians( m * 2 ) ) * ( 0.019993 - 0.000101 * timeJulian ) +
			Math.sin( radians( m * 3 ) ) * 0.000289
		);

	},

	calcSunTrueLong: function ( timeJulian ) {

		return (
			this.calcGeomMeanLongSun( timeJulian ) + this.calcSunEqOfCenter( timeJulian )
		);

	},

	calcSunApparentLong: function ( timeJulian ) {

		const o = this.calcSunTrueLong( timeJulian );
		const omega = 125.04 - 1934.136 * timeJulian;
		return o - 0.00569 - 0.00478 * Math.sin( radians( omega ) );

	},

	calcSolarDeclination: function ( date ) {

		const timeJulian = this.calcTimeJulian( date );
		const e = this.calcObliquityCorrection( timeJulian );
		const lambda = this.calcSunApparentLong( timeJulian );
		const sint = Math.sin( radians( e ) ) * Math.sin( radians( lambda ) );
		return degrees( Math.asin( sint ) );

	},

	calcEquationOfTime: function ( date ) {

		const timeJulian = this.calcTimeJulian( date );
		const epsilon = this.calcObliquityCorrection( timeJulian );
		const l0 = this.calcGeomMeanLongSun( timeJulian );
		const e = this.calcEccentricityEarthOrbit( timeJulian );
		const m = this.calcGeomMeanAnomalySun( timeJulian );
		const y = pow2( Math.tan( radians( epsilon / 2 ) ) );
		const sin2l0 = Math.sin( radians( 2 * l0 ) );
		const sinm = Math.sin( radians( m ) );
		const cos2l0 = Math.cos( radians( 2 * l0 ) );
		const sin4l0 = Math.sin( radians( 4 * l0 ) );
		const sin2m = Math.sin( radians( 2 * m ) );
		const eqTime =
			y * sin2l0 -
			2 * e * sinm +
			4 * e * y * sinm * cos2l0 -
			0.5 * y * y * sin4l0 -
			1.25 * e * e * sin2m;
		return degrees( eqTime ) * 4;

	},

	calcTrueSolarTime: function ( date, longitude ) {

		const eqTime = this.calcEquationOfTime( date );
		const time = this.calcTimeDecimal( date );
		const offset = this.getOffset( date );
		const solarTimeFix = eqTime + 4 * longitude - 60 * offset;
		let trueSolarTime = time * 60 + solarTimeFix;
		while ( trueSolarTime > 1440 ) trueSolarTime -= 1440;
		return trueSolarTime;

	},

	calcHourAngle: function ( date, longitude ) {

		const trueSolarTime = this.calcTrueSolarTime( date, longitude );
		let hourAngle = trueSolarTime / 4 - 180;
		if ( hourAngle < -180 ) hourAngle += 360;
		return hourAngle;

	},

	calcSolarZenith: function ( date, latitude, longitude, refraction ) {

		const solarDeclination = this.calcSolarDeclination( date );
		const hourAngle = this.calcHourAngle( date, longitude );

		const solarDeclinationSin = Math.sin( radians( solarDeclination ) );
		const solarDeclinationCos = Math.cos( radians( solarDeclination ) );
		const latitudeSin = Math.sin( radians( latitude ) );
		const latitudeCos = Math.cos( radians( latitude ) );
		const hourAngleCos = Math.cos( radians( hourAngle ) );

		const csz =
			latitudeSin * solarDeclinationSin +
			latitudeCos * solarDeclinationCos * hourAngleCos;
		let solarZenith = degrees( Math.acos( csz ) );

		if ( refraction ) {

			const solarElevation = 90 - solarZenith;
			let refractionCorrection = 0;
			const te = Math.tan( radians( solarElevation ) );
			if ( solarElevation <= 85 && solarElevation > 5 ) {

				refractionCorrection =
					58.1 / te - 0.07 / Math.pow( te, 3 ) + 0.000086 / Math.pow( te, 5 );

			} else if ( solarElevation <= 85 && solarElevation > -0.575 ) {

				refractionCorrection =
					1735 +
					solarElevation *
						( -518.2 +
							solarElevation *
								( 103.4 + solarElevation * ( -12.79 + solarElevation * 0.711 ) ) );

			} else {

				refractionCorrection = -20.774 / te;

			}

			solarZenith -= refractionCorrection;

		}

		return solarZenith;

	},

	calcSolarAzimuth: function ( date, latitude, longitude ) {

		const solarDeclination = this.calcSolarDeclination( date );
		const hourAngle = this.calcHourAngle( date, longitude );
		const solarZenith = this.calcSolarZenith( date, latitude, longitude, false );

		// const hourAngleSign = Math.sign( hourAngle );
		const solarZenithSin = Math.sin( radians( solarZenith ) );
		const solarZenithCos = Math.cos( radians( solarZenith ) );
		const latitudeSin = Math.sin( radians( latitude ) );
		const latitudeCos = Math.cos( radians( latitude ) );

		let output = Math.acos(
			( solarZenithCos * latitudeSin -
				Math.sin( radians( solarDeclination ) ) ) /
				( solarZenithSin * latitudeCos )
		);
		output = degrees( output );
		if ( hourAngle > 0 ) {

			return ( output + 180 ) % 360;

		} else {

			return ( 540 - output ) % 360;

		}

	},

	calcSolarAltitude: function ( date, latitude, longitude ) {

		return 90 - this.calcSolarZenith( date, latitude, longitude );

	},

	calcAirMass: function ( date, latitude, longitude ) {

		const solarZenith = this.calcSolarZenith( date, latitude, longitude );
		if ( solarZenith < 90 ) {

			const rad = radians( solarZenith );
			const a = 1.002432 * Math.pow( Math.cos( rad ), 2.0 );
			const b = 0.148386 * Math.cos( rad );
			const X = a + b + 0.0096467;
			const c = Math.pow( Math.cos( rad ), 3.0 );
			const d = 0.149864 * Math.pow( Math.cos( rad ), 2.0 );
			const e = 0.0102963 * Math.cos( rad );
			const Y = c + d + e + 0.000303978;
			return X / Y;

		} else {

			return 0;

		}

	},

	calcExtraIrradiance: function ( date ) {

		const start = new Date( date.getFullYear(), 0, 0 );
		const diff = date.getTime() - start.getTime();
		const oneDay = 1000 * 60 * 60 * 24;
		// const day = Math.ceil(diff / oneDay);
		// const day = Math.floor(diff / oneDay);
		const day = diff / oneDay;

		// 1367 = accepted solar constant [W/m^2]
		return 1367 * ( 1.0 + Math.cos( radians( ( 360 * day ) / 365 ) ) / 30 );

	},

	calcSolarAttenuation: function ( theta, turbitity ) {

		let tau = [ 0.0, 0.0, 0.0 ];
		const tmp = 93.885 - ( theta / Math.PI ) * 180.0;
		if ( tmp < 0 ) {

			return tau;

		}

		const beta = 0.0460836582205 * turbitity - 0.04586025928522;
		const m =
			1.0 /
			( Math.cos( theta ) +
				0.15 * Math.pow( 93.885 - ( theta / Math.PI ) * 180.0, -1.253 ) ); // Relative Optical Mass
		const lambda = [ 0.65, 0.57, 0.475 ];
		for ( let i = 0; i < 3; i++ ) {

			// Rayleigh Scattering
			// lambda in um
			const tauR = Math.exp( -m * 0.008735 * Math.pow( lambda[ i ], -4.08 ) );
			const tauA = Math.exp( -m * beta * Math.pow( lambda[ i ], -1.3 ) ); // lambda should be in um

			tau[ i ] = tauR * tauA;

		}

		return tau;

	},
};

const OceanShader = {
	uniforms: {
		mirrorSampler: { value: null },
		normalSampler: { value: null },
		envSampler: { value: null },
		alpha: { value: 1.0 },
		time: { value: 0.0 },
		distortionScale: { value: 20.0 },
		reflectionScale: { value: 0.05 },
		noiseScale: { value: 1.0 },
		sunColor: { value: new THREE$1.Color( 0x7f7f7f ) },
		sunDirection: { value: new THREE$1.Vector3( 0.70707, 0x70707, 0 ) },
		eye: { value: new THREE$1.Vector3() },
		waterColor: { value: new THREE$1.Color( 0x555555 ) },
		textureMatrix: { value: new THREE$1.Matrix4() },
	},

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',
		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
		'varying vec3 worldNormal;',

		'void main() {',
		'  mirrorCoord = modelMatrix * vec4(position, 1.0);',
		'  worldPosition = mirrorCoord.xyz;',
		'  mirrorCoord = textureMatrix * mirrorCoord;',
		'  worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);',
		'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'}',
	].join( '\n' ),

	fragmentShader: [
		'precision highp float;',

		'uniform sampler2D mirrorSampler;',
		'uniform float alpha;',
		'uniform float time;',
		'uniform float distortionScale;',
		'uniform float reflectionScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 eye;',
		'uniform vec3 waterColor;',
		'uniform samplerCube envSampler;',

		'varying vec4 mirrorCoord;',
		'varying vec3 worldPosition;',
		'varying vec3 worldNormal;',

		'vec4 getNoise(vec2 uv) {',
		'  vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);',
		'  vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);',
		'  vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);',
		'  vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);',
		'  vec4 noise = texture2D(normalSampler, uv0) + ',
		'    texture2D(normalSampler, uv1) + ',
		'    texture2D(normalSampler, uv2) + ',
		'    texture2D(normalSampler, uv3);',
		'  return noise * 0.5 - 1.0;',
		'}',

		'void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor) {',
		'  vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));',
		'  float direction = max(0.0, dot(eyeDirection, reflection));',
		'  specularColor += pow(direction, shiny) * sunColor * spec;',
		'  diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * diffuse;',
		'}',

		THREE$1.ShaderChunk[ 'common' ],
		THREE$1.ShaderChunk[ 'fog_pars_fragment' ],

		'void main() {',
		'  vec4 noise = getNoise(worldPosition.xz);',
		'  vec3 surfaceNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5));',
		// "  vec3 surfaceNormal = normalize(worldNormal + noise.xzy * vec3(1.5, 1.0, 1.5) * distortionScale);",

		'  vec3 diffuseLight = vec3(0.0);',
		'  vec3 specularLight = vec3(0.0);',

		'  vec3 worldToEye = eye - worldPosition;',
		'  vec3 eyeDirection = normalize(worldToEye);',
		'  sunLight(surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight);',

		'  float distance = length(worldToEye);',

		// "  vec3 reflection = reflect(-eyeDirection, normalize(worldNormal + noise.xzy * reflectionScale));",
		// "  vec3 reflectionSample = textureCube(envSampler, vec3(-reflection.x, reflection.yz)).rgb;",
		'  vec2 distortion = surfaceNormal.xz * (0.001 + 1.0 / distance) * distortionScale;',
		'  vec3 reflectionSample = vec3(texture2D(mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion));',

		'  float theta = max(dot(eyeDirection, surfaceNormal), 0.0);',
		'  float rf0 = 0.3;',
		'  float reflectance = rf0 + (1.0 - rf0) * pow((1.0 - theta), 5.0);',
		'  vec3 scatter = max(0.0, dot(surfaceNormal, eyeDirection)) * waterColor;',
		'  vec3 albedo = mix(sunColor * diffuseLight * 0.3 + scatter, (vec3(0.1) + reflectionSample * 0.9 + reflectionSample * specularLight), reflectance);',
		'  vec3 outgoingLight = albedo;',
		THREE$1.ShaderChunk[ 'fog_fragment' ],
		'  gl_FragColor = vec4(outgoingLight, alpha);',
		THREE$1.ShaderChunk[ 'tonemapping_fragment' ],
		'}',
	].join( '\n' ),
};

class Ocean extends THREE$1.Object3D {

	constructor( renderer, camera, scene, options ) {

		super();
		this.name = 'ocean_' + this.id;

		function optionalParameter( value, defaultValue ) {

			return value !== undefined ? value : defaultValue;

		}

		options = options || {};

		this.matrixNeedsUpdate = true;

		const width = optionalParameter( options.textureWidth, 512 );
		const height = optionalParameter( options.textureHeight, 512 );
		this.clipBias = optionalParameter( options.clipBias, 0.0 );
		this.alpha = optionalParameter( options.alpha, 1.0 );
		this.time = optionalParameter( options.time, 0.0 );
		this.normalSampler = optionalParameter( options.waterNormals, null );
		this.sunDirection = optionalParameter( options.sunDirection, new THREE$1.Vector3( 0.70707, 0.70707, 0.0 ) );
		this.sunColor = new THREE$1.Color( optionalParameter( options.sunColor, 0xffffff ) );
		this.waterColor = new THREE$1.Color( optionalParameter( options.waterColor, 0x7f7f7f ) );
		this.eye = optionalParameter( options.eye, new THREE$1.Vector3( 0, 0, 0 ) );
		this.distortionScale = optionalParameter( options.distortionScale, 20.0 );
		this.reflectionScale = optionalParameter( options.reflectionScale, 0.01 );
		this.side = optionalParameter( options.side, THREE$1.FrontSide );
		this.fog = optionalParameter( options.fog, false );
		this.envSampler = optionalParameter( options.envMap, null );

		this.renderer = renderer;
		this.scene = scene;
		this.mirrorPlane = new THREE$1.Plane();
		this.normal = new THREE$1.Vector3( 0, 0, 1 );
		this.mirrorWorldPosition = new THREE$1.Vector3();
		this.cameraWorldPosition = new THREE$1.Vector3();
		this.rotationMatrix = new THREE$1.Matrix4();
		this.lookAtPosition = new THREE$1.Vector3( 0, 0, -1 );
		this.clipPlane = new THREE$1.Vector4();

		if ( camera instanceof THREE$1.PerspectiveCamera ) {

			this.camera = camera;

		} else {

			this.camera = new THREE$1.PerspectiveCamera();
			console.log( this.name + ': camera is not a PerspectiveCamera' );

		}

		this.textureMatrix = new THREE$1.Matrix4();
		this.mirrorCamera = this.camera.clone();
		this.mirrorCamera.matrixAutoUpdate = true;

		this.renderTarget = new THREE$1.WebGLRenderTarget( width, height );
		// this.renderTarget2 = new THREE.WebGLRenderTarget(width, height);

		const mirrorShader = OceanShader;
		const mirrorUniforms = THREE$1.UniformsUtils.clone( mirrorShader.uniforms );

		this.material = new THREE$1.ShaderMaterial( {
			fragmentShader: mirrorShader.fragmentShader,
			vertexShader: mirrorShader.vertexShader,
			uniforms: mirrorUniforms,
			transparent: true,
			side: this.side,
			fog: this.fog,
			// wireframe: true
		} );
		this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
		this.material.uniforms.textureMatrix.value = this.textureMatrix;
		this.material.uniforms.alpha.value = this.alpha;
		this.material.uniforms.time.value = this.time;
		this.material.uniforms.normalSampler.value = this.normalSampler;
		this.material.uniforms.sunColor.value = this.sunColor;
		this.material.uniforms.waterColor.value = this.waterColor;
		this.material.uniforms.sunDirection.value = this.sunDirection;
		this.material.uniforms.distortionScale.value = this.distortionScale;
		this.material.uniforms.reflectionScale.value = this.reflectionScale;
		this.material.uniforms.eye.value = this.eye;
		this.material.uniforms.envSampler.value = this.envSampler;

		if ( !THREE$1.MathUtils.isPowerOfTwo( width ) || !THREE$1.MathUtils.isPowerOfTwo( height ) ) {

			this.renderTarget.texture.generateMipmaps = false;
			this.renderTarget.texture.minFilter = THREE$1.LinearFilter;
			// this.renderTarget2.texture.generateMipmaps = false;
			// this.renderTarget2.texture.minFilter = THREE.LinearFilter;

		}

		this.updateTextureMatrix();
		this.render();

	}

	updateTextureMatrix() {

		// function sign( x ) {

		// 	return x ? ( x < 0 ? -1 : 1 ) : 0;

		// }

		this.updateMatrixWorld();
		this.camera.updateMatrixWorld();

		this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
		this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

		this.rotationMatrix.extractRotation( this.matrixWorld );

		this.normal.set( 0, 0, 1 );
		this.normal.applyMatrix4( this.rotationMatrix );

		const view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
		view.reflect( this.normal ).negate();
		view.add( this.mirrorWorldPosition );

		this.rotationMatrix.extractRotation( this.camera.matrixWorld );

		this.lookAtPosition.set( 0, 0, -1 );
		this.lookAtPosition.applyMatrix4( this.rotationMatrix );
		this.lookAtPosition.add( this.cameraWorldPosition );

		const target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
		target.reflect( this.normal ).negate();
		target.add( this.mirrorWorldPosition );

		this.up.set( 0, -1, 0 );
		this.up.applyMatrix4( this.rotationMatrix );
		this.up.reflect( this.normal ).negate();

		this.mirrorCamera.position.copy( view );
		this.mirrorCamera.up = this.up;
		this.mirrorCamera.lookAt( target );

		this.mirrorCamera.updateProjectionMatrix();
		this.mirrorCamera.updateMatrixWorld();
		this.mirrorCamera.matrixWorld.copy( this.mirrorCamera.matrixWorldInverse ).invert();

		// Update the texture matrix
		this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0 );
		this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
		this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
		this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

		this.clipPlane.set(
			this.mirrorPlane.normal.x,
			this.mirrorPlane.normal.y,
			this.mirrorPlane.normal.z,
			this.mirrorPlane.constant
		);

		const q = new THREE$1.Vector4();
		const projectionMatrix = this.mirrorCamera.projectionMatrix;
		q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		q.z = -1;
		q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		let c = new THREE$1.Vector4();
		c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = c.x;
		projectionMatrix.elements[ 6 ] = c.y;
		projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
		projectionMatrix.elements[ 14 ] = c.w;

		const worldCoordinate = new THREE$1.Vector3();
		worldCoordinate.setFromMatrixPosition( this.camera.matrixWorld );
		this.eye = worldCoordinate;
		this.material.uniforms.eye.value = this.eye;

	}

	render() {

		if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

		this.matrixNeedsUpdate = true;

		// Render the mirrored view of the current scene into the target texture
		var scene = this;

		while ( scene.parent !== null ) {

			scene = scene.parent;

		}

		if ( scene !== undefined && scene instanceof THREE$1.Scene ) {

			// We can't render ourself to ourself
			var visible = this.material.visible;
			this.material.visible = false;
			this.renderer.setRenderTarget( this.renderTarget );
			this.renderer.clear();
			this.renderer.render( scene, this.mirrorCamera );
			this.renderer.setRenderTarget( null );
			this.material.visible = visible;

		}

	}

}
// Ocean.prototype.renderTemp = function() {
//
//   if (this.matrixNeedsUpdate) this.updateTextureMatrix();
//
//   this.matrixNeedsUpdate = true;
//
//   // Render the mirrored view of the current scene into the target textrue
//   var scene = this;
//   while (scene.parent !== null) {
//     scene = scene.parent;
//   }
//
//   if (scene !== undefined && scene instanceof THREE.Scene) {
//     this.renderer.render(scene, this.mirrorCamera, this.renderTarget2, true);
//   }
// };

/**
 * A shadow Mesh that follows a shadow-casting Mesh in the scene, but is confined to a single plane.
 *
 * based on: Three.js/samples/js/objects/shadowMesh.js
 */
class ShadowMesh extends THREE$1.Mesh {

	constructor( mesh, materialOption ) {

		const shadowMaterial = new THREE$1.MeshBasicMaterial(
			Object.assign(
				{
					color: 0x000000,
					transparent: true,
					opacity: 0.6,
					depthWrite: false,
				},
				materialOption
			)
		);

		super( mesh.geometry, shadowMaterial );

		this.meshMatrix = mesh.matrixWorld;
		this.frustumCulled = false;
		this.matrixAutoUpdate = false;

	}

	update() {

		var shadowMatrix = new THREE$1.Matrix4();

		return function ( plane, lightPosition4D ) {

			// based on
			// https://www.opengl.org/archives/resources/features/StencilTalk/tsld021.htm

			var dot =
				plane.normal.x * lightPosition4D.x +
				plane.normal.y * lightPosition4D.y +
				plane.normal.z * lightPosition4D.z +
				-plane.constant * lightPosition4D.w;

			var sme = shadowMatrix.elements;

			sme[ 0 ] = dot - lightPosition4D.x * plane.normal.x;
			sme[ 4 ] = -lightPosition4D.x * plane.normal.y;
			sme[ 8 ] = -lightPosition4D.x * plane.normal.z;
			sme[ 12 ] = -lightPosition4D.x * -plane.constant;

			sme[ 1 ] = -lightPosition4D.y * plane.normal.x;
			sme[ 5 ] = dot - lightPosition4D.y * plane.normal.y;
			sme[ 9 ] = -lightPosition4D.y * plane.normal.z;
			sme[ 13 ] = -lightPosition4D.y * -plane.constant;

			sme[ 2 ] = -lightPosition4D.z * plane.normal.x;
			sme[ 6 ] = -lightPosition4D.z * plane.normal.y;
			sme[ 10 ] = dot - lightPosition4D.z * plane.normal.z;
			sme[ 14 ] = -lightPosition4D.z * -plane.constant;

			sme[ 3 ] = -lightPosition4D.w * plane.normal.x;
			sme[ 7 ] = -lightPosition4D.w * plane.normal.y;
			sme[ 11 ] = -lightPosition4D.w * plane.normal.z;
			sme[ 15 ] = dot - lightPosition4D.w * -plane.constant;

			this.matrix.multiplyMatrices( shadowMatrix, this.meshMatrix );

		};

	}

}

const GPUParticleShader = {
	uniforms: {
		tDiffuse: { value: null },
		time: { value: 0.0 },
		timeRange: { value: 5.0 },
		color: { value: new THREE$1.Color( 1, 1, 1 ) },
		opacity: { value: 1.0 },
		particleSize: { value: 0.75 },
		screenWidth: { value: window.innerWidth },
		timeOffset: { value: 0.0 },
		numFrames: { value: 1 },
		frameDuration: { value: 1 },
		additiveFactor: { value: 0 },
		viewSize: { value: new THREE$1.Vector2( window.innerWidth, window.innerHeight ) },
		tDepth: { value: null },
		cameraNearFar: { value: new THREE$1.Vector2( 1, 100 ) },
	},

	vertexShader: [
		'precision highp float;',

		'uniform mat4 modelViewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform float time;',
		'uniform float timeRange;',
		'uniform float timeOffset;',
		'uniform float particleSize;',
		'uniform float screenWidth;',

		'attribute vec3 position;',
		'attribute vec4 velocitySpinStart;',
		'attribute vec4 accelerationSpinSpeed;',
		'attribute vec4 startSizeEndSizeStartTimeLifeTime;',

		'varying vec4 vSpinLifeTime;',
		'varying vec4 vClipPosition;',

		'void main() {',
		'  float startSize = startSizeEndSizeStartTimeLifeTime.x;',
		'  float endSize = startSizeEndSizeStartTimeLifeTime.y;',
		'  float startTime = startSizeEndSizeStartTimeLifeTime.z;',
		'  float lifeTime = startSizeEndSizeStartTimeLifeTime.w;',
		'  vec3 velocity = velocitySpinStart.xyz;',
		'  float spinStart = velocitySpinStart.w;',
		'  vec3 acceleration = accelerationSpinSpeed.xyz;',
		'  float spinSpeed = accelerationSpinSpeed.w;',

		'  float localTime = mod((time - timeOffset - startTime), timeRange);',
		'  float percentLife = localTime / lifeTime;',

		'  vec3 newPosition = position + velocity * localTime + acceleration * localTime * localTime;',
		'  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);',
		'  gl_Position = projectionMatrix * mvPosition;',
		'  vClipPosition = gl_Position;',

		'  float currentSize = particleSize * mix(startSize, endSize, percentLife);',
		'  currentSize *= step(0.0, percentLife);',
		'  currentSize *= step(-1.0, -percentLife);',
		'  if (currentSize == 0.0) gl_Position = vec4(-100000000.0);',

		'  vec4 projectedCorner = projectionMatrix * vec4(currentSize, currentSize, mvPosition.z, mvPosition.w);',
		'  gl_PointSize = screenWidth * projectedCorner.x / projectedCorner.w;',
		'  percentLife *= step(0.0, percentLife);',
		'  percentLife *= step(-1.0, -percentLife);',
		'  vSpinLifeTime = vec4(spinStart, spinSpeed, percentLife, localTime);',
		'}',
	].join( '\n' ),

	fragmentShader: [
		'precision highp float;',

		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDepth;',
		'uniform vec3 color;',
		'uniform float opacity;',
		'uniform float time;',
		'uniform float numFrames;',
		'uniform float frameDuration;',
		'uniform vec2 cameraNearFar;',
		'uniform vec2 viewSize;',
		'uniform float additiveFactor;',

		'varying vec4 vSpinLifeTime;',
		'varying vec4 vClipPosition;',

		'float linearizeDepth(float depth, vec2 cameraNearFar) {',
		'  return -cameraNearFar.y * cameraNearFar.x / (depth * (cameraNearFar.y - cameraNearFar.x) - cameraNearFar.y);',
		'}',

		'void main() {',
		'  float spinStart = vSpinLifeTime.x;',
		'  float spinSpeed = vSpinLifeTime.y;',
		'  float percentLife = vSpinLifeTime.z;',
		'  float localTime = vSpinLifeTime.w;',

		'  const float frameStart = 0.0;',
		'  vec2 texcoord = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y)-0.5;',
		'  float s = sin(spinStart + spinSpeed * time);',
		'  float c = cos(spinStart + spinSpeed * time);',
		'  vec2 rotatedCoord1 = vec2(texcoord.x * c + texcoord.y * s, -texcoord.x * s + texcoord.y * c) + 0.5;',
		'  rotatedCoord1 = clamp(rotatedCoord1, 0.0, 1.0);',
		// "  vec2 rotatedCoord2 = rotatedCoord1;",

		'  float frame1 = mod(floor(localTime / frameDuration + frameStart), numFrames);',
		'  float uOffset1 = frame1 / numFrames;',
		'  rotatedCoord1.x = uOffset1 + (rotatedCoord1.x) * (1.0 / numFrames);',
		'  vec4 pixel1 = texture2D(tDiffuse, rotatedCoord1);',
		// "  pixel1.xyz *= pixel1.xyz;",

		// INTERPORATE PARTICLE FRAMES
		// "  float frame2 = mod(floor(localTime / frameDuration + frameStart + 1.0), numFrames);",
		// "  float uOffset2 = frame2 / numFrames;",
		// "  float frameTime = fract(localTime / frameDuration + frameStart);",
		// "  rotatedCoord2.x = uOffset2 + rotatedCoord2.x * (1.0 / numFrames);",
		// "  vec4 pixel2 = texture2D(tDiffuse, rotatedCoord2);",
		// "  pixel2.xyz *= pixel2.xyz;",
		// "  pixel1 = mix(pixel1, pixel2, frameTime);",

		'  if (pixel1.a < 0.001) discard;',

		'  vec2 screenCoord = gl_FragCoord.xy / viewSize;',
		'  float myDepth = vClipPosition.z / vClipPosition.w;',
		'  float myLinearDepth = linearizeDepth(myDepth, cameraNearFar);',
		'  float sceneDepth = texture2D(tDepth, screenCoord).x * 2.0 - 1.0;',
		'  float sceneLinearDepth = linearizeDepth(sceneDepth, cameraNearFar);',
		'  const float scale = 0.1;',
		'  float zFade = clamp(scale * abs(myLinearDepth - sceneLinearDepth), 0.0, 1.0);',
		'  if (myDepth > sceneDepth) discard;',

		'  vec4 particleColor = pixel1 * vec4(color, opacity);',
		'  particleColor.a *= zFade;',
		'  gl_FragColor = particleColor;',
		'}',
	].join( '\n' ),
};

class GPUParticle extends THREE$1.Points {

	constructor( numParticles, initCallback ) {

		const geo = new THREE$1.BufferGeometry();
		const positions = new Float32Array( numParticles * 3 );
		const velocitySpinStartArray = new Float32Array( numParticles * 4 );
		const accelerationSpinSpeedArray = new Float32Array( numParticles * 4 );
		const startSizeEndSizeStartTimeLifeTimeArray = new Float32Array( numParticles * 4 );

		const pars = {
			position: new THREE$1.Vector3(),
			velocity: new THREE$1.Vector3(),
			acceleration: new THREE$1.Vector3(),
			spinStart: 0,
			spinSpeed: 0,
			startSize: 1,
			endSize: 1,
			startTime: 0,
			lifeTime: 1,
		};

		let ofs3 = 0;
		let ofs4 = 0;
		for ( let i = 0; i < numParticles; ++i ) {

			initCallback( i, pars );

			positions[ ofs3 + 0 ] = pars.position.x;
			positions[ ofs3 + 1 ] = pars.position.y;
			positions[ ofs3 + 2 ] = pars.position.z;

			velocitySpinStartArray[ ofs4 + 0 ] = pars.velocity.x;
			velocitySpinStartArray[ ofs4 + 1 ] = pars.velocity.y;
			velocitySpinStartArray[ ofs4 + 2 ] = pars.velocity.z;

			accelerationSpinSpeedArray[ ofs4 + 0 ] = pars.acceleration.x;
			accelerationSpinSpeedArray[ ofs4 + 1 ] = pars.acceleration.y;
			accelerationSpinSpeedArray[ ofs4 + 2 ] = pars.acceleration.z;

			velocitySpinStartArray[ ofs4 + 3 ] = pars.spinStart;
			accelerationSpinSpeedArray[ ofs4 + 3 ] = pars.spinSpeed;

			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 0 ] = pars.startSize;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 1 ] = pars.endSize;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 2 ] = pars.startTime;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 3 ] = pars.lifeTime;

			ofs3 += 3;
			ofs4 += 4;

		}

		geo.setAttribute( 'position', new THREE$1.BufferAttribute( positions, 3 ) );
		geo.setAttribute( 'velocitySpinStart', new THREE$1.BufferAttribute( velocitySpinStartArray, 4 ) );
		geo.setAttribute( 'accelerationSpinSpeed', new THREE$1.BufferAttribute( accelerationSpinSpeedArray, 4 ) );
		geo.setAttribute(
			'startSizeEndSizeStartTimeLifeTime',
			new THREE$1.BufferAttribute( startSizeEndSizeStartTimeLifeTimeArray, 4 )
		);

		const material = new THREE$1.RawShaderMaterial( {
			uniforms: THREE$1.UniformsUtils.clone( GPUParticleShader.uniforms ),
			vertexShader: GPUParticleShader.vertexShader,
			fragmentShader: GPUParticleShader.fragmentShader,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: THREE$1.AdditiveBlending,
		} );

		super( geo, material );

	}

}

class HeightField {

	constructor() {	}

	generate( img, scale ) {

		const data = this.__getHeightData( img, scale );
		const geo = new THREE$1.PlaneGeometry( img.width, img.height, img.width - 1, img.height - 1 );
		geo.rotateX( -Math.PI / 2 );
		const vertices = geo.attributes.position.array;
		for ( var i = 0; i < data.length; i++ ) {

			vertices[ i * 3 + 1 ] = data[ i ];

		}

		geo.computeVertexNormals();
		return geo;

	}

	__getHeightData( img, scale ) {

		const canvas = document.createElement( 'canvas' );
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext( '2d' );
		const size = img.width * img.height;
		const data = new Float32Array( size );

		context.drawImage( img, 0, 0 );

		for ( let i = 0; i < size; i++ ) {

			data[ i ] = 0;

		}

		const imgd = context.getImageData( 0, 0, img.width, img.height );
		const pix = imgd.data;

		let j = 0;
		for ( let i = 0; i < pix.length; i += 4 ) {

			const all = pix[ i ] + pix[ i + 1 ] + pix[ i + 2 ];
			data[ j++ ] = all / ( 12 * scale );

		}

		return data;

	}

	generateHeight( params ) {

		function optionalParameter( value, defaultValue ) {

			return value !== undefined ? value : defaultValue;

		}

		params = params || {};

		this.widthExtents = optionalParameter( params.widthExtents, 100 );
		this.depthExtents = optionalParameter( params.depthExtents, 100 );
		this.width = optionalParameter( params.width, 128 );
		this.depth = optionalParameter( params.depth, 128 );
		this.maxHeight = optionalParameter( params.maxHeight, 2 );
		this.minHeight = optionalParameter( params.minHeight, -2 );
		this.heightData = this.__generateHeight( this.width, this.depth, this.minHeight, this.maxHeight );

		const geo = new THREE$1.PlaneGeometry( this.widthExtents, this.depthExtents, this.width - 1, this.depth - 1 );
		geo.rotateX( -Math.PI / 2 );
		const vertices = geo.attributes.position.array;
		for ( var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3 ) {

			// j + 1 because it is the y component that we modify
			vertices[ j + 1 ] = this.heightData[ i ];

		}

		geo.computeVertexNormals();
		return geo;

	}

	__generateHeight( width, depth, minHeight, maxHeight ) {

		// Generates the height data (a sinus wave)
		const size = width * depth;
		const data = new Float32Array( size );
		const hRange = maxHeight - minHeight;
		const w2 = width / 2;
		const d2 = depth / 2;
		const phaseMult = 24;

		let p = 0;
		for ( let j = 0; j < depth; j++ ) {

			for ( let i = 0; i < width; i++ ) {

				const radius = Math.sqrt( Math.pow( ( i - w2 ) / w2, 2.0 ) + Math.pow( ( j - d2 ) / d2, 2.0 ) );
				const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;
				data[ p ] = height;
				p++;

			}

		}

		return data;

	}

}

class ScreenSprite {

	constructor( material, canvas ) {

		this.sw = window.innerWidth;
		this.sh = window.innerHeight;
		if ( canvas ) {

			this.sw = canvas.width;
			this.sh = canvas.height;

		}

		const scope = this;
		const frame = {
			x: 10,
			y: 10,
			width: this.sw,
			height: this.sh,
		};

		this.camera = new THREE$1.OrthographicCamera( -this.sw / 2, this.sw / 2, this.sh / 2, -this.sh / 2, 1, 10 );
		this.camera.position.set( 0, 0, 2 );
		this.scene = new THREE$1.Scene();
		const plane = new THREE$1.PlaneGeometry( frame.width, frame.height );
		const mesh = new THREE$1.Mesh( plane, material );
		this.scene.add( mesh );

		function resetPosition() {

			scope.position.set( scope.position.x, scope.position.y );

		}

		// API

		// Set to false to disable displaying this sprite
		this.enabled = true;

		// Set the size of the displayed sprite on the HUD
		this.size = {
			width: frame.width,
			height: frame.height,
			set: function ( width, height ) {

				this.width = width;
				this.height = height;
				mesh.scale.set( this.width / frame.width, this.height / frame.height, 1 );

				// Reset the position as it is off when we scale stuff
				resetPosition();

			},
		};

		// Set the position of the displayed sprite on the HUD
		this.position = {
			x: frame.x,
			y: frame.y,
			set: function ( x, y ) {

				this.x = x;
				this.y = y;
				const width = scope.size.width;
				const height = scope.size.height;
				mesh.position.set( -scope.sw / 2 + width / 2 + this.x, scope.sh / 2 - height / 2 - this.y, 0 );

			},
		};

		// Force an update to set position/size
		this.update();

	}

	render( renderer ) {

		if ( this.enabled ) {

			renderer.render( this.scene, this.camera );

		}

	}

	updateForWindowResize() {

		if ( this.enabled ) {

			this.sw = window.innerWidth;
			this.sh = window.innerHeight;
			this.camera.left = -window.innerWidth / 2;
			this.camera.right = window.innerWidth / 2;
			this.camera.top = window.innerHeight / 2;
			this.camera.bottom = -window.innerHeight / 2;

		}

	}

	updateForCanvasResize( canvas ) {

		if ( this.enabled ) {

			this.sw = canvas.width;
			this.sh = canvas.height;
			this.camera.left = -canvas.width / 2;
			this.camera.right = canvas.width / 2;
			this.camera.top = canvas.height / 2;
			this.camera.bottom = -canvas.height / 2;

		}

	}

	update() {

		this.position.set( this.position.x, this.position.y );
		this.size.set( this.size.width, this.size.height );

	}

}

// COMPOSER
class Composer {

	constructor( renderer ) {

		this.renderer = renderer;
		this.passes = [];

	}

	addPass( pass, readRenderTarget, writeRenderTarget, clear, clearDepth ) {

		this.passes.push( {
			pass: pass,
			readBuffer: readRenderTarget,
			writeBuffer: writeRenderTarget,
			clear: clear,
			clearDepth: clearDepth,
		} );
		// var size = this.renderer.getSize();
		// pass.setSize(size.width, size.height);

	}

	insertPass( pass, index ) {

		this.passes.splice( index, 0, pass );

	}

	render( delta ) {

		const maskActive = false;
		for ( let i = 0; i < this.passes.length; i++ ) {

			const pass = this.passes[ i ];
			if ( pass.pass.enabled === false ) continue;

			const oldAutoClear = this.renderer.autoClear;
			const oldAutoClearDepth = this.renderer.autoClearDepth;

			if ( pass.clear !== undefined ) {

				this.renderer.autoClear = pass.clear;

			}

			if ( pass.clearDepth !== undefined ) {

				this.renderer.autoClearDepth = pass.clearDepth;

			}

			pass.pass.render( this.renderer, pass.writeBuffer, pass.readBuffer, delta, maskActive );

			this.renderer.autoClear = oldAutoClear;
			this.renderer.autoClearDepth = oldAutoClearDepth;

			// if (pass.needsSwap) {
			//   if (maskActive) {
			//     var context = this.renderer.context;
			//     context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
			//     this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
			//     context.stencilFunc(context.EQUAL, 1, 0xffffffff);
			//   }
			//
			//   this.swapBuffers();
			// }
			//
			// if (THREE.MaskPass !== undefined) {
			//   if (pass instanceof THREE.MaskPass) {
			//     maskActive = true;
			//   } else if (pass instanceof THREE.ClearMaskPass) {
			//     maskActive = false;
			//   }
			// }

		}

	}

	// reset: function(renderTarget) {
	//
	//   if (renderTarget === undefined) {
	//     var size = renderTarget.getSize();
	//     renderTarget = this.renderTarget1.clone();
	//     renderTarget.setSize(size.width, size.height);
	//   }
	//
	//   this.renderTarget1.dispose();
	//   this.renderTarget2.dispose();
	//   this.renderTarget1 = renderTarget;
	//   this.renderTarget2 = renderTarget.clone();
	//   this.writeBuffer = this.renderTarget1;
	//   this.readBuffer = this.renderTarget2;
	// },
	//
	// setSize: function(width, height) {
	//   this.renderTarget1.setSize(width, height);
	//   this.renderTarget2.setSize(width, height);
	//
	//   for (var i=0; i<this.passes.length; i++) {
	//     this.passes[i].setSize(width, height);
	//   }
	// }

}

// BASE PASS
class Pass {

	constructor() {

		// if set to true, the pass is processes by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendering to screen
		this.renderToScreen = false;

	}

	setSize( _width, _height ) {}

	render( _renderer, _writeBuffer, _readBuffer, _delta, _maskActive ) {

		console.error( 'PIXY.Pass: .render() must be implemented in derived pass.' );

	}

}

// CLEAR PASS
class ClearPass extends Pass {

	constructor( clearColor, clearAlpha ) {

		super();

		this.needsSwap = false;
		this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
		this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
		// this.clearDepth;
		// this.colorMask;

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		let oldClearColor, oldClearAlpha, oldAutoClearDepth;

		if ( this.clearColor ) {

			oldClearColor = new THREE.Color();
			renderer.getClearColor( oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			oldAutoClearDepth = renderer.autoClearDepth;
			renderer.autoClearDepth = this.clearDepth;

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.autoClearDepth = oldAutoClearDepth;

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

	}

}

class MaskPass extends Pass {

	constructor( scene, camera ) {

		super();

		this.scene = scene;
		this.camera = camera;
		this.clear = true;
		this.needsSwap = false;
		this.inverse = false;

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		const context = renderer.context;
		const state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		let writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );

		// draw into the stencil buffer

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

		// only render where stencil is set to 1

		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

	}

}

// CLEAR MASK PASS
class ClearMaskPass extends Pass {

	constructor() {

		super();

		this.needsSwap = false;

	}

	render( renderer, _writeBuffer, _readBuffer, _delta, _maskActive ) {

		renderer.state.buffers.stencil.setTest( false );

	}

}

class RenderPass extends Pass {

	constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		super();

		this.scene = scene;
		this.camera = camera;
		this.overrideMaterial = overrideMaterial || null;
		this.clearColor = clearColor || 0;
		this.clearAlpha = clearAlpha || 0;
		this.clear = true;
		this.clearDepth = true;
		// this.colorMask = null;
		this.needsSwap = false;

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		const oldAutoClear = renderer.autoClear;
		const oldAutoClearDepth = renderer.autoClearDepth;
		renderer.autoClear = false;
		renderer.autoClearDepth = this.clearDepth;

		this.scene.overrideMaterial = this.overrideMaterial;

		let oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = new THREE.Color();
			renderer.getClearColor( oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		const oldRenderTarget = renderer.getRenderTarget();
		renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
		renderer.autoClearDepth = oldAutoClearDepth;

	}

}

class ShaderPass extends Pass {

	constructor( shader, textureID ) {

		super();

		this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

		if ( shader instanceof THREE$1.ShaderMaterial ) {

			this.uniforms = shader.uniforms;
			this.material = shader;

		} else if ( shader ) {

			this.uniforms = THREE$1.UniformsUtils.clone( shader.uniforms );
			this.material = new THREE$1.ShaderMaterial( {
				defines: shader.defines || {},
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
				depthTest: false,
				depthWrite: false,
			} );

		}

		this.camera = new THREE$1.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene = new THREE$1.Scene();
		this.quad = new THREE$1.Mesh( new THREE$1.PlaneGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, readBuffer, _delta, _maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			var oldRenderTarget = renderer.getRenderTarget();
			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );
			renderer.setRenderTarget( oldRenderTarget );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

	}

}

class ScreenPass extends Pass {

	constructor() {

		super();

		this.camera = new THREE$1.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene = new THREE$1.Scene();
		this.quad = new THREE$1.Mesh( new THREE$1.PlaneGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

}

class CopyPass extends ShaderPass {

	constructor() {

		super( ShaderLib.copy );

	}

}

class EdgePass extends ScreenPass {

	constructor( aspect, strength, color, idedge, resolution ) {

		super();

		this.aspect = aspect;
		this.strength = strength;
		this.color = color;
		this.idedge = idedge;
		this.source = null;

		const pars = {
			minFilter: THREE$1.LinearFilter,
			magFilter: THREE$1.LinearFilter,
			format: THREE$1.RGBFormat,
			stencilBuffer: false,
		};
		this.edgeBuffer = new THREE$1.WebGLRenderTarget( resolution, resolution, pars );
		this.edgeExpandBuffer = new THREE$1.WebGLRenderTarget( resolution, resolution, pars );

		const edgeShader = ShaderLib.edge;
		this.edgeUniforms = THREE$1.UniformsUtils.clone( edgeShader.uniforms );
		this.edgeMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.edgeUniforms,
			vertexShader: edgeShader.vertexShader,
			fragmentShader: edgeShader.fragmentShader,
		} );

		const edgeExpandShader = ShaderLib.edgeExpand;
		this.edgeExpandUniforms = THREE$1.UniformsUtils.clone( edgeExpandShader.uniforms );
		this.edgeExpandMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.edgeExpandUniforms,
			vertexShader: edgeExpandShader.vertexShader,
			fragmentShader: edgeExpandShader.fragmentShader,
		} );

		const edgeIDShader = ShaderLib.edgeID;
		this.idUniforms = THREE$1.UniformsUtils.clone( edgeIDShader.uniforms );
		this.idMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.idUniforms,
			vertexShader: edgeIDShader.vertexShader,
			fragmentShader: edgeIDShader.fragmentShader,
		} );

		const compositeShader = ShaderLib.edgeComposite;
		this.compositeUniforms = THREE$1.UniformsUtils.clone( compositeShader.uniforms );
		this.compositeMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.compositeUniforms,
			vertexShader: compositeShader.vertexShader,
			fragmentShader: compositeShader.fragmentShader,
		} );

	}

	render( renderer, writeBuffer, readBuffer, _delta, _maskActive ) {

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		if ( this.idedge ) {

			this.idUniforms.aspect.value = this.aspect;
			this.idUniforms.step.value = 1.0;
			this.idUniforms.tDiffuse.value = this.source;
			this.quad.material = this.idMaterial;
			renderer.setRenderTarget( this.edgeBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;

		} else {

			this.edgeUniforms.aspect.value = this.aspect;
			this.edgeUniforms.tDiffuse.value = this.source;
			this.quad.material = this.edgeMaterial;
			renderer.setRenderTarget( this.edgeBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;

		}

		const edgeTexture = this.edgeBuffer.texture;
		if ( this.strength > 0.0 ) {

			this.edgeExpandUniforms.aspect.value = this.aspect;
			this.edgeExpandUniforms.strength.value = this.strength;
			this.edgeExpandUniforms.tDiffuse.value = this.edgeBuffer.texture;
			this.quad.material = this.edgeExpandMaterial;
			renderer.setRenderTarget( this.edgeExpandBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;
			edgeTexture = this.edgeExpandBuffer.texture;

		}

		this.compositeUniforms.edgeColor.value = this.color;
		// this.compositeUniforms.edgeColor.value = new THREE.Vector3(1.0, 0.0, 0.0);
		this.compositeUniforms.tEdge.value = edgeTexture;
		this.compositeUniforms.tDiffuse.value = readBuffer.texture;
		this.quad.material = this.compositeMaterial;
		renderer.setRenderTargeT( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		this.quad.material = null;

		// this.quad.material = new THREE.MeshBasicMaterial({map: this.edgeBuffer.texture});
		// this.quad.material = new THREE.MeshBasicMaterial({map: this.source});
		// renderer.render(this.scene, this.camera, writeBuffer, this.clear);
		// this.quad.material = null;

		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

}

/**
 * Supersample Anti-Aliasing Render Pass
 *
 * This manual approach to SSAA re-renders the scene ones for each sample with camera jitter and accumulates the results.
 */
class SSAARenderPass extends Pass {

	constructor( scene, camera, clearColor, clearAlpha ) {

		super();

		this.scene = scene;
		this.camera = camera;
		this.sampleLevel = 4; // specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.
		this.unbiased = true;

		// as we need to clear the buffer in this pass, clearColor must be set to something, defaults to black.
		this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
		this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

		// if (THREE.CopyShader === undefined) {
		//   console.error("PIXY.SSAARenderPass rlies on THREEE.CopyShader");
		// }

		const copyShader = ShaderLib.copy;
		this.copyUniforms = THREE$1.UniformsUtils.clone( copyShader.uniforms );
		this.copyMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			premultipliedAlpha: true,
			transparent: true,
			blending: THREE$1.AdditiveBlending,
			depthTest: false,
			depthWrite: false,
		} );

		this.camera2 = new THREE$1.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene2 = new THREE$1.Scene();
		this.quad2 = new THREE$1.Mesh( new THREE$1.PlaneGeometry( 2, 2 ), this.copyMaterial );
		this.quad2.frustumCulled = false; // Avoid getting clipped
		this.scene2.add( this.quad2 );

	}

	dispose() {

		if ( this.sampleRenderTarget ) {

			this.sampleRenderTarget.dispose();
			this.sampleRenderTarget = null;

		}

	}

	render( renderer, writeBuffer, readBuffer, _delta, _maskActive ) {

		if ( !this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE$1.WebGLRenderTarget( readBuffer.width, readBuffer.height, {
				minFilter: THREE$1.LinearFilter,
				magFilter: THREE$1.LinearFilter,
				format: THREE$1.RGBAFormat,
			} );

		}

		const jitterOffsets = SSAARenderPass.JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		const oldRenderTarget = renderer.getRenderTarget();
		const oldClearColor = new THREE$1.Color();
		renderer.getClearColor( oldClearColor );
		const oldClearAlpha = renderer.getClearAlpha();

		const baseSampleWeight = 1.0 / jitterOffsets.length;
		const roundingRange = 1 / 32;
		this.copyUniforms[ 'tDiffuse' ].value = this.sampleRenderTarget.texture;

		const width = readBuffer.width,
			height = readBuffer.height;

		// render the scene multiple times, each slightly jitter offset from the last and accumulate the results
		for ( let i = 0; i < jitterOffsets.length; i++ ) {

			const jitterOffset = jitterOffsets[ i ];
			if ( this.camera.setViewOffset ) {

				this.camera.setViewOffset(
					width,
					height,
					jitterOffset[ 0 ] * 0.0625,
					jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1/16
					width,
					height
				);

			}

			let sampleWeight = baseSampleWeight;
			if ( this.unbiased ) {

				// the theory is that equal weights for each sample lead to an accumulation of rounding errors.
				// The following equation varies the sampleWeight per sample so that it is uniformly distributed
				// across a range of values whose rounding errors cancel each other out.
				const uniformCenteredDistribution = -0.5 + ( i + 0.5 ) / jitterOffsets.length;
				sampleWeight += roundingRange * uniformCenteredDistribution;

			}

			this.copyUniforms[ 'opacity' ].value = sampleWeight;
			renderer.setClearColor( this.clearColor, this.clearAlpha );
			renderer.setRenderTargeT( this.sampleRenderTarget );
			renderer.clear();
			renderer.render( this.scene, this.camera );

			if ( i === 0 ) {

				renderer.setClearColor( 0x000000, 1.0 );

			}

			renderer.setRenderTarget( writeBuffer );
			if ( i === 0 ) renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		if ( this.camera.clearViewOffset ) {

			this.camera.clearViewOffset();

		}

		renderer.autoClear = autoClear;
		renderer.setClearColor( oldClearColor, oldClearAlpha );
		renderer.setRenderTarget( oldRenderTarget );

	}

}

// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8, 8] integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers needs to be scaled by 1/16
//
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
SSAARenderPass.JitterVectors = [
	[[ 0, 0 ]],
	[
		[ 4, 4 ],
		[ -4, -4 ],
	],
	[
		[ -2, -6 ],
		[ 6, -2 ],
		[ -6, 2 ],
		[ 2, 6 ],
	],
	[
		[ 1, -3 ],
		[ -1, 3 ],
		[ 5, 1 ],
		[ -3, -5 ],
		[ -5, 5 ],
		[ -7, -1 ],
		[ 3, 7 ],
		[ 7, -7 ],
	],
	[
		[ 1, 1 ],
		[ -1, -3 ],
		[ -3, 2 ],
		[ 4, -1 ],
		[ -5, -2 ],
		[ 2, 5 ],
		[ 5, 3 ],
		[ 3, -5 ],
		[ -2, 6 ],
		[ 0, -7 ],
		[ -4, -6 ],
		[ -6, 4 ],
		[ -8, 0 ],
		[ 7, -4 ],
		[ 6, 7 ],
		[ -7, -8 ],
	],
	[
		[ -4, -7 ],
		[ -7, -5 ],
		[ -3, -5 ],
		[ -5, -4 ],
		[ -1, -4 ],
		[ -2, -2 ],
		[ -6, -1 ],
		[ -4, 0 ],
		[ -7, 1 ],
		[ -1, 2 ],
		[ -6, 3 ],
		[ -3, 3 ],
		[ -7, 6 ],
		[ -3, 6 ],
		[ -5, 7 ],
		[ -1, 7 ],
		[ 5, -7 ],
		[ 1, -6 ],
		[ 6, -5 ],
		[ 4, -4 ],
		[ 2, -3 ],
		[ 7, -2 ],
		[ 1, -1 ],
		[ 4, -1 ],
		[ 2, 1 ],
		[ 6, 2 ],
		[ 0, 4 ],
		[ 4, 4 ],
		[ 2, 5 ],
		[ 7, 5 ],
		[ 5, 6 ],
		[ 3, 7 ],
	],
];

/**
 * Temporal Anti-Aliasing Render Pass
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 */
class TAARenderPass extends SSAARenderPass {

	constructor( scene, camera, params ) {

		super( scene, camera, params );

		this.sampleLevel = 0;
		this.accumulate = false;

	}

	render( renderer, writeBuffer, readBuffer, delta ) {

		if ( !this.accumulate ) {

			super.render( renderer, writeBuffer, readBuffer, delta );
			this.accumulateIndex = -1;
			return;

		}

		const jitterOffsets = TAARenderPass.JitterVectors[ 5 ];
		if ( !this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE$1.WebGLRenderTarget( readBuffer.width, readBuffer.eheight, this.params );

		}

		if ( !this.holdRenderTarget ) {

			this.holdRenderTarget = new THREE$1.WebGLRenderTarget( readBuffer.width, readBuffer.eheight, this.params );

		}

		if ( this.accumulate && this.accumulateIndex === -1 ) {

			super.render( renderer, this.holdRenderTarget, readBuffer, delta );
			this.accumulateIndex = 0;

		}

		const oldRenderTarget = renderer.getRenderTarget();
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		const sampleWeight = 1.0 / jitterOffsets.length;
		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ 'opacity' ].value = sampleWeight;
			this.copyUniforms[ 'tDiffsue' ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results
			const numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( let i = 0; i < numSamplesPerFrame; i++ ) {

				const j = this.accumulateIndex;
				const jitterOffset = jitterOffsets[ j ];
				if ( this.camera.setViewOffset ) {

					this.camera.setViewOffset(
						readBuffer.width,
						readBuffer.height,
						jitterOffset[ 0 ] * 0.0625,
						jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1/16
						readBuffer.width,
						readBuffer.height
					);

				}

				renderer.setRenderTarget( writeBuffer );
				renderer.clear();
				renderer.render( this.scene, this.camera );

				renderer.setRenderTarget( this.sampleRenderTarget );
				if ( this.accumulateIndex === 0 ) renderer.clear();
				renderer.render( this.scene2, this.camera2 );

				this.accumulateIndex++;
				if ( this.accumulateIndex >= jitterOffsets.length ) {

					break;

				}

			}

			if ( this.camera.clearViewOffset ) {

				this.camera.clearViewOffset();

			}

		}

		const accumulationWeight = this.accumulateIndex * sampleWeight;
		if ( accumulationWeight > 0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0;
			this.copyUniforms[ 'tDiffuse' ].value = this.sampleRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		if ( accumulationWeight < 1.0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ 'tDiffuse' ].value = this.holdRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			if ( accumulationWeight === 0 ) renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = autoClear;

	}

}

class UnrealBloomPass extends ScreenPass {

	constructor( resolution, strength, radius, threshold, hdr ) {

		super();

		this.strength = strength !== undefined ? strength : 1;
		this.radius = radius !== undefined ? radius : 1.0;
		this.threshold = threshold !== undefined ? threshold : 1.0;
		this.resolution =
			resolution !== undefined ? new THREE$1.Vector2( resolution.x, resolution.y ) : new THREE$1.Vector2( 256, 256 );

		const pars = {
			minFilter: THREE$1.LinearFilter,
			magFilter: THREE$1.LinearFilter,
			format: THREE$1.RGBAFormat,
		};
		if ( hdr ) {

			pars.type = THREE$1.FloatType;

		}

		this.rtHori = [];
		this.rtVert = [];
		this.nMips = 5;
		let resx = Math.round( this.resolution.x / 2 );
		let resy = Math.round( this.resolution.y / 2 );

		this.rtBright = new THREE$1.WebGLRenderTarget( resx, resy, pars );
		this.rtBright.texture.generateMipmaps = false;

		for ( let i = 0; i < this.nMips; i++ ) {

			let rt = new THREE$1.WebGLRenderTarget( resx, resy, pars );
			rt.texture.generateMipmaps = false;
			this.rtHori.push( rt );

			rt = new THREE$1.WebGLRenderTarget( resx, resy, pars );
			rt.texture.generateMipmaps = false;
			this.rtVert.push( rt );

			resx = Math.round( resx / 2 );
			resy = Math.round( resy / 2 );

		}

		// luminosity high pass material

		// if (LuminosityHighPassShader === undefined) {
		//   console.error("PIXY.UnrealBloomPass relies on PIXY.LuminosityHighPassShader");
		// }

		const shader = ShaderLib.luminosityHighPass;
		this.highPassUniforms = THREE$1.UniformsUtils.clone( shader.uniforms );
		this.highPassUniforms.luminosityThreshold.value = this.threshold;
		this.highPassUniforms.smoothWidth.value = 0.01;

		this.highPassMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.highPassUniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );

		// Gaussian Blur Materials
		this.separableBlurMaterials = [];
		const kernelSizeArray = [ 3, 5, 7, 9, 11 ];
		resx = Math.round( this.resolution.x / 2 );
		resy = Math.round( this.resolution.y / 2 );
		for ( let i = 0; i < this.nMips; i++ ) {

			this.separableBlurMaterials.push( this.getSeparableBlurMaterial( kernelSizeArray[ i ] ) );
			this.separableBlurMaterials[ i ].uniforms.texSize.value = new THREE$1.Vector2( resx, resy );

			resx = Math.round( resx / 2 );
			resy = Math.round( resy / 2 );

		}

		// Composite material

		this.compositeMaterial = this.getCompositeMaterial( this.nMips );
		this.compositeMaterial.uniforms.blurTexture1.value = this.rtVert[ 0 ].texture;
		this.compositeMaterial.uniforms.blurTexture2.value = this.rtVert[ 1 ].texture;
		this.compositeMaterial.uniforms.blurTexture3.value = this.rtVert[ 2 ].texture;
		this.compositeMaterial.uniforms.blurTexture4.value = this.rtVert[ 3 ].texture;
		this.compositeMaterial.uniforms.blurTexture5.value = this.rtVert[ 4 ].texture;
		this.compositeMaterial.uniforms.bloomStrength.value = this.strength;
		this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
		this.compositeMaterial.needsUpdate = true;

		const bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
		this.compositeMaterial.uniforms.bloomFactors.value = bloomFactors;
		this.bloomTintColors = [
			new THREE$1.Vector3( 1, 1, 1 ),
			new THREE$1.Vector3( 1, 1, 1 ),
			new THREE$1.Vector3( 1, 1, 1 ),
			new THREE$1.Vector3( 1, 1, 1 ),
			new THREE$1.Vector3( 1, 1, 1 ),
		];
		this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;

		// Copy material

		// if (THREE.CopyShader === undefined) {
		//   console.error("PIXY.UnrealBloomPass relies on THREE.CopyShader");
		// }

		const copyShader = ShaderLib.copy;
		this.copyUniforms = THREE$1.UniformsUtils.clone( copyShader.uniforms );
		this.copyUniforms.opacity.value = 1.0;
		this.copyMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			blending: THREE$1.AdditiveBlending,
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		this.enabled = true;
		this.needsSwap = false;
		this.oldClearColor = new THREE$1.Color();
		this.oldClearAlpha = 1;
		this.quad.frustumCulled = false; // Avoid getting clipped

	}

	dispose() {

		for ( let i = 0; i < this.rtHori.length(); i++ ) {

			this.rtHori[ i ].dispose();

		}

		for ( let i = 0; i < this.rtVert.length(); i++ ) {

			this.rtVert[ i ].dispose();

		}

		this.rtBright.dispose();

	}

	render( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.oldClearColor = new THREE$1.Color();
		renderer.getClearColor( this.oldClearColor );
		this.oldClearAlpha = renderer.getClearAlpha();

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setClearColor( new THREE$1.Color( 0, 0, 0 ), 0 );

		if ( maskActive ) {

			renderer.context.disable( renderer.context.STENCIL_TEST );

		}

		// 1. Extract Bright Areas
		this.highPassUniforms.tDiffuse.value = readBuffer.texture;
		this.highPassUniforms.luminosityThreshold.value = this.threshold;
		this.quad.material = this.highPassMaterial;
		renderer.setRenderTarget( this.rtBright );
		renderer.clear();
		renderer.render( this.scene, this.camera );

		// 2. Blur All the mips progressively
		let inputRenderTarget = this.rtBright;

		for ( let i = 0; i < this.nMips; i++ ) {

			this.quad.material = this.separableBlurMaterials[ i ];
			this.separableBlurMaterials[ i ].uniforms.tDiffuse.value = inputRenderTarget.texture;
			this.separableBlurMaterials[ i ].uniforms.direction.value = UnrealBloomPass.BlurDirectionX;
			renderer.setRenderTarget( this.rtHori[ i ] );
			renderer.clear();
			renderer.render( this.scene, this.camera );

			this.separableBlurMaterials[ i ].uniforms.tDiffuse.value = this.rtHori[ i ].texture;
			this.separableBlurMaterials[ i ].uniforms.direction.value = UnrealBloomPass.BlurDirectionY;
			renderer.setRenderTarget( this.rtVert[ i ] );
			renderer.clear();
			renderer.render( this.scene, this.camera );

			inputRenderTarget = this.rtVert[ i ];

		}

		// Composite All the mips
		this.quad.material = this.compositeMaterial;
		this.compositeMaterial.uniforms.bloomStrength.value = this.strength;
		this.compositeMaterial.uniforms.bloomRadius.value = this.radius;
		this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
		renderer.setRenderTarget( this.rtHori[ 0 ] );
		renderer.clear();
		renderer.render( this.scene, this.camera );

		// Blend it additively over the input texture
		this.quad.material = this.copyMaterial;
		this.copyUniforms.tDiffuse.value = this.rtHori[ 0 ].texture;

		if ( maskActive ) {

			renderer.context.enable( renderer.context.STENCIL_TEST );

		}

		renderer.setRenderTarget( writeBuffer );
		renderer.render( this.scene, this.camera );

		renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

	getSeparableBlurMaterial( kernelRadius ) {

		return new THREE$1.ShaderMaterial( {
			defines: {
				KERNEL_RADIUS: kernelRadius,
				SIGMA: kernelRadius,
			},

			uniforms: {
				tDiffuse: { value: null },
				texSize: { value: new THREE$1.Vector2( 0.5, 0.5 ) },
				direction: { value: new THREE$1.Vector2( 0.5, 0.5 ) },
			},

			vertexShader: [
				'varying vec2 vUv;',
				'void main() {',
				'  vUv = uv;',
				'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
				'}',
			].join( '\n' ),

			fragmentShader: [
				'#include <common>',
				'varying vec2 vUv;',
				'uniform sampler2D tDiffuse;',
				'uniform vec2 texSize;',
				'uniform vec2 direction;',

				'float gaussianPdf(in float x, in float sigma) {',
				'  return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;',
				'}',

				'void main() {',
				'  vec2 invSize = 1.0 / texSize;',
				'  float fSigma = float(SIGMA);',
				'  float weightSum = gaussianPdf(0.0, fSigma);',
				'  vec3 diffuseSum = texture2D(tDiffuse, vUv).rgb * weightSum;',
				'  for (int i=0; i<KERNEL_RADIUS; i++) {',
				'    float x = float(i);',
				'    float w = gaussianPdf(x, fSigma);',
				'    vec2 uvOffset = direction * invSize * x;',
				'    vec3 sample1 = texture2D(tDiffuse, vUv + uvOffset).rgb;',
				'    vec3 sample2 = texture2D(tDiffuse, vUv - uvOffset).rgb;',
				'    diffuseSum += (sample1 + sample2) * w;',
				'    weightSum += 2.0 * w;',
				'  }',
				'  gl_FragColor = vec4(diffuseSum / weightSum, 1.0);',
				'}',
			].join( '\n' ),

			depthTest: false,
			depthWrite: false,
		} );

	}

	getCompositeMaterial( nMips ) {

		return new THREE$1.ShaderMaterial( {
			defines: {
				NUM_MIPS: nMips,
			},

			uniforms: {
				blurTexture1: { value: null },
				blurTexture2: { value: null },
				blurTexture3: { value: null },
				blurTexture4: { value: null },
				blurTexture5: { value: null },
				dirtTexture: { value: null },
				bloomStrength: { value: 1.0 },
				bloomFactors: { value: null },
				bloomTintColors: { value: null },
				bloomRadius: { value: 0.0 },
			},

			vertexShader: [
				'varying vec2 vUv;',
				'void main() {',
				'  vUv = uv;',
				'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
				'}',
			].join( '\n' ),

			fragmentShader: [
				'varying vec2 vUv;',
				'uniform sampler2D blurTexture1;',
				'uniform sampler2D blurTexture2;',
				'uniform sampler2D blurTexture3;',
				'uniform sampler2D blurTexture4;',
				'uniform sampler2D blurTexture5;',
				'uniform sampler2D dirtTexture;',
				'uniform float bloomStrength;',
				'uniform float bloomRadius;',
				'uniform float bloomFactors[NUM_MIPS];',
				'uniform vec3 bloomTintColors[NUM_MIPS];',

				'float lerpBloomFactor(const in float factor) {',
				'  float mirrorFactor = 1.2 - factor;',
				'  return mix(factor, mirrorFactor, bloomRadius);',
				'}',

				'void main() {',
				'  gl_FragColor = bloomStrength * ',
				'    (lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + ',
				'     lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + ',
				'     lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + ',
				'     lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + ',
				'     lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv));',
				'}',
			].join( '\n' ),

			depthTest: false,
			depthWrite: false,
		} );

	}

}

UnrealBloomPass.BlurDirectionX = new THREE$1.Vector2( 1.0, 0.0 );
UnrealBloomPass.BlurDirectionY = new THREE$1.Vector2( 0.0, 1.0 );

const ViewRGB = 0;
const ViewAlpha = 1;
const ViewR = 2;
const ViewG = 3;
const ViewB = 4;
const ViewDecodeRGB = 5;
const ViewDecodeDepth = 6;
const ViewDepth = 7;

class SSAOPass extends ScreenPass {

	constructor( parameters ) {

		super();

		this.angleBias = parameters.angleBias || 40.0;
		this.radius = parameters.radius || 4.5;
		this.maxRadius = parameters.maxRadius || 0.5;
		this.strength = parameters.strength || 10.0;
		this.resolution = parameters.resolution || new THREE$1.Vector2( 512, 512 );
		this.depthTexture = parameters.depthTexture || null;
		this.sceneCamera = parameters.camera || null;
		this.downsampling = parameters.downsampling || 2;
		this.ssaoOnly = false;

		const pars = {
			minFilter: THREE$1.LinearFilter,
			magFilter: THREE$1.LinearFilter,
			format: THREE$1.RGBFormat,
			generateMipmaps: false,
			stencilBuffer: false,
		};

		this.rtBlur1 = new THREE$1.WebGLRenderTarget(
			this.resolution.x / this.downsampling,
			this.resolution.y / this.downsampling,
			pars
		);
		this.rtBlur2 = new THREE$1.WebGLRenderTarget(
			this.resolution.x / this.downsampling,
			this.resolution.y / this.downsampling,
			pars
		);

		this.makeUniforms = THREE$1.UniformsUtils.clone( ShaderLib.ssao2.uniforms );
		this.makeMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.makeUniforms,
			vertexShader: ShaderLib.ssao2.vertexShader,
			fragmentShader: ShaderLib.ssao2.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );

		this.blurXUniforms = THREE$1.UniformsUtils.clone( ShaderLib.ssao2Blur.uniforms );
		this.blurXMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.blurXUniforms,
			vertexShader: ShaderLib.ssao2Blur.vertexShader,
			fragmentShader: ShaderLib.ssao2Blur.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );

		this.blurYUniforms = THREE$1.UniformsUtils.clone( ShaderLib.ssao2Blur.uniforms );
		this.blurYMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.blurYUniforms,
			vertexShader: ShaderLib.ssao2Blur.vertexShader,
			fragmentShader: ShaderLib.ssao2Blur.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );

		const INV_LN2 = 1.44269504;
		// const SQRT_LN2 = 0.832554611;
		const blurSigma = ( 4.0 + 1.0 ) * 0.5;
		const blurFalloff = INV_LN2 / ( 2.0 * blurSigma * blurSigma );
		// const blurDepthThreshold = 2.0 * SQRT_LN2 * 0.2;
		const texSizeInvWidth = 1.0 / this.resolution.x;
		// const texSizeInvHeight = 1.0 / this.resolution.y;
		this.blurXUniforms.tAO.value = this.rtBlur1.texture;
		this.blurXUniforms.blurParams.value.set( texSizeInvWidth, 0.0, blurFalloff, 1.0 );
		this.blurYUniforms.tAO.value = this.rtBlur2.texture;
		this.blurYUniforms.blurParams.value.set( 0.0, texSizeInvWidth, blurFalloff, 1.0 );

		this.compositeUniforms = THREE$1.UniformsUtils.clone( ShaderLib.ssao2Composite.uniforms );
		this.compositeMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.compositeUniforms,
			vertexShader: ShaderLib.ssao2Composite.vertexShader,
			fragmentShader: ShaderLib.ssao2Composite.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );

		this.viewUniforms = THREE$1.UniformsUtils.clone( ShaderLib.view.uniforms );
		this.viewMaterial = new THREE$1.ShaderMaterial( {
			uniforms: this.viewUniforms,
			vertexShader: ShaderLib.view.vertexShader,
			fragmentShader: ShaderLib.view.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );
		this.viewUniforms.type.value = ViewR;
		// this.viewUniforms.type.value = PIXY.ViewRGB;

	}

	render( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) {

			renderer.context.disable( renderer.context.STENCIL_TEST );

		}

		const rad = this.radius;
		const rad2 = rad * rad;
		const negInvRad2 = -1 / rad2;

		const angleBias = radians( this.angleBias );
		const tanAngleBias = Math.tan( angleBias );

		const cot = 1.0 / Math.tan( radians( this.sceneCamera.fov * 0.5 ) );
		const resX = this.resolution.x;
		const resY = this.resolution.y;
		const maxRadius = this.maxRadius * Math.min( this.resolution.x, this.resolution.y );
		const invAoResX = 1.0 / this.resolution.x;
		const invAoResY = 1.0 / this.resolution.y;
		const focal1 = cot * ( this.resolution.y / this.resolution.x );
		const focal2 = cot;
		const invFocal1 = 1.0 / focal1;
		const invFocal2 = 1.0 / focal2;
		const uvToVA0 = 2.0 * invFocal1;
		const uvToVA1 = -2 * invFocal2;
		const uvToVB0 = -1 * invFocal1;
		const uvToVB1 = 1.0 * invFocal2;

		this.makeUniforms.radiusParams.value.set( rad, rad2, negInvRad2, maxRadius );
		this.makeUniforms.biasParams.value.set( angleBias, tanAngleBias, this.strength, 1.0 );
		this.makeUniforms.screenParams.value.set( resX, resY, invAoResX, invAoResY );
		this.makeUniforms.uvToViewParams.value.set( uvToVA0, uvToVA1, uvToVB0, uvToVB1 );
		this.makeUniforms.focalParams.value.set( focal1, focal2, invFocal1, invFocal2 );
		this.makeUniforms.cameraParams.value.set( this.sceneCamera.near, this.sceneCamera.far );
		this.makeUniforms.tDepth.value = this.depthTexture;

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		// MAKE SSAO
		this.quad.material = this.makeMaterial;
		renderer.setRenderTarget( this.rtBlur1 );
		renderer.render( this.scene, this.camera );

		for ( let i = 0; i < 2; ++i ) {

			this.quad.material = this.blurXMaterial;
			renderer.setRenderTarget( this.rtBlur2 );
			renderer.render( this.scene, this.camera );

			this.quad.material = this.blurYMaterial;
			renderer.setRenderTarget( this.rtBlur1 );
			renderer.render( this.scene, this.camera );

		}

		const target = this.rtBlur1;

		if ( this.ssaoOnly ) {

			this.quad.material = this.viewMaterial;
			this.viewUniforms.tDiffuse.value = target.texture;

		} else {

			this.quad.material = this.compositeMaterial;
			this.compositeUniforms.tDiffuse.value = readBuffer.texture;
			this.compositeUniforms.tAO.value = target.texture;

		}

		renderer.setRenderTarget( writeBuffer );
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

}

var binaryMatrixFrag = "vec2 I = pin.coord+vec2(16,32);\r\nfloat g = 3.0 - length((modf(I/vec2(16,32),I)-0.5)*mat2(12,12,32,12)[int(length(I)*1e5-time)&1]); \r\nvec3 o = vec3(g, g, g);\r\no *= mat3(2.0,2.0,2.0, 2.8,2.8,2.8, 2.0,2.0,2.0)[int(length(I)*1e5-time)&1] - o;\r\npout.color = o;";

var blocksFrag = "// http://glslsandbox.com/e#34145.1\r\n\r\n#define SHOW_BLOCKS\r\nconst float speed = 0.7;\r\nconst float spread = 1.6;\r\nconst int numBlocks = 35;\r\n\r\nfloat pulse = 0.5;\r\n\r\nvec2 uv = pin.position * 0.5;\r\nvec3 baseColor = vec3(0.0, 0.3, 0.6);\r\nvec3 color = pulse * baseColor * 0.5 * (0.9 - cos(uv.x*8.0));\r\nfor (int i=0; i<numBlocks; ++i) {\r\n  float z = 1.0 - 0.7*rand(float(i)*1.4333); // 0=far , 1=near\r\n  float tickTime = time * z * speed + float(i) * 1.23753;\r\n  float tick = floor(tickTime);\r\n//   vec2 pos = vec2(0.6 * (rand(tick)-0.5), sign(uv.x)*spread*(0.5-fract(tickTime)));\r\n//   vec2 pos = vec2(0.6 * (rand(tick)-0.5), abs(sign(uv.x))*spread*(0.5-fract(tickTime)));\r\n  vec2 pos = vec2(0.6 * (rand(tick)-0.5), 0.6 * (rand(tick+0.2)-0.5));\r\n//   pos.x += 0.24*sign(pos.x);\r\n//   if (abs(pos.x) < 0.1) pos.x++;\r\n\r\n  vec2 size = 1.8*z*vec2(0.04, 0.04 + 0.1 * rand(tick+0.2)) * sin(tickTime);\r\n  float b = box(uv - pos, size, 0.01);\r\n  float dust = z * smoothstep(0.22, 0.0, b) * pulse * 0.5;\r\n#ifdef SHOW_BLOCKS\r\n  float block = 0.2*z*smoothstep(0.002, 0.0, b);\r\n  float shine = 0.6*z*pulse*smoothstep(-0.002, b, 0.007);\r\n  color += dust * baseColor + block*z + shine;\r\n#else\r\n  color += dust * baseColor;\r\n#endif\r\n}\r\npout.color = color;";

var bonfireFrag = "vec2 drag = vec2(0.0, 0.0);\r\nvec2 offset = vec2(0.0, 0.0);\r\n\r\nfloat clip = 210.0;\r\nfloat ypartClip = pin.coord.y/clip;\r\nfloat ypartClippedFalloff = clamp(2.0-ypartClip, 0.0, 1.0);\r\nfloat ypartClipped = min(ypartClip, 1.0);\r\nfloat ypartClippedn = 1.0 - ypartClipped;\r\n\r\nfloat xfuel = 1.0 - abs(2.0*pin.uv.x-1.0);\r\n// float xfuel = pow(1.0 - abs(2.0*pin.uv.x-1.0),0.5);\r\n\r\nfloat realTime = cSpeed * time;\r\n\r\nvec2 coordScaled = cDensity * 0.01 * pin.coord.xy - 0.02 * vec2(offset.x, 0.0);\r\nvec3 position = vec3(coordScaled,0.0) + vec3(1223.0,6443.0,8425.0);\r\nvec3 flow = vec3(4.1*(0.5-pin.uv.x)*pow(ypartClippedn,4.0),-2.0*xfuel*pow(ypartClippedn,64.0),0.0);\r\nvec3 timing = realTime * vec3(0.0,-1.7*cStrength*10.0,1.1) + flow;\r\n\r\nvec3 displacePos = vec3(1.0,0.5,1.0)*2.4*position + realTime*vec3(0.01,-0.7,1.3);\r\nvec3 displace3 = vec3(noiseStackUV(displacePos, 2, 0.4, 0.1),0.0);\r\n\r\nvec3 noiseCoord = (vec3(2.0,1.0,1.0)*position + timing + 0.4*displace3);\r\nfloat noise = noiseStack(noiseCoord, 3, 0.4);\r\n\r\nfloat flames = pow(ypartClipped, 0.3*xfuel) * pow(noise, 0.3*xfuel);\r\n\r\nfloat f = ypartClippedFalloff * pow(1.0 - flames*flames*flames, 8.0);\r\nfloat fff = f*f*f;\r\nvec3 fire = cIntensity * vec3(f, fff, fff*fff);\r\n\r\n// smoke\r\n// float smokeNoise = 0.5 + snoise(0.4*position + timing*vec3(1.0,1.0,0.2))/2.0;\r\n// vec3 smoke = vec3(0.3 * pow(xfuel,3.0)*pow(pin.uv.y,2.0) * (smokeNoise + 0.4*(1.0-noise)));\r\n\r\n// sparks\r\nfloat sparkGridSize = cSize*10.0;\r\nvec2 sparkCoord = pin.coord.xy - vec2(2.0*offset.x,190.0*realTime);\r\nsparkCoord -= 30.0*noiseStackUV(0.01*vec3(sparkCoord,30.0*time), 1, 0.4, 0.1);\r\nsparkCoord += 100.0 * flow.xy;\r\nif (mod(sparkCoord.y/sparkGridSize,2.0) < 1.0) sparkCoord.x += 0.5 * sparkGridSize;\r\nvec2 sparkGridIndex = vec2(floor(sparkCoord/sparkGridSize));\r\nfloat sparkRandom = prng(sparkGridIndex);\r\nfloat sparkLife = min(10.0*(1.0-min((sparkGridIndex.y + (190.0*realTime/sparkGridSize))/(24.0-20.0*sparkRandom), 1.0)), 1.0);\r\nvec3 sparks = vec3(0.0);\r\nif (sparkLife > 0.0) {\r\n  float sparkSize = xfuel*xfuel*sparkRandom*0.08;\r\n  float sparkRadians = 999.0*sparkRandom*2.0*PI + 2.0*time;\r\n  vec2 sparkCircular = vec2(sin(sparkRadians), cos(sparkRadians));\r\n  vec2 sparkOffset = (0.5-sparkSize) * sparkGridSize * sparkCircular;\r\n  vec2 sparkModules = mod(sparkCoord + sparkOffset, sparkGridSize) - 0.5*vec2(sparkGridSize);\r\n  float sparkLength = length(sparkModules);\r\n  float sparksGray = max(0.0, 1.0 - sparkLength/(sparkSize*sparkGridSize));\r\n  sparks = sparkLife * sparksGray * vec3(1.0,0.3,0.0);\r\n}\r\n\r\n// vec3 color = max(fire,sparks) + smoke;\r\nvec3 color = max(fire,sparks);\r\nvec3 gray = vec3(rgb2gray(color));\r\npout.color = mix(gray, color, cColor);";

var bonfireFragPars = "uniform float cSpeed;\r\nuniform float cIntensity;\r\nuniform float cStrength;\r\nuniform float cDensity;\r\nuniform float cSize;\r\nuniform float cColor;\r\n\r\nfloat noiseStack(vec3 pos, int octaves, float falloff) {\r\n  float noise = snoise(pos);\r\n  float off = 1.0;\r\n  if (octaves > 1) {\r\n    off *= falloff;\r\n    noise = (1.0-off)*noise + off*snoise(pos);\r\n  }\r\n  if (octaves > 2) {\r\n    pos *= 2.0;\r\n    off *= falloff;\r\n    noise = (1.0-off)*noise + off*snoise(pos);\r\n  }\r\n  if (octaves > 3) {\r\n    pos *= 2.0;\r\n    off *= falloff;\r\n    noise = (1.0-off)*noise + off*snoise(pos);\r\n  }\r\n  return (1.0+noise)/2.0;\r\n}\r\nvec2 noiseStackUV(vec3 pos, int octaves, float falloff, float diff) {\r\n  float displaceA = noiseStack(pos, octaves, falloff);\r\n  float displaceB = noiseStack(pos + vec3(3984.293,423.21,5235.19), octaves, falloff);\r\n  return vec2(displaceA, displaceB);\r\n}";

const bonfireUniforms = {
	cSpeed: { value: 0.5 },
	cIntensity: { value: 1.5 },
	cStrength: { value: 1.0 },
	cDensity: { value: 1.0 },
	cSize: { value: 3.0 },
	cColor: { value: 1.0 },
};

var booleanNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat s = resolution.x * cNoiseFrequency;\r\nfloat lum = float(iqhash2(floor(p*s)/s) > 0.5);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = float(iqhash2(floor(p.xx*s)/s) > 0.5);";

var booleanNoiseFragPars = "// dummy";

var brushStrokeFrag = "// vec3 color = vec3(1.0, 1.0, 0.86);\r\nvec3 color = vec3(0.0);\r\nvec2 uv = pin.position;\r\nfloat dist;\r\n\r\n// 0.8, 0.1, 0.0\r\nvec3 brushColor = mix(vec3(1.0), vec3(0.8, 0.1, 0.0), cColor);\r\ncolor = colorBrushStroke(uv, color, vec4(brushColor, 0.9),\r\n  vec2(cBrushStrokeX1, cBrushStrokeY1), vec2(cBrushStrokeX2, cBrushStrokeY2), cWidth);\r\n  // vec2(-0.4, 0.0), vec2(1.1, 0.8), 0.3);\r\n\r\n// rec-orangeish signature\r\n// dist = sdAxisAlignedRect(uv, vec2(-0.68), vec2(-0.55));\r\n// float amt = 90.0 + (brushRand(uv.y) * 100.0) + (brushRand(uv.x / 4.0) * 90.0);\r\n// float vary = sin(uv.x * uv.y * 50.0) * 0.0047;\r\n// dist = opS(dist - 0.028 + vary, dist - 0.019 - vary); // round edges, and hollow it out\r\n// color = mix(color, vec3(0.99, 0.4, 0.0), dtoa(dist, amt) * 0.7);\r\n// color = mix(color, vec3(0.85, 0.0, 0.0), dtoa(dist, 700.0));\r\n\r\n// grain\r\ncolor.rgb += (brushRand(uv) - 0.5) * 0.08;\r\ncolor.rgb = clamp(color.rgb, vec3(0.0), vec3(1.0));\r\n\r\n// uv -= 1.0;\r\n// float vigentteAmt = 1.0 - dot(uv * 0.5, uv * 0.12);\r\n// color *= vigentteAmt;\r\n\r\npout.color = color;";

var brushStrokeFragPars = "uniform float cWidth;\r\nuniform float cStrength;\r\nuniform float cAlpha;\r\nuniform float cAmplitude;\r\nuniform float cAngle;\r\nuniform float cBrushStrokeX1;\r\nuniform float cBrushStrokeY1;\r\nuniform float cBrushStrokeX2;\r\nuniform float cBrushStrokeY2;\r\nuniform float cColor;\r\n//-------------------------------------------------------------------------\r\n// https://www.shadertoy.com/view/lt23D3\r\nfloat nsin(float a) { return 0.5+0.5*sin(a); }\r\nfloat ncos(float a) { return 0.5+0.5*cos(a); }\r\nfloat opS(float d2, float d1) { return max(-d1,d2); }\r\nfloat brushRand(vec2 co) { return rand(co); }\r\nfloat brushRand(float n) { return rand3(n); }\r\nfloat dtoa(float d, float amount) { return clamp(1.0 / (clamp(d, 1.0/amount, 1.0)*amount), 0.0, 1.0); }\r\nfloat sdAxisAlignedRect(vec2 uv, vec2 tl, vec2 br) {\r\n  vec2 d = max(tl-uv, uv-br);\r\n  return length(max(vec2(0.0), d)) + min(0.0, max(d.x, d.y));\r\n}\r\n// 0-1 1-0\r\nfloat smoothstep4(float e1, float e2, float e3, float e4, float val) {\r\n  return min(smoothstep(e1,e2,val), 1.0 - smoothstep(e3,e4,val));\r\n}\r\nvec2 brushHash(vec2 p) { return iqhash2vec(p); }\r\n// returns -0.5 to 1.5\r\nfloat brushNoise(vec2 p) {\r\n  const float K1 = 0.366025404; // (sqrt(3)-1)/2\r\n  const float K2 = 0.211324865; // (3-sqrt(3))/6 \r\n  vec2 i = floor(p + (p.x + p.y) * K1);\r\n  vec2 a = p - i + (i.x + i.y) * K2;\r\n  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); // vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));\r\n  vec2 b = a - o + K2;\r\n  vec2 c = a - 1.0 + 2.0 * K2;\r\n  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);\r\n  vec3 n = h*h*h*h*vec3(dot(a, brushHash(i+0.0)), dot(b, brushHash(i+o)), dot(c, brushHash(i+1.0)));\r\n  return dot(n, vec3(70.0));\r\n}\r\nfloat brushNoise01(vec2 p) {\r\n  return clamp((brushNoise(p) + 0.5) * 0.5, 0.0, 1.0);\r\n}\r\n//-------------------------------------------------------------------------\r\nvec3 colorAxisAlignedBrushStroke(vec2 uv, vec2 uvPaper, vec3 inpColor, vec4 brushColor, vec2 p1, vec2 p2) {\r\n  // how far along is this point in the line. will come in handy.\r\n  vec2 posInLine = smoothstep(p1, p2, uv); // (uv-p1)/(p2-p1);\r\n  \r\n  // wobble it around, humanize\r\n  float wobbleAmplitude = cAmplitude;\r\n  uv.x += sin(posInLine.y * PI2 * cAngle) * wobbleAmplitude;\r\n  \r\n  // distance to geometry\r\n  float d = sdAxisAlignedRect(uv, p1, vec2(p1.x, p2.y));\r\n  d -= abs(p1.x - p2.x) * 0.5; // rounds out the end.\r\n  \r\n  // warp the position-in-line, to control the curve of the brush falloff.\r\n  posInLine = pow(posInLine, vec2((nsin(time*0.5) * 2.0) + 0.3));\r\n  \r\n  // brush stroke fibers effect\r\n  float strokeStrength = dtoa(d, 100.0);\r\n  float strokeAlpha = 0.0\r\n    + brushNoise01((p2-uv) * vec2(min(resolution.y,resolution.x)*0.25, 1.0)) // high freq fibers\r\n    + brushNoise01((p2-uv) * vec2(79.0, 1.0)) // smooth brush texture. lots of room for variation here, also layering.\r\n    + brushNoise01((p2-uv) * vec2(14.0, 1.0)) // low freq noise, gives more variation\r\n    ;\r\n  strokeAlpha *= cAlpha;\r\n  strokeAlpha = strokeAlpha * strokeStrength;\r\n  strokeAlpha = strokeAlpha - (1.0 - posInLine.y);\r\n  strokeAlpha = (1.0 - posInLine.y) - (strokeAlpha * (1.0 - posInLine.y));\r\n  \r\n  // fill texture.\r\n  float inkOpacity = 0.85 * cStrength;\r\n  float fillAlpha = (dtoa(abs(d), 90.0) * (1.0 - inkOpacity)) + inkOpacity;\r\n  \r\n  // paper bleed effect\r\n  // float amt = 140.0 + (brushRand(uvPaper.y) * 30.0) + (brushRand(uvPaper.x) * 30.0);\r\n  float amt = 140.0 + (brushRand(uvPaper.y) * 1.0) + (brushRand(uvPaper.x) * 1.0);\r\n  \r\n  float alpha = fillAlpha * strokeAlpha * brushColor.a * dtoa(d, amt);\r\n  alpha = clamp(alpha, 0.0, 1.0);\r\n  return mix(inpColor, brushColor.rgb, alpha);\r\n}\r\n//-------------------------------------------------------------------------\r\nvec3 colorBrushStroke(vec2 uv, vec3 inpColor, vec4 brushColor, vec2 p1, vec2 p2, float lineWidth) {\r\n  // flatten the line to be axis-aligned\r\n  vec2 rectDimensions = p2 - p1;\r\n  float angle = atan(rectDimensions.x, rectDimensions.y);\r\n  mat2 rotMat = rotate2d(-angle);\r\n  p1 *= rotMat;\r\n  p2 *= rotMat;\r\n  float halfLineWidth = lineWidth / 2.0;\r\n  p1 -= halfLineWidth;\r\n  p2 += halfLineWidth;\r\n  vec3 ret = colorAxisAlignedBrushStroke(uv * rotMat, uv, inpColor, brushColor, p1, p2);\r\n  return ret;\r\n}\r\n";

const brushStrokeUniforms = {
	cWidth: { value: 0.3 },
	cStrength: { value: 0.6 },
	cAlpha: { value: 0.58 },
	cAmplitude: { value: 0.24 },
	cAngle: { value: 0.0 },
	cBrushStrokeX1: { value: -0.4 },
	cBrushStrokeY1: { value: 0.38 },
	cBrushStrokeX2: { value: -0.09 },
	cBrushStrokeY2: { value: -0.61 },
	cColor: { value: 1.0 },
};

var bubblesFrag = "if (cBubblesVariation >= 2.0) {\r\n  float delta = colDelta*2.0;\r\n  float l = length(pin.position);\r\n  float a = mod(atan(pin.position.x, pin.position.y), delta) - delta/4.0;\r\n  float c= clr2(l,a);\r\n  pout.color = c * mix(vec3(1.0), CLR, cColor);\r\n}\r\nelse {\r\n  float c = clr1(pin.position);\r\n  pout.color = c * mix(vec3(1.0), CLR, cColor);\r\n}";

var bubblesFragPars = "// https://www.shadertoy.com/view/Xl2Bz3\r\nuniform float cRadius;\r\nuniform float cWidth;\r\nuniform float cThickness;\r\nuniform float cColor;\r\nuniform float cBubblesVariation;\r\n#define TAU 6.28318530718\r\n#define CLR vec3(0.388, 0.843, 0.976)\r\n#define ROWS 9\r\n\r\n#define COLS1 20\r\n#define initialRad1 0.125\r\n#define waveCenter1 0.41\r\n#define waveWidth1 0.2\r\n#define es1 0.01\r\n#define dotRad1(x) TAU*x/float(COLS1)*0.4\r\n\r\n#define COLS2 12\r\n#define es2 4.0/resolution.y\r\n#define initialRad2 0.175\r\n#define waveCenter2 0.4325\r\n#define waveWidth2 0.205\r\n#define dotRad2(x) TAU*x/float(COLS2)*0.25\r\n#define colDelta PI/float(COLS2)\r\n\r\nfloat remap(float value, float minValue, float maxValue) {\r\n  return clamp((value - minValue) / (maxValue - minValue), 0.0, 1.0);\r\n}\r\n\r\nfloat calcRowRad1(int rowNum) {\r\n  float rad = initialRad1;\r\n  rad += max(0.0, sin(time*3.0)) * step(0.0, cos(time*3.0)) * 0.0705;\r\n  for (int i=0; i<ROWS; i++) {\r\n    if (i >= rowNum) break;\r\n    rad += dotRad1(rad) * 2.0;\r\n  }\r\n  return rad;\r\n}\r\n\r\nfloat calcRowRad2(int rowNum) {\r\n  float rad = initialRad2;\r\n  rad += max(0.0, sin(time*4.0)) * step(0.0, cos(time*4.0)) * 0.066;\r\n  for (int i=0; i<ROWS; i++) {\r\n    if (i >= rowNum) break;\r\n    rad += dotRad2(rad) * 1.33;\r\n  }\r\n  return rad;\r\n}\r\n\r\nfloat clr1(vec2 st) {\r\n  float clr = 0.0;\r\n  float colStep = TAU/float(COLS1);\r\n  for (int j=0; j<ROWS; j++) {\r\n    float rowRad = calcRowRad1(j);\r\n    for (int i=0; i<COLS1; i++) {\r\n      vec2 dotCenter = vec2(rowRad, 0.0) * rotate2d(float(i) * colStep + (colStep * 0.5 * mod(float(j), 2.0)));\r\n      float dotRad = dotRad1(rowRad);\r\n      float dotClr = 1.0 - smoothstep(dotRad - es1, dotRad, length(st - dotCenter));\r\n      float thickness = pow(remap(abs(length(dotCenter) - waveCenter1 * cRadius), 0.0, waveWidth1 * cWidth), 1.25*cThickness);\r\n      dotClr *= smoothstep(dotRad * thickness - es1, dotRad * thickness, length(st - dotCenter));\r\n      dotClr *= step(es1, 1.0 - thickness);\r\n      clr += dotClr;\r\n    }\r\n  }\r\n  return clr;\r\n}\r\n\r\nfloat clr2(float r, float a) {\r\n  vec2 st = vec2(r*cos(a), r*sin(a));\r\n  float clr = 0.0;\r\n  for (int j=0; j<ROWS; j++) {\r\n    float rowRad = calcRowRad2(j);\r\n    vec2 dotCenter = vec2(rowRad, 0.0) * rotate2d(colDelta * mod(float(j), 2.0));\r\n    float dotRad = dotRad2(rowRad);\r\n    float dotClr = smoothstep(dotRad, dotRad - es2, length(st - dotCenter));\r\n    float thickness = pow(remap(abs(length(dotCenter) - waveCenter2*cRadius), 0.0, waveWidth2*cWidth), 1.25*cThickness);\r\n    dotClr *= smoothstep(dotRad * thickness - es2, dotRad * thickness, length(st - dotCenter));\r\n    dotClr *= step(es2, 1.0 - thickness);\r\n    clr += dotClr;\r\n  }\r\n  return clr;\r\n}";

const bubblesUniforms = {
	cRadius: { value: 1.0 },
	cWidth: { value: 1.0 },
	cThickness: { value: 1.0 },
	cColor: { value: 1.0 },
	cBubblesVariation: { value: 1.0 },
};

var causticsFrag = "mat3 m = mat3(-2,-1,2,3,-2,1,1,2,2);\r\nvec3 a = vec3(pin.coord/vec2(100.0*cScale), time/(max(4.5-cSpeed,0.001)))*m;\r\nvec3 b = a * m * .4;\r\nvec3 c = b * m * .3;\r\npout.color = vec3(pow(min(\r\n    min(length(.5-fract(a)), length(.5-fract(b))),\r\n    length(.5-fract(c))),7.0) * 25.0);\r\npout.color += mix(vec3(.0), vec3(.0,.35,.5), cColor);\r\n";

var causticsFragPars = "// https://www.shadertoy.com/view/MdKXDm\r\nuniform float cScale;\r\nuniform float cSpeed;\r\nuniform float cColor;";

const causticsUniforms = {
	cScale: { value: 4.0 },
	cSpeed: { value: 2.0 },
	cColor: { value: 1.0 },
};

var cellFrag = "// http://glslsandbox.com/e#37373.0\r\nfloat t = fworley(pin.uv * resolution.xy / 1500.0) * cIntensity;\r\nt = pow(t, cPowerExponent);\r\n// t *= exp(-lengthSqr(abs(0.7 * pin.uv - 1.0)));\r\n// \"pout.color = t * vec3(0.1, 1.5*t, 1.2*t + pow(t, 0.5-t));\"\r\npout.color = vec3(t);";

var cellFragPars = "// http://glslsandbox.com/e#37373.0\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;\r\nuniform float cSize;\r\n\r\nfloat lengthSqr(vec2 p) { return dot(p,p); }\r\n\r\nfloat cellNoise(vec2 p) {\r\n  return fract(sin(fract(sin(p.x) * 43.13311) + p.y) * 31.0011);\r\n}\r\n\r\nfloat worley(vec2 p) {\r\n  float d = 1e30;\r\n  for (int xo=-1; xo <= 1; ++xo) {\r\n    for (int yo=-1; yo <= 1; ++yo) {\r\n      vec2 tp = floor(p) + vec2(xo, yo);\r\n      d = min(d, lengthSqr(p - tp - vec2(cellNoise(tp))));\r\n    }\r\n  }\r\n  return 5.0 * exp(-4.0 * abs(2.0*d - 1.0));\r\n}\r\n\r\nfloat fworley(vec2 p) {\r\n  return sqrt(sqrt(sqrt(\r\n    1.0 * // light\r\n//     worley(p*5.0 + 0.3 + time * 0.525) * \r\n    sqrt(worley(p * 50.0 / cSize + 0.3 + time * -0.15)) * \r\n//     sqrt(sqrt(worley(p * -10.0 + 9.3))) )));\r\n    1.0 )));\r\n}";

var cellNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat lum = iqnoise(p * 48.0 * cNoiseFrequency + 0.5, 0.0, 0.0);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = iqnoise(p.xx * 48.0 * cNoiseFrequency + 0.5, 0.0, 0.0);";

var cellNoiseFragPars = "// dummy";

const cellUniforms = {
	cIntensity: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
	cSize: { value: 1.0 },
};

var checkerFrag = "float scale = min(resolution.x, resolution.y);\r\nfloat width = resolution.x / scale;\r\nfloat height = resolution.y / scale;\r\nvec2 xy = pin.coord / scale - vec2(width/2.0, height/2.0);\r\nxy = vec2(xy) * rotate2d(radians(time*5.0));\r\n\r\nfloat tile = floor(sin(xy.x*cWidth) * sin(xy.y*cHeight) + 1.0);\r\npout.color = vec3(tile);\r\n";

var checkerFragPars = "uniform float cWidth;\r\nuniform float cHeight;";

const checkerUniforms = {
	cWidth: { value: 50.0 },
	cHeight: { value: 50.0 },
};

var circleFrag = "// float t = 1.1 - length(pin.mouse - pin.position);\r\nfloat t = cRadius - length(pin.position);\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var circleFragPars = "uniform float cRadius;\r\nuniform float cPowerExponent;";

const circleUniforms = {
	cRadius: { value: 1.1 },
	cPowerExponent: { value: 1.0 },
};

var cloud2Frag = "vec2 ndc = 2.0 * pin.coord.xy / resolution.xy - 1.0;\r\nvec3 col = render(ndc, resolution.y / resolution.x);\r\npout.color = sqrt(col);";

var cloud2FragPars = "uniform float cIntensity;\r\nuniform float cDensity;\r\nuniform float cThickness;\r\nuniform float cColor;\r\nconst vec3 sunDir = normalize(vec3(-0.6, 0.4, 0.6));\r\n\r\nfloat cloudsHash(float n) { return fract(sin(n)*43578.5453123); }\r\nfloat cloudsNoise(in vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  float n = p.x + p.y*157.0 + 113.0*p.z;\r\n  return 2.0 * mix(mix(mix(cloudsHash(n+0.0), cloudsHash(n+1.0), f.x),\r\n                       mix(cloudsHash(n+157.0), cloudsHash(n+158.0), f.x), f.y),\r\n                   mix(mix(cloudsHash(n+113.0), cloudsHash(n+114.0), f.x),\r\n                       mix(cloudsHash(n+270.0), cloudsHash(n+271.0), f.x), f.y), f.z)-1.0;\r\n}\r\nfloat cloudsFbm(in vec3 pos, int layers, float AM, float FM) {\r\n  float sum = 0.0;\r\n  float amplitude = 1.0;\r\n  for (int i=0; i<16; ++i) {\r\n    if (i >= layers) break;\r\n    sum += amplitude * cloudsNoise(pos);\r\n    amplitude *= AM;\r\n    pos *= FM;\r\n  }\r\n  return sum;\r\n}\r\nfloat clouds(in vec3 p) {\r\n  return 0.01 * cloudsFbm(0.9*vec3(0.2,0.2,0.3)*(p+vec3(0.0,0.0,3.0*time)), 7, 0.5, 4.0);\r\n}\r\nvec2 renderNoise(in vec3 ro, in vec3 rd) {\r\n  float tmin = 10.0;\r\n  float tmax = 10.0 + 10.0*cDensity;\r\n  float delta = 0.1;\r\n  float sum = 0.0;\r\n  float t = tmin;\r\n  for (int i=0; i<100; ++i) {\r\n    if (t >= tmax) break;\r\n    vec3 pos = ro + t*rd;\r\n    float d = max(0.0, clouds(pos));\r\n    sum = sum*(1.0-d)+d;\r\n    if (sum > 0.99) break;\r\n    t += delta;\r\n  }\r\n  return vec2(sum, t);\r\n}\r\nfloat shadeClouds(in vec3 ro, in vec3 rd) {\r\n  float sum = 0.0;\r\n  float t = 0.0;\r\n  float delta = 0.1;\r\n  for (int i=0; i<5; ++i) {\r\n    vec3 pos = ro + rd*t;\r\n    float d = max(0.0, clouds(pos));\r\n    sum = sum*(1.0-d)+d;\r\n    if (sum > 0.99) break;\r\n    t += delta;\r\n  }\r\n  return sum;\r\n}\r\nvec3 render(in vec3 ro, in vec3 rd) {\r\n  //const vec3 sky = vec3(0.4, 0.6, 1.0);\r\n  const vec3 sky = vec3(0.0, 0.0, 0.0);\r\n  //vec3 att = vec3(0.2, 0.5, 0.9);\r\n  //vec3 att = vec3(0.0, 0.0, 0.0);\r\n  vec3 att = mix(vec3(0.0), vec3(0.2, 0.5, 0.9), cColor);\r\n  vec2 ns = renderNoise(ro, rd);\r\n  vec3 pos = ro + rd*ns.y;\r\n  float shad = 1.0; // 0.9 * (1.0 - shadeClouds(pos + sunDir*0.1, sunDir));\r\n  float density = ns.x;\r\n  float inv = 1.0 - density;\r\n  float w = 1.8 * (0.5 * rd.y + 0.5) * cIntensity;\r\n  vec3 cl = shad * w * 1.0 * mix(vec3(1.0), inv*att, sqrt(density));\r\n  if (density < 0.1) return mix(sky, cl, max(0.0, density)*10.0*cThickness);\r\n  return cl;\r\n}\r\nvec3 render(vec2 ndc, float aspectRatio) {\r\n  vec3 o = vec3(0.0, 0.0, 0.0);\r\n  const float fov = 2.0 * PI / 3.0;\r\n  const float scaleX = tan(fov / 2.0);\r\n  vec3 right = vec3(1.0, 0.0, 0.0) * scaleX;\r\n  vec3 forward = vec3(0.0, 0.0, 1.0);\r\n  vec3 up = vec3(0.0, 1.0, 0.0) * scaleX * aspectRatio;\r\n  vec3 rd = normalize(forward + ndc.x*right + ndc.y*up);\r\n  return render(o, rd);\r\n}";

const cloud2Uniforms = {
	cDensity: { value: 1.0 },
	cThickness: { value: 1.0 },
	cIntensity: { value: 1.0 },
	cColor: { value: 1.0 },
};

var cloudFrag = "// https://www.shadertoy.com/view/XsfXW8 by FabriceNeyret2\r\n\r\nvec2 uv = pin.position;\r\n// float z = -PI/2.0*cCameraTilt;\r\nfloat z = -3.14/2.0*cCameraTilt;\r\n// ks = 1.0; ps = 3.0; ki=0.9; pi=3.0;\r\nfloat t = -PI/2.0*cCameraPan;\r\n// t = -PI/2.0 * mouse.x;\r\n// z = -PI/2.0 * mouse.y;\r\n\r\nvec3 O = vec3(-15.0*cos(t)*cos(z), 15.0*sin(t)*cos(z), 15.0*sin(z)); // camera\r\nfloat compas = t-0.2 * uv.x;\r\nvec2 dir = vec2(cos(compas), sin(compas));\r\n\r\nmat3 M = lookat(O, vec3(0.0), 5.0);\r\n// vec2 dx = vec2(1.0, 0.0);\r\ndrawObj(O, M, uv, 2, pout.color);\r\n// drawObj(O, M, 1.5*(uv+dx), 0, pout.color);\r\n// drawObj(O, M, 1.5*(uv-dx), 1, pout.color);\r\n// pout.color = vec3(1.0, 0.0, 0.0);";

var cloudFragPars = "// https://www.shadertoy.com/view/XsfXW8 by FabriceNeyret2\r\n\r\nuniform float cCameraTilt;\r\nuniform float cCameraPan;\r\nuniform float cWidth;\r\nuniform float cHeight;\r\nuniform float cDepth;\r\nuniform float cIntensity;\r\nuniform float cLightX;\r\nuniform float cLightY;\r\nuniform float cLightZ;\r\nuniform float cAmbient;\r\nuniform float cSmoothness;\r\nuniform float cSmoothnessPower;\r\nuniform float cThickness;\r\nuniform float cThicknessPower;\r\n// vec3 R = vec3(2.0, 3.0, 2.0);\r\n// vec3 L = normalize(vec3(-0.4, 0.0, 1.0));\r\n// #define AMBIENT 0.1\r\n// float t = time;\r\n\r\n\r\n// --- noise functions from https://www.shadertoy.com/view/XslGRr\r\n// Created by inigo quilez - iq/2013\r\n// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\r\n\r\nmat3 m = mat3( 0.00,  0.80,  0.60,\r\n              -0.80,  0.36, -0.48,\r\n              -0.60, -0.48,  0.64 );\r\n\r\nfloat hash( float n ) {    // in [0,1]\r\n    return fract(sin(n)*43758.5453);\r\n}\r\n\r\nfloat noise( in vec3 x ) { // in [0,1]\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n\r\n  f = f*f*(3.0-2.0*f);\r\n\r\n  float n = p.x + p.y*57.0 + 113.0*p.z;\r\n\r\n  float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),\r\n                      mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),\r\n                  mix(mix( hash(n+113.0), hash(n+114.0),f.x),\r\n                      mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);\r\n  return res;\r\n}\r\n\r\nfloat fbm( vec3 p ) {    // in [0,1]\r\n  p += time;\r\n  float f;\r\n  f  = 0.5000*noise( p ); p = m*p*2.02;\r\n  f += 0.2500*noise( p ); p = m*p*2.03;\r\n  f += 0.1250*noise( p ); p = m*p*2.01;\r\n  f += 0.0625*noise( p );\r\n  return f;\r\n}\r\n\r\nfloat snoise2(in vec3 x) { // in [-1,1]\r\n  return 2.0 * noise(x) - 1.0;\r\n}\r\n\r\nfloat sfbm( vec3 p ) {    // in [0,1]\r\n  p += time;\r\n  float f;\r\n  f  = 0.5000*snoise2( p ); p = m*p*2.02;\r\n  f += 0.2500*snoise2( p ); p = m*p*2.03;\r\n  f += 0.1250*snoise2( p ); p = m*p*2.01;\r\n  f += 0.0625*snoise2( p );\r\n  return f;\r\n}\r\n\r\n// --- view matrix when looking T from O with [-1,1]x[-1,1] screen at dist d\r\nmat3 lookat(vec3 O, vec3 T, float d) {\r\n  mat3 M;\r\n  vec3 OT = normalize(T-O);\r\n  M[0] = OT;\r\n  M[2] = normalize(vec3(0.0, 0.0, 1.0)-OT.z*OT)/d;\r\n  M[1] = cross(M[2], OT);\r\n  return M;\r\n}\r\n\r\n// --- ray -  ellipsoid intersection\r\n// if true, return P,N and thickness l\r\nbool intersectEllipsoid(vec3 R, vec3 O, vec3 D, out vec3 P, out vec3 N, out float l) {\r\n  vec3 OR = O/R, DR = D/R; // to space where ellipsoid is a sphere\r\n// P=O+tD & |P|=1 -> solve t in O^2 + 2(O.D)t + D^2.t^2 = 1\r\n  float OD = dot(OR,DR), OO = dot(OR,OR), DD = dot(DR,DR);\r\n  float d = OD*OD - (OO-1.0)*DD;\r\n\r\n  if (!((d >= 0.0) && (OD < 0.0) && (OO > 1.0))) return false;\r\n// ray intersects the ellipsoid (and not in our back)\r\n// note that t>0 <=> -OD>0 &  OD^2 > OD^-(OO-1.0)*DD -> |O|>1\r\n\r\n  float t = (-OD-sqrt(d))/DD;\r\n// return intersection point, normal and distance\r\n  P = O + t*D;\r\n  N = normalize(P/(R*R));\r\n  l = 2.0 * sqrt(d)/DD;\r\n\r\n  return true;\r\n}\r\n\r\n// --- Gardner textured ellipsoids (sort of)\r\n// 's' index corresponds to Garner faked silhouette\r\n// 't' index corresponds to interior term faked by mid-surface\r\n\r\n// float ks, ps, ki, pi; // smoothness/thickness parameters\r\n// float l;\r\n\r\nvoid drawObj(vec3 O, mat3 M, vec2 pos, int mode, inout vec3 color) {\r\n  vec3 R = vec3(3.0*cDepth, 3.0*cWidth, 3.0*cHeight);\r\n  vec3 D = normalize(M*vec3(1.0,pos)); // ray\r\n  vec3 L = normalize(vec3(cLightX, cLightY, cLightZ));\r\n\r\n  vec3 P, N; float l;\r\n  if (!intersectEllipsoid(R, O, D, P, N, l)) return;\r\n\r\n  vec3 Pm = P + 0.5 * l * D; // 0.5: deepest point inside cloud.\r\n  vec3 Nm = normalize(Pm/(R*R)); // it's normal\r\n  vec3 Nn = normalize(P/R);\r\n  float nl = clamp(dot(N,L), 0.0, 1.0) * cIntensity; // ratio of light-facing (for lighting)\r\n  float nd = clamp(-dot(Nn,D), 0.0, 1.0); // ratio of camera-facing (for silhouette)\r\n  float ns = fbm(P), ni = fbm(Pm+10.0);\r\n  float A, l0 = 3.0;\r\n//   l += l*(l/l0-1.0)/(1.0+l*l/(l0*l0)); // optical depth modified at silhouette\r\n  l = clamp(l-6.0*ni, 0.0, 1e10);\r\n  float As = pow(cSmoothness*nd, cSmoothnessPower); // silhouette\r\n  float Ai = 1.0 - pow(cThickness, cThicknessPower*l); // interior\r\n\r\n  As = clamp(As-ns, 0.0, 1.0)*2.0; // As = 2.0*pow(As, 0.6)\r\n  if (mode == 2) {\r\n    A = 1.0 - (1.0 - As)*(1.0 - Ai); // mul Ti and Ts\r\n  } else {\r\n    A = (mode == 0) ? Ai : As;\r\n  }\r\n\r\n  A = clamp(A, 0.0, 1.0);\r\n  nl = 0.8 * (nl + ((mode == 0) ? fbm(Pm-10.0) : fbm(P+10.0)));\r\n\r\n#if 0 // noise bump\r\n  N = normalize(N - 0.1*(dFdx(A)*M[1] + dFdy(A)*M[2])*resolution.y);\r\n  nl = clamp(dot(N,L), 0.0, 1.0);\r\n#endif\r\n\r\n  vec3 col = vec3(mix(nl, 1.0, cAmbient));\r\n  color = mix(color, col, A);\r\n}";

var cloudsFrag = "// https://www.shadertoy.com/view/XslGRr\r\n\r\nvec2 p = (-resolution + 2.0*pin.coord) / resolution.y;\r\nvec2 m = mouse.xy / resolution.xy;\r\nvec3 ro = 4.0*normalize(vec3(sin(3.0*m.x), 0.4*m.y, cos(3.0*m.x)));\r\nvec3 ta = vec3(0.0,-1.0,0.0);\r\nmat3 ca = setCamera(ro, ta, 0.0);\r\nvec3 rd = ca*normalize(vec3(p.xy,1.5));\r\npout.color = render(ro, rd).xyz;";

var cloudsFragPars = "// https://www.shadertoy.com/view/XslGRr\r\n\r\nuniform sampler2D tNoise;\r\n\r\nfloat noise(in vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  vec2 uv = (p.xy + vec2(37.0, 17.0)*p.z) + f.xy;\r\n  uv = (uv+0.5)/256.0;\r\n  uv = vec2(uv.x, -uv.y);\r\n  vec2 rg = texture2D(tNoise, uv).yx;\r\n  return -1.0 + 2.0*mix(rg.x, rg.y, f.z);\r\n}\r\n\r\nfloat map5(in vec3 p) {\r\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\r\n  float f;\r\n  f  = 0.50000*noise(q); q = q*2.02;\r\n  f += 0.25000*noise(q); q = q*2.03;\r\n  f += 0.12500*noise(q); q = q*2.01;\r\n  f += 0.06250*noise(q); q = q*2.02;\r\n  f += 0.03125*noise(q);\r\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\r\n}\r\n\r\nfloat map4(in vec3 p) {\r\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\r\n  float f;\r\n  f  = 0.50000*noise(q); q = q*2.02;\r\n  f += 0.25000*noise(q); q = q*2.03;\r\n  f += 0.12500*noise(q); q = q*2.01;\r\n  f += 0.06250*noise(q);\r\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\r\n}\r\n\r\nfloat map3(in vec3 p) {\r\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\r\n  float f;\r\n  f  = 0.50000*noise(q); q = q*2.02;\r\n  f += 0.25000*noise(q); q = q*2.03;\r\n  f += 0.12500*noise(q);\r\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\r\n}\r\n\r\nfloat map2(in vec3 p) {\r\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\r\n  float f;\r\n  f  = 0.50000*noise(q); q = q*2.02;\r\n  f += 0.25000*noise(q);\r\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\r\n}\r\n\r\nvec3 sundir = normalize(vec3(-1.0, 0.0, -1.0));\r\n\r\nvec4 integrate(in vec4 sum, in float dif, in float den, in vec3 bgcol, in float t) {\r\n// lighting\r\n  vec3 lin = vec3(0.65,0.7,0.75)*1.4 + vec3(1.0,0.6,0.3)*dif;\r\n  vec4 col = vec4(mix(vec3(1.0,0.95,0.8), vec3(0.25,0.3,0.35), den), den);\r\n  col.xyz *= lin;\r\n  col.xyz = mix(col.xyz, bgcol, 1.0-exp(-0.003*t*t));\r\n// front to back blending\r\n  col.a *= 0.4;\r\n  col.rgb *= col.a;\r\n  return sum + col*(1.0-sum.a);\r\n}\r\n\r\n#define MARCH(STEPS,MAPLOD) for(int i=0; i<STEPS; i++) { vec3 pos = ro + t*rd; if (pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99) break; float den = MAPLOD(pos); if (den>0.01) { float dif = clamp((den - MAPLOD(pos+0.3*sundir))/0.6, 0.0, 1.0); sum = integrate(sum, dif, den, bgcol, t); } t += max(0.05, 0.02*t); }\r\n// for (int i=0; i<STEPS; i++) {\r\n//   vec3 pos = ro + t*rd;\r\n//   if (pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99) break;\r\n//   float den = MAPLOD(pos);\r\n//   if (den>0.01) {\r\n//     float dif = clamp((den - MAPLOD(pos+0.3*sundir))/0.6, 0.0, 1.0);\r\n//     sum = integrate(sum, dif, den, bgcol, t);\r\n//   }\r\n//   t += max(0.05, 0.02*t);\r\n// }\r\n\r\nvec4 raymarch(in vec3 ro, in vec3 rd, in vec3 bgcol) {\r\n  vec4 sum = vec4(0.0);\r\n  float t = 0.0;\r\n  MARCH(30,map5);\r\n  MARCH(30,map4);\r\n  MARCH(30,map3);\r\n  MARCH(30,map2);\r\n  return clamp(sum, 0.0, 1.0);\r\n}\r\n\r\nmat3 setCamera(in vec3 ro, in vec3 ta, float cr) {\r\n  vec3 cw = normalize(ta-ro);\r\n  vec3 cp = vec3(sin(cr), cos(cr), 0.0);\r\n  vec3 cu = normalize(cross(cw,cp));\r\n  vec3 cv = normalize(cross(cu,cw));\r\n  return mat3(cu, cv, cw);\r\n}\r\n\r\nvec4 render(in vec3 ro, in vec3 rd) {\r\n// background sky\r\n  float sun = clamp(dot(sundir,rd), 0.0, 1.0);\r\n  vec3 col = vec3(0.6,0.71,0.75) - rd.y*0.2*vec3(1.0,0.5,1.0) + 0.15*0.5;\r\n  col += 0.2*vec3(1.0,0.6,0.1)*pow(sun,8.0);\r\n// clouds\r\n  vec4 res = raymarch(ro, rd, col);\r\n  col = col * (1.0-res.w) + res.xyz;\r\n// sun glare\r\n  col += 0.2*vec3(1.0,0.4,0.2)*pow(sun,3.0);\r\n  return vec4(col, 1.0);\r\n}";

const cloudsUniforms = {
	tNoise: { value: null },
};

const cloudUniforms = {
	cCameraTilt: { value: 0.2 },
	cCameraPan: { value: 0.0 },
	cWidth: { value: 1.0 },
	cHeight: { value: 0.65 },
	cDepth: { value: 0.65 },
	cLightX: { value: -0.4 },
	cLightY: { value: 0.0 },
	cLightZ: { value: 1.0 },
	cIntensity: { value: 1.0 },
	cAmbient: { value: 0.1 },
	cSmoothness: { value: 1.0 },
	cSmoothnessPower: { value: 3.0 },
	cThickness: { value: 0.7 },
	cThicknessPower: { value: 3.0 },
};

var coherentNoiseFrag = "vec2 p = pin.uv * cNoiseFrequency;\r\nfloat period = cNoiseFrequency / max(cRepeat, 1.0);\r\nfloat n = coherentNoise(vec3(p, time), period);\r\nn = mix(n, scaleShift(n, 0.5, 0.5), cScaleShift);\r\nn = coherentBias(n, cBias);\r\nn = coherentGain(n, cGain);\r\nn = pow(abs(n), cPowerExponent) * sign(n);\r\nn = mix(0.0, n, step(cThreshold, abs(n)));\r\nn = mix(n, 1.0 - min(max(n,0.0),1.0), cInvert);\r\npout.color = vec3(n);\r\n\r\nfloat graph = n;";

var coherentNoiseFragPars = "// uniform float cNoiseFrequency;\r\n// uniform float cNoiseAmplitude;\r\n// uniform float cNoisePersistence;\r\n// uniform bool cNoiseSphereEnable;\r\n// uniform bool cNoiseGraphEnable;\r\nuniform float cNoiseLacunarity;\r\nuniform float cGradientNoise;\r\nuniform float cValueNoise;\r\nuniform float cVoronoiNoise;\r\nuniform float cVoronoiCell;\r\nuniform float cSimplexNoise;\r\nuniform float cRepeat;\r\nuniform float cTurbulence;\r\nuniform float cRidge;\r\nuniform float cRidgeOffset;\r\nuniform float cScaleShift;\r\nuniform float cPowerExponent;\r\nuniform float cBias;\r\nuniform float cGain;\r\nuniform float cThreshold;\r\nuniform float cInvert;\r\n\r\nvec2 coherentModulo(vec2 x, float period) {\r\n    if (period > 0.0) {\r\n        return mod(x, period);\r\n    }\r\n\r\n    return x;\r\n}\r\n\r\nvec3 coherentModulo(vec3 x, float period) {\r\n    if (period > 0.0) {\r\n        return mod(x, period);\r\n    }\r\n\r\n    return x;\r\n}\r\n\r\n// Ridged multifractal\r\n// See \"Texturing & Modeling, A Procedural Approach\", Chapter 12\r\nfloat coherentRidge(float h, float offset) {\r\n    h = abs(h);      // create creases\r\n    h = offset - h;  // invert so creases are at top\r\n    h = h * h;       // sharpen creases\r\n    return h;\r\n}\r\n\r\nfloat coherentBias(float x, float bias) {\r\n    if (bias <= -1.) {\r\n        return x;\r\n    }\r\n    bias = bias / (1. + bias);\r\n    return (1. + x) / (1. - bias * (1. - x) * 0.5) - 1.;\r\n}\r\n\r\nfloat coherentGainFunc(float x, float gain) {\r\n    return x * (1. + gain) / (1. + gain - (1. - x) * 2. * gain);\r\n}\r\n\r\nfloat coherentGain(float x, float gain) {\r\n    if (x < 0.0) {\r\n        return -coherentGainFunc(-x, gain);\r\n    } else {\r\n        return coherentGainFunc(x, gain);\r\n    }\r\n}\r\n\r\nfloat coherentPerlinNoise(vec2 st, float period) {\r\n    vec2 i = floor(st);\r\n    vec2 f = fract(st);\r\n    vec2 u = smoothstep(0.0, 1.0, f);\r\n    const vec2 off = vec2(0, 1);\r\n\r\n    vec2 a = random2(coherentModulo(i + off.xx, period));\r\n    vec2 b = random2(coherentModulo(i + off.yx, period));\r\n    vec2 c = random2(coherentModulo(i + off.xy, period));\r\n    vec2 d = random2(coherentModulo(i + off.yy, period));\r\n\r\n    return mix(mix(dot(a, f - off.xx), dot(b, f - off.yx), u.x),\r\n               mix(dot(c, f - off.xy), dot(d, f - off.yy), u.x), u.y);\r\n}\r\n\r\nfloat coherentPerlinNoise(vec3 st, float period) {\r\n    vec3 i = floor(st);\r\n    vec3 f = fract(st);\r\n    vec3 u = smoothstep(0.0, 1.0, f);\r\n    const vec3 off = vec3(0, 1, 0);\r\n\r\n    vec3 a1 = random3(coherentModulo(i + off.xxx, period));\r\n    vec3 a2 = random3(coherentModulo(i + off.yxx, period));\r\n    vec3 b1 = random3(coherentModulo(i + off.xyx, period));\r\n    vec3 b2 = random3(coherentModulo(i + off.yyx, period));\r\n    vec3 c1 = random3(coherentModulo(i + off.xxy, period));\r\n    vec3 c2 = random3(coherentModulo(i + off.yxy, period));\r\n    vec3 d1 = random3(coherentModulo(i + off.xyy, period));\r\n    vec3 d2 = random3(coherentModulo(i + off.yyy, period));\r\n\r\n    return mix(bimix(dot(a1, f - off.xxx), dot(a2, f - off.yxx), dot(b1, f - off.xyx),\r\n                     dot(b2, f - off.yyx), u.x, u.y),\r\n               bimix(dot(c1, f - off.xxy), dot(c2, f - off.yxy), dot(d1, f - off.xyy),\r\n                     dot(d2, f - off.yyy), u.x, u.y),\r\n               u.z);\r\n}\r\n\r\n// 3D Noise based on Morgan McGuire @morgan3d\r\n// https://www.shadertoy.com/view/4dS3Wd\r\n// return: [-1,1]\r\nfloat coherentValueNoise(vec3 st, float period) {\r\n    vec3 i = floor(st);\r\n    vec3 f = fract(st);\r\n    const vec2 off = vec2(0, 1);\r\n\r\n    float a1 = random1(coherentModulo(i + off.xxx, period));\r\n    float a2 = random1(coherentModulo(i + off.yxx, period));\r\n    float b1 = random1(coherentModulo(i + off.xyx, period));\r\n    float b2 = random1(coherentModulo(i + off.yyx, period));\r\n    float c1 = random1(coherentModulo(i + off.xxy, period));\r\n    float c2 = random1(coherentModulo(i + off.yxy, period));\r\n    float d1 = random1(coherentModulo(i + off.xyy, period));\r\n    float d2 = random1(coherentModulo(i + off.yyy, period));\r\n\r\n    vec3 u = smoothstep(0.0, 1.0, f);\r\n    return mix(bimix(a1, a2, b1, b2, u.x, u.y), bimix(c1, c2, d1, d2, u.x, u.y), u.z);\r\n}\r\n\r\nfloat coherentVoronoiNoise(vec3 st, float cell, float period) {\r\n    vec2 i = floor(st.xy);\r\n    vec2 f = fract(st.xy);\r\n\r\n    float m_dist = 10.;\r\n    vec2 m_point;\r\n\r\n    for (int y = -1; y <= 1; y++) {\r\n        for (int x = -1; x <= 1; x++) {\r\n            // Neighbor place in the grid\r\n            vec2 neighbor = vec2(float(x), float(y));\r\n            // Random position from current + neighbor place in the grid\r\n            // vec2 point = random2(i_st + neighbor);\r\n            vec2 point = hash2(coherentModulo(i + neighbor, period));\r\n            // Animate the point\r\n            point = 0.5 + 0.5 * sin(st.z + 6.2831 * point);\r\n            // Vector between the pixel and the point\r\n            vec2 diff = neighbor + point - f;\r\n            // Distance to the point\r\n            float dist = length(diff);\r\n\r\n            // Keep the closer distance\r\n            if (dist < m_dist) {\r\n                m_dist = dist;\r\n                m_point = point;\r\n            }\r\n        }\r\n    }\r\n\r\n    // return mix(m_dist, hash1(m_point), cell);\r\n    float n = mix(m_dist, dot(m_point, vec2(.3, .6)), cell);\r\n    return scaleShift(n, 2.0, -1.0);\r\n}\r\n// https://github.com/ashima/webgl-noise/blob/master/src/psrdnoise2D.glsl\r\n// Copyright (c) 2016 Stefan Gustavson. All rights reserved.\r\nvec2 coherentGrad2(vec2 p, float rot) {\r\n    // For more istorpic gradients, sin/cos can be used instead\r\n    float u = permute(permute(p.x) + p.y) * 0.0243902439 + rot; // Rotate by shift\r\n    u = fract(u) * 6.28318530718;\r\n    return vec2(cos(u), sin(u));\r\n}\r\nfloat coherentSimplexNoise(vec3 st, float period) {\r\n    const vec2 off = vec2(0, 1);\r\n    // Hack: offset y slightly to hide some rare artifacts\r\n    st.y += 0.001;\r\n    // Skew to hexagonal grid\r\n    vec2 uv = vec2(st.x + st.y*0.5, st.y);\r\n    vec2 i = floor(uv);\r\n    vec2 f = fract(uv);\r\n    // Traversal order\r\n    vec2 i1 = (f.x > f.y) ? off.yx : off.xy;\r\n    // Unskewed grid poings in (x,y) space\r\n    vec2 p0 = vec2(i.x - i.y * 0.5, i.y);\r\n    vec2 p1 = vec2(p0.x + i1.x - i1.y * 0.5, p0.y + i1.y);\r\n    vec2 p2 = vec2(p0.x + 0.5, p0.y + 1.0);\r\n    // Integer grid point indices in (u,v) space\r\n    i1 = i + i1;\r\n    vec2 i2 = i + off.yy;\r\n    // Vectors in unskewed (x,y) coordinates from\r\n    // each of the simplex cornerse to the evaluation point\r\n    vec2 d0 = st.xy - p0;\r\n    vec2 d1 = st.xy - p1;\r\n    vec2 d2 = st.xy - p2;\r\n\r\n    // Wrap i, i1, and i2 to the desired period before gradient hasing:\r\n    // wrap points in (x,y), map to (u,v)\r\n    vec3 xw = coherentModulo(vec3(p0.x, p1.x, p2.x), period);\r\n    vec3 yw = coherentModulo(vec3(p0.y, p1.y, p2.y), period);\r\n    vec3 iuw = xw + 0.5 * yw;\r\n    vec3 ivw = yw;\r\n\r\n    // Create gradient from indices\r\n    vec2 g0 = coherentGrad2(vec2(iuw.x, ivw.x), st.z);\r\n    vec2 g1 = coherentGrad2(vec2(iuw.y, ivw.y), st.z);\r\n    vec2 g2 = coherentGrad2(vec2(iuw.z, ivw.z), st.z);\r\n\r\n    // Gradients dot vectors to corresponding corners\r\n    // (The derivatives of this are simply the gradients)\r\n    vec3 w = vec3(dot(g0,d0), dot(g1,d1), dot(g2,d2));\r\n\r\n    // Radial weights from corners\r\n    // 0.8 is the square of 2/sqrt(5), the distance from\r\n    // a grid point to the nearest simplex bounndary\r\n    vec3 t = 0.8 - vec3(dot(d0,d0), dot(d1,d1), dot(d2,d2));\r\n\r\n#if 0 // analytical dervatives\r\n    // Partial derivatives for analytical gradient computation\r\n    vec3 dtdx = -2.0 * vec3(d0.x, d1.x, d2.x);\r\n    vec3 dtdy = -2.0 * vec3(d0.y, d1.y, d2.y);\r\n\r\n    // Set influence of each surflet to zero outside radius sqrt(0.8)\r\n    if (t.x < 0.0) {\r\n        dtdx.x = dtdy.x = 0.0;\r\n        t.x = 0.0;\r\n    }\r\n    if (t.y < 0.0) {\r\n        dtdx.y = dtdy.y = 0.0;\r\n        t.y = 0.0;\r\n    }\r\n    if (t.z < 0.0) {\r\n        dtdx.z = dtdy.z = 0.0;\r\n        t.z = 0.0;\r\n    }\r\n#else\r\n    // Set influence of each surflet to zero outsdie radius sqrt(0.8)\r\n    t = max(t, 0.0);\r\n#endif\r\n\r\n    // Fource power of t (and third power for derivative)\r\n    vec3 t2 = t*t;\r\n    vec3 t4 = t2*t2;\r\n    vec3 t3 = t2*t;\r\n\r\n    // Final noise value is:\r\n    // sum of ((radial weights) times (gradient dot vector from corner))\r\n    float n = dot(t4, w);\r\n\r\n#if 0 // analytical dervatives\r\n    // Final analytical derivatve (gradient of a sum of scalar products)\r\n    vec2 dt0 = vec2(dtdx.x, dtdy.x) * 4.0 * t3.x;\r\n    vec2 dn0 = t4.x * g0 + dt0 * w.x;\r\n    vec2 dt1 = vec2(dtdx.y, dtdy.y) * 4.0 * t3.y;\r\n    vec2 dn1 = t4.y * g1 + dt1 * w.y;\r\n    vec2 dt2 = vec2(dtdx.z, dtdy.z) * 4.0 * t3.z;\r\n    vec2 dn2 = t4.z * g2 + dt2 * w.z;\r\n\r\n    return 11.0 * vec3(n, dn0 + dn1, d2);\r\n#else\r\n    return 11.0 * n;\r\n#endif\r\n}\r\n\r\nvec2 coherentTurbulent(vec2 st, float period, float strength) {\r\n    const vec2 c = vec2(1.0, 0.0);\r\n    const mat2 m = mat2(0.00, 0.80, -0.80, 0.36);\r\n    float dx = coherentPerlinNoise(st+c.xy, period);\r\n    float dy = coherentPerlinNoise(st+c.yx, period);\r\n    vec2 displacement = vec2(dx,dy) * m * strength;\r\n    return st+displacement;\r\n}\r\n\r\nfloat coherentNoiseFunc(vec3 st, float period) {\r\n    float n = 0.0;\r\n    n += coherentPerlinNoise(st, period) * cGradientNoise;\r\n    n += coherentValueNoise(st, period) * cValueNoise;\r\n    n += coherentVoronoiNoise(st, cVoronoiCell, period) * cVoronoiNoise;\r\n    n += coherentSimplexNoise(st, period) * cSimplexNoise;\r\n    return n / max(cGradientNoise+cValueNoise+cVoronoiNoise+cSimplexNoise,0.001);\r\n}\r\n\r\nfloat coherentNoise(vec3 st, float period) {\r\n    // FREQ = 1.0\r\n    // AMPL = 1.0\r\n    // LACU = 2.0\r\n    // GAIN = pow(2.0, -0.5);\r\n    float amplitude = cNoiseAmplitude;\r\n    float frequency = 1.0;\r\n    float value = 0.0;\r\n    float turbulence = 2.0;\r\n    for (int i = 0; i < NOISE_OCTAVE_MAX; i++) {\r\n        if (i >= cNoiseOctave) break;\r\n        vec3 p = frequency * st;\r\n        p.xy = mix(p.xy, coherentTurbulent(p.xy, period, turbulence), cTurbulence);\r\n        float t = coherentNoiseFunc(p, period);\r\n        t = mix(t, coherentRidge(t, cRidgeOffset), cRidge);\r\n        value += amplitude * t;\r\n        frequency *= cNoiseLacunarity;\r\n        amplitude *= cNoisePersistence;\r\n        period *= cNoiseLacunarity;\r\n        turbulence += 0.01;\r\n    }\r\n    return value;\r\n}";

const coherentNoiseUniforms = {
	cRepeat: { value: 1.0 },
	cNoiseLacunarity: { value: 2.0 },
	cGradientNoise: { value: 0.0 },
	cValueNoise: { value: 0.0 },
	cVoronoiNoise: { value: 0.0 },
	cSimplexNoise: { value: 1.0 },
	cTurbulence: { value: 0.0 },
	cRidge: { value: 0.0 },
	cRidgeOffset: { value: 0.9 },
	cVoronoiCell: { value: 0.0 },
	cScaleShift: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
	cBias: { value: 0.0 },
	cGain: { value: 0.0 },
	cThreshold: { value: 0.0 },
	cInvert: { value: 0.0 }
};

var color = "float rgb2gray(vec3 c) {\r\n  return dot(c, vec3(0.3, 0.59, 0.11));\r\n}\r\n\r\n\r\nfloat rgb2l(vec3 c) {\r\n  float fmin = min(min(c.r, c.g), c.b);\r\n  float fmax = max(max(c.r, c.g), c.b);\r\n  return (fmax + fmin) * 0.5; // Luminance\r\n}\r\n\r\n\r\n// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m\r\nvec3 rgb2hsl(vec3 c) {\r\n  vec3 hsl;\r\n  float fmin = min(min(c.r, c.g), c.b);\r\n  float fmax = max(max(c.r, c.g), c.b);\r\n  float delta = fmax - fmin;\r\n\r\n  hsl.z = (fmax + fmin) * 0.5; // Luminance\r\n\r\n  if (delta == 0.0) {  // This is a gray, no chroma...\r\n    hsl.x = 0.0; // Hue\r\n    hsl.y = 0.0; // Saturation\r\n  } else { // Chromatic data...\r\n    if (hsl.z < 0.5) {\r\n      hsl.y = delta / (fmax + fmin); // Saturation\r\n    } else {\r\n      hsl.y = delta / (2.0 - fmax - fmin); // Saturation\r\n    }\r\n\r\n    float deltaR = (((fmax - c.r) / 6.0) + (delta / 2.0)) / delta;\r\n    float deltaG = (((fmax - c.g) / 6.0) + (delta / 2.0)) / delta;\r\n    float deltaB = (((fmax - c.b) / 6.0) + (delta / 2.0)) / delta;\r\n\r\n    if (c.r == fmax) {\r\n      hsl.x = deltaB - deltaG; // Hue\r\n    } else if (c.g == fmax) {\r\n      hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\r\n    } else if (c.b == fmax) {\r\n      hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\r\n    }\r\n\r\n    if (hsl.x < 0.0) {\r\n      hsl.x += 1.0; // Hue\r\n    } else if (hsl.x > 1.0) {\r\n      hsl.x -= 1.0; // Hue\r\n    }\r\n  }\r\n  return hsl;\r\n}\r\n\r\n\r\nfloat hue2rgb(float f1, float f2, float hue) {\r\n  if (hue < 0.0) {\r\n    hue += 1.0;\r\n  } else if (hue > 1.0) {\r\n    hue -= 1.0;\r\n  }\r\n  float res;\r\n  if ((6.0*hue) < 1.0) {\r\n    res = f1 + (f2-f1) * 6.0 * hue;\r\n  } else if ((2.0 * hue) < 1.0) {\r\n    res = f2;\r\n  } else if ((3.0 * hue) < 2.0) {\r\n    res = f1 + (f2-f1) * ((2.0/3.0) - hue) * 6.0;\r\n  } else {\r\n    res = f1;\r\n  }\r\n  return res;\r\n}\r\n\r\n\r\nvec3 hsl2rgb(vec3 hsl) {\r\n  vec3 rgb;\r\n  if (hsl.y == 0.0) {\r\n    rgb = vec3(hsl.z); // Luminace\r\n  } else {\r\n    float f2;\r\n    if (hsl.z < 0.5) {\r\n      f2 = hsl.z * (1.0 + hsl.y);\r\n    } else {\r\n      f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\r\n    }\r\n    float f1 = 2.0 * hsl.z - f2;\r\n    rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));\r\n    rgb.g = hue2rgb(f1, f2, hsl.x);\r\n    rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));\r\n  }\r\n  return rgb;\r\n}\r\n\r\n\r\nvec3 hsv2rgb(vec3 c) {\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}";

var colorBalanceFrag = "// http://stackoverflow.com/questions/23213925/interpreting-color-function-and-adjusting-pixels-values\r\n// https://gist.github.com/liovch/3168961\r\n// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m\r\nvec4 texel = texture2D(tDiffuse, pin.uv);\r\n\r\nfloat lightness = rgb2l(texel.rgb);\r\n\r\nconst float a = 0.25;\r\nconst float b = 0.333;\r\nconst float scale = 0.7;\r\n\r\nfloat c1 = clamp((lightness - b) / -a + 0.5, 0.0, 1.0);\r\nfloat c2 = clamp((lightness - b) / a + 0.5, 0.0, 1.0);\r\nfloat c3 = clamp((lightness + b - 1.0) / -a + 0.5, 0.0, 1.0);\r\nfloat c4 = clamp((lightness + b - 1.0) / a + 0.5, 0.0, 1.0);\r\nvec3 shadows = cColorBalanceShadows * (c1 * scale);\r\nvec3 midtones = cColorBalanceMidtones * (c2 * c3 * scale);\r\nvec3 highlights = cColorBalanceHighlights * (c4 * scale);\r\n\r\nvec3 newColor = texel.rgb + shadows + midtones + highlights;\r\nnewColor = clamp(newColor, 0.0, 1.0);\r\n\r\nif (cColorBalancePreserveLuminosity) {\r\n  vec3 newHSL = rgb2hsl(newColor);\r\n  pout.color = hsl2rgb(vec3(newHSL.x, newHSL.y, lightness));\r\n} else {\r\n  pout.color = newColor.xyz;\r\n}\r\npout.opacity = texel.w;";

var colorBalanceFragPars = "uniform vec3 cColorBalanceShadows;\r\nuniform vec3 cColorBalanceMidtones;\r\nuniform vec3 cColorBalanceHighlights;\r\nuniform bool cColorBalancePreserveLuminosity;";

const colorBalanceUniforms = {
	// x: cyan red, y: magenta green, z: yellow blue, w: tone
	cColorBalanceShadows: { value: new THREE$1.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalanceMidtones: { value: new THREE$1.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalanceHighlights: { value: new THREE$1.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalancePreserveLuminosity: { value: false },
};

var common = "precision highp float;\r\nprecision highp int;\r\n#define PI 3.14159265359\r\n#define PI2 6.28318530718\r\n#define INV_PI 0.31830988618\r\n#define INV_PI2 0.15915494\r\n#define LOG2 1.442695\r\n#define EPSILON 1e-6\r\n\r\n// handy value clamping to 0 - 1 range\r\n// #define saturate(a) clamp(a, 0.0, 1.0)\r\n#ifndef saturate\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n#endif\r\n#define whiteCompliment(a) (1.0 - saturate(a))\r\n\r\nfloat pow2(const in float x) { return x*x; }\r\nfloat pow3(const in float x) { return x*x*x; }\r\nfloat pow4(const in float x) { float x2 = x*x; return x2*x2; }\r\nfloat pow5(const in float x) { float x2 = x*x; return x2*x2*x; }\r\nfloat averate(const in vec3 color) { return dot(color, vec3(0.3333)); }\r\n\r\nmat2 rotate2d(float angle) {\r\n  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\r\n}\r\n\r\nstruct PSInput {\r\n  vec2 position;\r\n  vec2 mouse;\r\n  vec2 coord;\r\n  vec2 uv;\r\n};\r\n\r\nstruct PSOutput {\r\n  vec3 color;\r\n  float opacity;\r\n};\r\n";

var coneFrag = "vec2 n = normalize(cDirection);\r\nfloat len = length(cDirection);\r\nvec2 pos = pin.position - (-cDirection);\r\nfloat t = (dot(pos, n) * 0.5) / len;\r\n// t /= (length(pin.position) * len * 0.5);\r\nt /= (length(pos) * len * 0.5);\r\nt = pow(abs(t), cPowerExponent);\r\npout.color = vec3(t);";

var coneFragPars = "uniform vec2 cDirection;\r\nuniform float cPowerExponent;";

const coneUniforms = {
	cDirection: { value: new THREE$1.Vector2( 0.0, 1.0 ) },
	cPowerExponent: { value: 1.0 },
};

var copyFrag = "vec4 texel = texture2D(tDiffuse, pin.uv);\r\npout.color = texel.rgb;\r\npout.opacity = texel.a;";

var coronaFrag = "// https://www.shadertoy.com/view/XdV3DW by vamoss\r\n\r\nif (length(pin.position) < cRadius) {\r\n  pout.color = vec3(0.0);\r\n} else {\r\n  pout.color = burn(pin.position, cSize);\r\n}";

var coronaFragPars = "// https://www.shadertoy.com/view/XdV3DW by vamoss\r\n\r\nuniform float cIntensity;\r\nuniform float cRadius;\r\nuniform float cSize;\r\n\r\nfloat noise(vec3 uv, float res) {\r\n\tconst vec3 s = vec3(1e0, 1e2, 1e3);\r\n\tuv *= res;\r\n\tvec3 uv0 = floor(mod(uv, res))*s;\r\n\tvec3 uv1 = floor(mod(uv+1., res))*s;\r\n\tvec3 f = fract(uv); \r\n\tf = f*f*(3.0-2.0*f);\r\n\tvec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,\r\n\t              uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);\r\n\tvec4 r = fract(sin(v*1e-1)*1e3);\r\n\tfloat r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);\r\n\tr = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);\r\n\tfloat r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);\r\n\treturn mix(r0, r1, f.z)*2.-1.;\r\n}\r\n\r\nvec3 burn(vec2 p, float size) {\r\n  float c1 = size * 4.0 - 3.0 * length(2.5 * p);\r\n  vec3 coord = vec3(atan(p.x, p.y) / PI2 + 0.5, length(p) * 0.4, 0.5);\r\n  for (int i=0; i<=3; i++) {\r\n    float power = exp2(float(i));\r\n    c1 += 0.2 * (1.5 / power) * noise(coord + vec3(0.0, -time*0.05, -time*0.01), power*16.0);\r\n  }\r\n  c1 *= cIntensity;\r\n  return vec3(c1);\r\n}";

const coronaUniforms = {
	cIntensity: { value: 1.0 },
	cRadius: { value: 0.3 },
	cSize: { value: 1.0 },
};

var crossFrag = "// https://www.shadertoy.com/view/ls3GRS\r\nfloat minBright = 0.01;\r\nfloat maxBright = 0.04;\r\nfloat magnitude = (minBright + abs(sin(time) * (maxBright - minBright)));\r\n\r\nvec2 dist = abs(pin.position);\r\nfloat longDist = max(dist.x, dist.y);\r\ndist += longDist / 40.0 * (1.0 - cIntensity) * 10.0;\r\nvec2 uv = magnitude / dist;\r\n\r\nfloat t = (uv.x + uv.y) / 2.0;\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var crossFragPars = "uniform float cIntensity;\r\nuniform float cPowerExponent;";

const crossUniforms = {
	cIntensity: { value: 0.4 },
	cPowerExponent: { value: 1.0 },
};

var derivatives = "#extension GL_OES_standard_derivatives : enable\r\n";

var diamondGearFrag = "float g0 = gear(pin.position * mix(8.0, 1.0, cScale), cDiamondGearTeeth, time*0.1);\r\n// float g1 = gear(pin.position*4.0-vec2(2.85,0.0), 9.0, -time*0.2);\r\n// float g3 = gear(pin.position*3.0+vec2(2.35,0.0), 12.0, -time*0.15+0.125);\r\n// float sd = min(min(g0,g1),g3);\r\n// float val = smoothstep(0.0, 0.01, sd);\r\nfloat val = smoothstep(0.0, 0.01, g0);\r\npout.color = vec3(clamp(1.0 - 1.0*val, 0.0, 1.0));";

var diamondGearFragPars = "uniform float cScale;\r\nuniform float cWidth;\r\nuniform float cRadius;\r\nuniform float cDiamondGearTeeth;\r\nuniform float cDiamondGearMid;\r\n\r\nvec2 sd_line(vec2 pos, vec2 a, vec2 b) {\r\n  pos -= a;\r\n  vec2 d = b-a;\r\n  float l = length(d);\r\n  d /= l;\r\n  \r\n  float t = dot(d,pos);\r\n  vec2 p = d * clamp(t, 0.0, l);\r\n  vec2 perp = vec2(d.y, -d.x);\r\n  \r\n  return vec2(length(pos-p), dot(pos,perp));\r\n}\r\n\r\nfloat abs_min(float a, float b) {\r\n  return abs(a) < abs(b) ? a : b;\r\n}\r\n\r\nvec2 lmin(vec2 a, vec2 b) {\r\n  if (abs(a.x-b.x) < 0.0001) {\r\n    return a.y > b.y ? a : b;\r\n  }\r\n  return a.x < b.x ? a : b;\r\n}\r\n\r\nfloat to_sd(vec2 x) {\r\n  return x.x * sign(x.y);\r\n}\r\n\r\nfloat sd_diamond(vec2 pos, vec2 tail, vec2 tip, float width, float mid) {\r\n  vec2 d = tip-tail;\r\n  vec2 p = vec2(d.y,-d.x) * width * 0.5;\r\n  vec2 m = d*mid + tail;\r\n  vec2 la = sd_line(pos, tail, m+p);\r\n  vec2 lb = sd_line(pos, m+p, tip);\r\n  vec2 lc = sd_line(pos, tip, m-p);\r\n  vec2 ld = sd_line(pos, m-p, tail);\r\n  return to_sd(lmin(lmin(la,lb), lmin(lc,ld)));\r\n}\r\n\r\nvec2 to_polar(vec2 x) {\r\n  return vec2(length(x), atan(-x.y,-x.x) + 3.14159);\r\n}\r\n\r\nvec2 from_polar(vec2 x) {\r\n  return vec2(cos(x.y), sin(x.y)) * x.x;\r\n}\r\n\r\nvec2 radial_repeat(vec2 pos, float count) {\r\n  float offset = 0.5/count;\r\n  pos = to_polar(pos);\r\n  pos.y /= 2.0*3.14159;\r\n  pos.y += offset;\r\n  pos.y *= count;\r\n  pos.y = fract(pos.y);\r\n  pos.y /= count;\r\n  pos.y -= offset;\r\n  pos.y *= 2.0*3.14159;\r\n  pos = from_polar(pos);\r\n  return pos;\r\n}\r\n\r\nvec2 rotate(vec2 pos, float turns) {\r\n  pos = to_polar(pos);\r\n  pos.y += turns * 2.0 * 3.14159;\r\n  return from_polar(pos);\r\n}\r\n\r\nfloat gear(vec2 uv, float teeth, float turns) {\r\n  uv = rotate(uv, turns);\r\n  uv = radial_repeat(uv, teeth);\r\n  return sd_diamond(uv, vec2(0.0+cRadius,0.0), vec2(1.0,0.0), cWidth/teeth, cDiamondGearMid);\r\n}\r\n";

const diamondGearUniforms = {
	cScale: { value: 1.0 },
	cWidth: { value: 4.0 },
	cRadius: { value: 0.05 },
	cDiamondGearMid: { value: 0.8 },
	cDiamondGearTeeth: { value: 18.0 },
};

var displacementFrag = "pout.color = vec3(displacement);";

var displacementFragPars = "varying float displacement;";

const displacementUniforms = {
	tDisplacement: { value: null },
};

var displacementVert = "// attribute vec3 position;\r\n// attribute vec3 normal;\r\n// attribute vec3 uv;\r\nvarying float displacement;\r\nuniform sampler2D tDisplacement;\r\nvoid main() {\r\n  displacement = texture2D(tDisplacement, uv).x;\r\n  vec3 transformed = position + normal * displacement * 0.1;\r\n//   vec3 transformed = position;\r\n  vec4 hpos = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);\r\n  gl_Position = hpos;\r\n}";

var electricFrag = "float pauseFreq = cFrequency;\r\nfloat pauseScale = 1.0;\r\nfloat scaledTime = time * 0.5;\r\nscaledTime += 0.05 * pin.uv.x;\r\nfloat sinTime = sin(pauseFreq*scaledTime);\r\nfloat sinTimeOffset = sin(pauseFreq*scaledTime - 0.5*3.141);\r\nfloat timeStep = scaledTime + pauseScale * (sinTime/pauseFreq);\r\n\r\nvec2 p = pin.uv;\r\nvec4 c;\r\n\r\np *= 4.0;\r\np.x = 0.5 - timeStep*3.0;\r\np.y = 0.5 - timeStep*3.0;\r\nc = voronoi(p);\r\n\r\nfloat cellPos = (p.y+c.z) + timeStep * 3.0;\r\nvec2 uv = pin.uv;\r\nuv.x += 1.5*(2.0*c.x-0.33) * (uv.y-0.5);\r\nuv.x *= cScale;\r\n\r\np = uv;\r\np.y = max(p.y, 0.5);\r\np *= 12.0; // higher values zoom out further - don't go too high or the sine waves will become quite obvious...\r\np.x += timeStep*16.0;\r\np.y += timeStep*32.0;\r\nc = voronoi(p);\r\n\r\n// pout.color = 0.5*vec4(c.x);\r\n\r\nfloat d= 0.0;\r\nfloat edgeScale = 1.0-2.0*abs(pin.uv.x-0.5);\r\nfloat scaleMulti = pow(0.5*sinTime + 0.5, 2.0);\r\nfloat dScale = 2.0*edgeScale*(0.25+0.75*pow(0.5*sinTimeOffset+0.5,2.0));\r\n\r\np.y = 0.5*12.0 - timeStep*6.0;\r\nc = dScale * voronoi(p);\r\nd = (uv.y + c.x-0.75);\r\n\r\np.x = uv.x*12.0 - timeStep*6.0;\r\np.y = 4.5*12.0 - timeStep*3.0;\r\nc = dScale*voronoi(p);\r\nd = mix(d, (uv.y-c.x-0.25), 0.5);\r\nd = 1.0-abs(d);\r\n\r\n// pout.color = vec3(d);\r\n\r\nfloat lineWidth = d+0.025*scaleMulti*edgeScale;\r\nvec4 outcolor = mix(vec4(0,1,1.5,1), vec4(1,2,2.0,1), scaleMulti)*smoothstep(1.0, 1.005, lineWidth);\r\noutcolor += edgeScale*pow(scaleMulti*smoothstep(0.75, 1.005, lineWidth), 16.0) * 0.5*vec4(.8,1,2.0,1);\r\noutcolor += 0.5*vec4(.1, 0.05, 0.2, 1);\r\n\r\npout.color = outcolor.xyz;";

var electricFragPars = "uniform float cFrequency;\r\nuniform float cScale;\r\n\r\nvec4 voronoi(in vec2 x) {\r\n    vec2 n = floor(x);\r\n    vec2 f = fract(x);\r\n    vec2 o;\r\n    // first pass: regular voronoi\r\n    vec2 mg, mr;\r\n    float oldDist;\r\n\r\n    float md = 8.0;\r\n    for (int j=-1;j<=1; j++) {\r\n        for (int i=-1; i<=1; i++) {\r\n            vec2 g = vec2(float(i), float(j));\r\n            o = hash2(n+g);\r\n            vec2 r = g + o - f;\r\n            float d = dot(r,r);\r\n            if (d<md) {\r\n                md = d;\r\n                mr = r;\r\n                mg = g;\r\n            }\r\n        }\r\n    }\r\n\r\n    oldDist = md;\r\n\r\n    // second pass: distance to borders\r\n    md = 8.0;\r\n    for (int j=-2;j<=2; j++) {\r\n        for (int i=-2; i<=2; i++) {\r\n            vec2 g = vec2(float(i), float(j));\r\n            o = hash2(n+g);\r\n            vec2 r = g + o - f;\r\n            if (dot(mr-r,mr-r)>0.0001) {\r\n                md = min(md, dot(0.5*(mr+r), normalize(r-mr)));\r\n            }\r\n        }\r\n    }\r\n\r\n    return vec4(md, mr, oldDist);\r\n}";

const electricUniforms = {
	cFrequency: { value: 20.0 },
	cScale: { value: 0.25 },
};

var energyFrag = "vec2 uv = pin.position;\r\nvec3 ro = vec3(uv, sin(time)*2.0-mix(100.0, 20.0, cScale));\r\nvec3 rd = vec3(uv, 1.0);\r\nvec3 mp = ro;\r\nfloat shade = 0.0;\r\nconst vec4 shadow = vec4(0.3);\r\nfloat t = time;\r\nfloat cnt = 0.0;\r\nfor (int i=0; i<50; ++i) {\r\n  float md = map(mp);\r\n  if (md < 0.0001) {\r\n    break;\r\n  }\r\n  mp += rd*md*mix(2.0, 0.25, cDensity);\r\n  cnt += 1.0;\r\n}\r\n\r\nif (length(mp) > mix(10.0, 20.0, cThickness)) {\r\n  pout.color = vec3(0.0);\r\n} else {\r\n  float r = cnt/50.0;\r\n  vec3 col = vec3(hsv(vec3(st(length(mp)*0.01-time*0.2,6.0), 0.8, 1.0)));\r\n  col *= 1.0 - r*(1.0-r)*-1.0;\r\n  col *= length(mp-ro)*0.02;\r\n  col = 1.0 - col;\r\n  float gray = rgb2gray(col);\r\n  pout.color = mix(vec3(gray), col, cColor);\r\n}";

var energyFragPars = "// https://www.shadertoy.com/view/XdjcWc\r\nuniform float cPower;\r\nuniform float cDensity;\r\nuniform float cThickness;\r\nuniform float cScale;\r\nuniform float cFrequency;\r\nuniform float cColor;\r\n\r\n#define TAU 6.2831853\r\n\r\nfloat hlx(vec3 p) {\r\n  float m = TAU/mix(1.0, 5.0, cPower);\r\n  float t = time;\r\n  float a = mod(atan(p.y, p.x) - p.z*mix(0.5,1.5,cFrequency)+t, m) - 0.5*m;\r\n  float l = length(p.xy);\r\n  float r = 0.1 + 0.2 * (sin(abs(p.z*4.0) + t*4.0) * 0.5 + 0.5);\r\n  return length(vec2(a*l,length(p.xy) - (0.5+abs(p.z)*2.0)*(1.0 + sin(abs(p.z)-t*10.0)*0.5+0.5)*0.2))-r;\r\n}\r\n\r\nvec3 hsv(vec3 c) {\r\n  vec4 k = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx+k.xyz)*6.0-k.www);\r\n  return c.z * mix(k.xxx, clamp(p-k.xxx, 0.0, 1.0), c.y);\r\n}\r\n\r\nfloat map(vec3 p) {\r\n  p.xy *= rotate2d(time*0.3 + length(p)*0.05);\r\n  p.yz *= rotate2d(time*0.5);\r\n  p.xz *= rotate2d(time*0.7);\r\n  float d = min(min(hlx(p.xyz), hlx(p.yzx)), hlx(p.zxy))*(1.0 + sin(length(p*1.0)-time*4.0)*0.8);\r\n  vec3 n = normalize(sign(p));\r\n  float d2 = max(length(max(abs(p)-vec3(1.0), 0.0)), dot(p,n)-2.3);\r\n  return d;//min(d,d2);\r\n}\r\n\r\nfloat st(float x, float m) { return floor(x*m)/m; }\r\n";

const energyUniforms = {
	cPower: { value: 1.0 },
	cDensity: { value: 1.0 },
	cThickness: { value: 1.0 },
	cScale: { value: 1.0 },
	cFrequency: { value: 0.0 },
	cColor: { value: 1.0 },
};

var explosion2Frag = "// port from https://www.shadertoy.com/view/lsySzd\r\n// \"Volumetric explosion\" by Duke\r\n//-------------------------------------------------------------------------------------\r\n// Based on \"Supernova remnant\" (https://www.shadertoy.com/view/MdKXzc) \r\n// and other previous shaders \r\n// otaviogood's \"Alien Beacon\" (https://www.shadertoy.com/view/ld2SzK)\r\n// and Shane's \"Cheap Cloud Flythrough\" (https://www.shadertoy.com/view/Xsc3R4) shaders\r\n// Some ideas came from other shaders from this wonderful site\r\n// Press 1-2-3 to zoom in and zoom out.\r\n// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License\r\n//-------------------------------------------------------------------------------------\r\n  \r\n// ro: ray origin\r\n// rd: direction of the ray\r\nvec3 rd = normalize(vec3((pin.coord.xy - 0.5*resolution.xy) / resolution.y, 1.0));\r\nvec3 ro = vec3(0.0, 0.0, -6.0);\r\n\r\n#ifdef DITHERING\r\nvec2 seed = pin.uv + fract(time);\r\n#endif\r\n\r\n// ld, td: local, total density\r\n// w: weighting factor\r\nfloat ld = 0.0, td = 0.0, w = 0.0;\r\n\r\n// t: length of the ray\r\n// d: distance function\r\nfloat d = 1.0, t = 0.0;\r\n\r\nconst float h = 0.1;\r\nvec4 sum = vec4(0.0);\r\nfloat min_dist = 0.0, max_dist = 0.0;\r\n\r\nif (raySphereIntersect(ro, rd, min_dist, max_dist)) {\r\n  t = min_dist * step(t, min_dist);\r\n  for (int i=0; i<86; i++) {\r\n\r\n    vec3 pos = ro + t*rd;\r\n\r\n    if (td > 0.9 || d < 0.12*t || t > 10.0 || sum.a > 0.99 || t > max_dist) break;\r\n\r\n    float d = map(pos);\r\n    d = abs(d) + 0.07;\r\n     // change this starting to control density\r\n    d = max(d, 0.03);\r\n\r\n     // point light calculations\r\n    vec3 ldst = vec3(0.0) - pos;\r\n    float lDist = max(length(ldst), 0.001);\r\n\r\n     // the color of light\r\n    vec3 lightColor = vec3(1.0, 0.5, 0.25);\r\n//     sum.rgb += (lightColor / exp(lDist*lDist*lDist*0.08)/30.0);// bloom\r\n    sum.rgb += (lightColor / exp(lDist*lDist*lDist*0.15)/(30.0 - 20.0 * cBloom));// bloom\r\n\r\n    if (d < h) {\r\n       // compute local density\r\n      ld = h - d;\r\n       // compute weighting factor\r\n      w = (1.0 - td) * ld;\r\n       // accumulate density\r\n      td += w + 1.0 / 200.0;\r\n\r\n      vec4 col = vec4(computeColor(td, lDist), td);\r\n       // emission\r\n      sum += sum.a * vec4(sum.rgb, 0.0) * cEmission / lDist;\r\n       // uniform scale density\r\n      col.a *= 0.2;\r\n       // colour by alpha\r\n      col.rgb *= col.a;\r\n       // alpha blend in contribution\r\n      sum = sum + col*(1.0 - sum.a);\r\n    }\r\n\r\n    td += 1.0 / 70.0;\r\n\r\n    #ifdef DITHERING\r\n    d = abs(d) * (0.8 + 0.2*rand2(seed*vec2(i)*0.123));\r\n    #endif\r\n     // trying to optimize step size\r\n//     t += max(d*0.25, 0.01);\r\n    t += max(d * 0.08 * max(min(length(ldst), d), 2.0), 0.01);\r\n  }\r\n// simple scattering\r\n//   sum *= 1.0 / exp(ld * 0.2) * 0.9;\r\n  sum *= 1.0 / exp(ld * 0.2) * 0.8;\r\n  sum = clamp(sum, 0.0, 1.0);\r\n  sum.xyz = sum.xyz * sum.xyz * (3.0 - 2.0 * sum.xyz);\r\n}\r\n\r\nvec3 gray = vec3(rgb2gray(sum.xyz));\r\nsum.xyz = mix(gray, sum.xyz, cColor);\r\n\r\n#ifdef TOENMAPPING\r\npout.color = toneMapFilmicALU(sum.xyz*2.02);\r\n#else\r\npout.color = sum.xyz;\r\n#endif";

var explosion2FragPars = "// port from https://www.shadertoy.com/view/lsySzd\r\n// \"Volumetric explosion\" by Duke\r\n//-------------------------------------------------------------------------------------\r\n// Based on \"Supernova remnant\" (https://www.shadertoy.com/view/MdKXzc) \r\n// and other previous shaders \r\n// otaviogood's \"Alien Beacon\" (https://www.shadertoy.com/view/ld2SzK)\r\n// and Shane's \"Cheap Cloud Flythrough\" (https://www.shadertoy.com/view/Xsc3R4) shaders\r\n// Some ideas came from other shaders from this wonderful site\r\n// Press 1-2-3 to zoom in and zoom out.\r\n// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License\r\n//-------------------------------------------------------------------------------------\r\n\r\nuniform float cCameraPan;\r\nuniform float cExplosionSpeed;\r\nuniform float cExplosionDensity;\r\nuniform float cEmission;\r\nuniform float cBloom;\r\nuniform float cColor;\r\n\r\n// #define DITHERING\r\n// #define TOENMAPPING\r\n\r\n#define R(p, a) p=cos(a)*p + sin(a)*vec2(p.y,-p.x)\r\n\r\nvec3 hash(vec3 p) {\r\n  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),\r\n           dot(p, vec3(269.5, 183.3, 246.1)),\r\n           dot(p, vec3(113.5, 271.9, 124.6)));\r\n  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);\r\n}\r\n\r\nfloat noise(in vec3 p) {\r\n  vec3 i = floor(p);\r\n  vec3 f = fract(p);\r\n  vec3 u = f*f*(3.0-2.0*f);\r\n  return mix(mix(mix(dot(hash(i + vec3(0.0,0.0,0.0)), f-vec3(0.0,0.0,0.0)),\r\n                     dot(hash(i + vec3(1.0,0.0,0.0)), f-vec3(1.0,0.0,0.0)), u.x),\r\n                 mix(dot(hash(i + vec3(0.0,1.0,0.0)), f-vec3(0.0,1.0,0.0)),\r\n                     dot(hash(i + vec3(1.0,1.0,0.0)), f-vec3(1.0,1.0,0.0)), u.x), u.y),\r\n             mix(mix(dot(hash(i + vec3(0.0,0.0,1.0)), f-vec3(0.0,0.0,1.0)),\r\n                     dot(hash(i + vec3(1.0,0.0,1.0)), f-vec3(1.0,0.0,1.0)), u.x),\r\n                 mix(dot(hash(i + vec3(0.0,1.0,1.0)), f-vec3(0.0,1.0,1.0)),\r\n                     dot(hash(i + vec3(1.0,1.0,1.0)), f-vec3(1.0,1.0,1.0)), u.x), u.y), u.z);\r\n}\r\n\r\nfloat fbm(vec3 p) {\r\n  return noise(p*0.6125)*0.5 + noise(p*0.125)*0.25 + noise(p*0.25)*0.125 + noise(p*0.4)*0.2;\r\n}\r\n\r\nfloat sphere(vec3 p, float r) {\r\n  return length(p)-r;\r\n}\r\n\r\n//==============================================================\r\n// otaviogood's noise from https://www.shadertoy.com/view/ld2SzK\r\n//--------------------------------------------------------------\r\n// This spiral noise works by successively adding and rotating sin waves while increasing frequency.\r\n// It should work the same on all computers since it's not based on a hash function like some other noises.\r\n// It can be much faster than other noise functions if you're ok with some repetition.\r\nconst float nudge = 4.0; // size of perpendicular vector\r\nfloat normalizer = 1.0 / sqrt(1.0 + nudge*nudge); // pythagorean theorem on that perpendicular to maintain scale\r\nfloat spiralNoiseC(vec3 p) {\r\n  float n = -mod(time * 0.8 * cExplosionSpeed, -2.1); // noise amount\r\n  float iter = 2.0;\r\n  for (int i=0; i<8; i++) {\r\n     // add sin and cos scaled inverse with the frequency\r\n    n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter; // abs for a ridged look\r\n     // rotate by adding perpendicular and scaling down\r\n    p.xy += vec2(p.y, -p.x) * nudge;\r\n    p.xy *= normalizer;\r\n     // rotate on other axis\r\n    p.xz += vec2(p.z, -p.x) * nudge;\r\n    p.xz *= normalizer;\r\n     // increase the frequency\r\n    iter *= 1.733733;\r\n  }\r\n  return n;\r\n}\r\n\r\nfloat volumetricExplosion(vec3 p) {\r\n  float final = sphere(p, 4.0);\r\n//   final += expNoise(p*12.5)*0.2;\r\n  final += fbm(p*50.0 * cExplosionDensity);\r\n  final += spiralNoiseC(p.zxy*0.4132+333.0)*3.0; // 1.25\r\n  return final;\r\n}\r\n\r\nfloat map(vec3 p) {\r\n//   R(p.xz, mouse.x * 0.008 * PI * time*0.1);\r\n  R(p.xz, cCameraPan * PI2);\r\n  return volumetricExplosion(p/0.6)*0.6; // scale\r\n}\r\n\r\n// assing color to the media\r\nvec3 computeColor(float density, float radius) {\r\n// color based on density alone, gives impresion of occlusion within the media\r\n  vec3 result = mix(vec3(1.0, 0.9, 0.8), vec3(0.4, 0.15, 0.1), density);\r\n\r\n// color added to the media\r\n  vec3 colCenter = 7.0 * vec3(0.8, 1.0, 1.0);\r\n  vec3 colEdge = 1.5 * vec3(0.48, 0.53, 0.5);\r\n  result *= mix(colCenter, colEdge, min((radius + 0.05)/0.9, 1.15));\r\n  return result;\r\n}\r\n\r\nbool raySphereIntersect(vec3 org, vec3 dir, out float near, out float far) {\r\n  float b = dot(dir, org);\r\n  float c = dot(org, org) - 8.0;\r\n  float delta = b*b - c;\r\n  if (delta < 0.0) return false;\r\n  float deltasqrt = sqrt(delta);\r\n  near = -b - deltasqrt;\r\n  far = -b + deltasqrt;\r\n  return far > 0.0;\r\n}\r\n\r\n// Applies the filmic curve from John Hable's presentation\r\n// More details at : http://filmicgames.com/archives/75\r\nvec3 toneMapFilmicALU(vec3 c) {\r\n  c = max(vec3(0), c - vec3(0.004));\r\n  c = (c * (6.2*c + vec3(0.5))) / (c * (6.2 * c + vec3(1.7)) + vec3(0.06));\r\n  return c;\r\n}";

const explosion2Uniforms = {
	cCameraPan: { value: 0.0 },
	cExplosionSpeed: { value: 1.0 },
	cExplosionDensity: { value: 1.0 },
	cEmission: { value: 0.2 },
	cBloom: { value: 0.0 },
	cColor: { value: 1.0 },
};

var explosionFrag = "// https://www.shadertoy.com/view/Xd3GWn\r\n\r\n// downscale = 1.75;\r\n// grain = 2.7;\r\n// rolling_init_damp = 0.2;\r\n// ball_spread = 0.4;\r\n\r\n#ifdef LOW_Q\r\n  grain *= 1.0 + 0.1 * float(LOW_Q);\r\n  growth *= 1.0 - 0.1 * float(LOW_Q);\r\n  ballness *= 0.85;\r\n#endif\r\n\r\n  float t = getTime();\r\n\r\n// some global initialization.\r\n  setup();\r\n\r\n// get aspect corrected normalized pixel coordinate\r\n//   vec2 q = fragCoord.xy / resolution.xy;\r\n//   vec2 p = -1.0 + 2.0*q;\r\n//   p.x *= resolution.x / resolution.y;\r\n    \r\n  vec3 rayDir, cameraPos;\r\n  rayDir = computePixelRay( pin.position, cameraPos );\r\n\t\r\n  vec4 col = vec4(0.);\r\n  float d = 4000.0;\r\n    \r\n// does pixel ray intersect with exp bounding sphere?\r\n  vec2 boundingSphereInter = iSphere( cameraPos, rayDir, cExplosionRadius );\r\n  if ( boundingSphereInter.x > 0. ) {\r\n\t\t// yes, cast ray\r\n    col = raymarch( cameraPos, rayDir, boundingSphereInter, t, d );\r\n  }\r\n\t\r\n// smoothstep final color to add contrast\r\n//col.xyz = col.xyz*col.xyz*(3.0-2.0*col.xyz);\r\n//col.xyz = col.xyz*col.xyz*(2.0-col.xyz);\t// darker contrast\r\n  col.xyz = col.xyz*col.xyz*(1.0+cExplosionContrast*(1.0-col.xyz));\r\n\r\n// gamma\r\n//col.xyz = pow( col.xyz, vec3(1.25) );\r\n//col.a = pow( col.a, 1.5 );\r\n\r\n// from https://www.shadertoy.com/view/XdSXDc\r\n//col.rgb = clamp(pow(col.rgb, vec3(0.416667))*1.055 - 0.055,0.,1.); //cheap sRGB approx\r\n  \r\n// vec3 cloudcolor = vec3(.8,.8,.8);\r\n    \r\n//  #ifdef WITH_FUN\r\n//     // day-night cycling\r\n//     float dnt = fract(iGlobalTime / DAY_NIGHT_CYCLE_TIME);\r\n//     float day = 1.-smoothstep(.3, .5, dnt);\r\n//     float night = smoothstep(.8, 1., dnt);\r\n//     day += night;\r\n//     night = 1.-day;\r\n// \r\n//     // night setting\r\n//     float gray = back.r+back.g+back.b;\r\n//     vec3 corridorlight = night < .9 ? vec3(0.) :\r\n//         smoothstep( 1., 0., gray ) * (CORRIDOR_LIGHT);\t// this is so cute looking\r\n//     //vec3 nightcolor = pow(back.b, 5. * clamp(rayDir.y+.7, 1. - (ENLIGHTEN_PASSAGE), 1.)) * (NIGHT_COLORING);\r\n//     vec3 nightcolor = pow(back.b, 4.) * (NIGHT_COLORING);\r\n//     nightcolor *= smoothstep( -1., 1., -(gray-1.7) ) + .1;\r\n//     \r\n//  #ifdef STARS\r\n//     if ( gray > 2.999 )\t// luck, practically just the sky in the cubemap is pure white\r\n//     \tnightcolor += stars( rayDir );\r\n//  #endif\r\n// \r\n//     // faking some light on the floor from the explosion\r\n//     vec3 floorlight = (smoothstep( .3, .99, -rayDir.y ) * (FLOOR_LIGHT_STRENGTH) * smoothstep(.6, .0, t)) * colBottom.rgb;\r\n// \r\n//     cloudcolor *= smoothstep( -.5, 1., day );\r\n//     \r\n//     back.rgb = back.rgb * day + nightcolor * night + corridorlight + floorlight;\r\n//  #endif\r\n// \r\n// #ifdef WITH_FUN\r\n// #ifdef FOG\r\n//     back.rgb = clouds(back.rgb,cameraPos+vec3(0.,40.,0.), rayDir, 4000.0, iGlobalTime*3., cloudcolor);\r\n// #endif\r\n// #endif\r\n    \r\n// fragColor.xyz = mix( back.xyz, col.xyz, col.a );\r\n  pout.color = vec3(rgb2gray(mix( vec3(0.0), col.xyz, col.a )));\r\n//  fragColor.xyz = rayDir;\r\n//  fragColor.xyz = cameraPos;\r\n\r\n//fragColor.rgb = clouds(fragColor.rgb,cameraPos, rayDir, d, iGlobalTime*3., cloudcolor);\r\n\r\n// vignette\r\n// fragColor.rgb *= pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.1);";

var explosionFragPars = "// https://www.shadertoy.com/view/Xd3GWn\r\n\r\nuniform float cCameraTilt;\r\nuniform float cCameraPan;\r\nuniform float cExplosionRadius;\r\nuniform float cExplosionDownScale;\r\nuniform float cExplosionGrain;\r\nuniform float cExplosionSpeed;\r\nuniform float cExplosionBallness;\r\nuniform float cExplosionGrowth;\r\nuniform float cExplosionFade;\r\n// uniform float cExplosionThinoutSmooth;\r\nuniform float cExplosionDensity;\r\nuniform float cExplosionContrast;\r\nuniform float cExplosionRollingInitDamp;\r\nuniform float cExplosionRollingSpeed;\r\nuniform float cExplosionDelayRange;\r\nuniform float cExplosionBallSpread;\r\n\r\n// #define NOISE_LUT\r\n\r\n// In calcDens(), description mentions a bug which appeared with the old coloring.\r\n// #define OLD_COLORING\r\n\r\n// if not defined, mouse y will move camera\r\n// if defined, mouse y will override animation time stamp\r\n// #define ALTERNATE_MOUSE\r\n\r\n// for (slight) speed improvement, use low quality fbm and noise and compensate with some settings adjustments\r\n// if not defined, high quality\r\n// if 1, medium quality. acceptable.\r\n// if 2, low quality. not acceptable anymore.\r\n// Notice, 1 and 2 have approximately the same speed when putting also the compensation adjustments. But compared to high quality, they are indeed faster.\r\n// #define LOW_Q 1\r\n\r\n// some approximation to show the inner and outer bounds of the volumes. the y center plane is removed (transparent)\r\n// to give a better look and feel on the inside.\r\n// #define SHOW_BOUNDS\r\n    \r\n#define CAM_ROTATION_SPEED 11.7\r\n#define CAM_TILT .15\t\t\t\t// put 0. if you do not want to animate camera vertically\r\n#define CAM_DIST 3.8\r\n\r\n#define MAX_MULT_EXPLOSIONS 5\r\n\r\n// the bounding sphere of the explosion. this is less general but means that\r\n// ray cast is only performed for nearby pixels, and raycast can begin from the sphere\r\n// (instead of walking out from the camera)\r\n// float expRadius = 1.75;\r\nfloat explosion_seed = 0.0;\t\t\t// keep this constant for a whole explosion, but when differing from explosion to the next one, you get non-identical looking ones\r\n// float downscale = 1.25;\t\t\t\t// how much smaller (than expRadius) one explosion ball should be. bigger value = smaller. 1.0 = no scale down.\r\nconst int steps = 64;\t\t\t\t// iterations when marching through cloud noise. default = 64. 40 might still suffice. When putting higher, explosion becomes too dense, so make colBottom and colTop more transparent.\r\n// float grain = 2.0;\t\t\t\t\t// increase for more detailed explosions, but then you should also increase iterations (and decrease step, which is done automatically)\r\n// float speed = 0.3;\t\t\t\t\t// total animation speed (time stretch). nice = 0.5, default = 0.4\r\n// float ballness = 2.0;\t\t\t\t// lower values makes explosion look more like a cloud. higher values more like a ball.\r\n// float growth = 2.2;\t\t\t\t\t// initial growth to explosion ball. lower values makes explosion grow faster\r\n// float fade = 1.6;\t\t\t\t\t// greater values make fade go faster but later. Thus greater values leave more smoke at the end.\r\nfloat thinout_smooth = 0.7;\t\t\t// smoothed thinning out of the outer bounding sphere. 1.0 = no smoothening, 0.0 = heavy thinning, nice = 0.65 to 0.75\r\n// float density = 1.35;\t\t\t\t// higher values make sharper difference between dark and bright colors. low values make more blurry, less color spread and more transparent. default = 1.25 or 1.35\r\nvec2 brightness = vec2(3.0, 2.2);\t// x = constant offset, y = time-dependent factor\r\nvec2 brightrad = vec2(1.3, 1.0);\t// adds some variation to the radius of the brightness falloff. x = constant offset, y = density-dependent factor\r\nvec4 colBottom = vec4(1.2,0.94,0.42,0.7);\r\nvec4 colTop = vec4(0.15,0.15,0.15,0.1);\r\nfloat color_low = 0.25;\t\t\t\t// the lower the value, the more black spots appear in the explosion. the higher, the more even the explosion looks like.\r\n// float contrast = 1.0;\t\t\t\t// final color contrast. higher values make ligher contrast. default = 1.0\r\n// float rolling_init_damp = 0.3;\t\t// rolling animation initial damping. 0.0 = no damping. nice = 0.2, default = 0.15\r\n// float rolling_speed = 2.0;\t\t\t// rolling animation speed (static over time). default = 1.0\r\nconst int mult_explosions = MAX_MULT_EXPLOSIONS;\t// how many explosion balls to draw\r\nfloat variation_seed = 0.0;\t\t\t// influences position variation of the different explosion balls\r\nfloat delay_seed = 0.0;\t\t\t\t// influences the start delay variation of the different explosion balls\r\n// float delay_range = 0.25;\t\t\t// describes the maximum delay for explosion balls to start up. Notice, this delay is relative to one explosion ball duration, so actually before speed is applied.\r\n// float ball_spread = 1.0;\t\t\t// how much to spread ball starting positions from the up vector. 0.0 = all on up vector, 1.0 = any direction between up and down vector.\r\n\r\n\r\n\r\n\r\n\r\n// Now come some fun effects which have nothing to do with the explosion effect.\r\n// You can switch them all off completely by commenting WITH_FUN.\r\n// #define WITH_FUN\r\n// \t// The fog is just for fun and has nothing to do with the explosion.\r\n\t#define FOG\r\n// \t// Same with the stars. Just for fun.\r\n\t#define STARS\r\n    \t#define STARDISTANCE 250.2\r\n    \t#define STARBRIGHTNESS 0.3\r\n    \t#define STARDENCITY 0.05\r\n\t// Night scenery settings, again just for fun.\r\n\t#define DAY_NIGHT_CYCLE_TIME 20.\r\n\t#define NIGHT_COLORING vec3(.92,.95,1.)\r\n\t#define CORRIDOR_LIGHT vec3(1.,1.,.9)\r\n\t#define ENLIGHTEN_PASSAGE .75\r\n\t// explosion enlightening the floor (faked)\r\n\t#define FLOOR_LIGHT_STRENGTH 1.\r\n\r\nstruct Ball\r\n{\r\n  vec3 offset;\r\n  vec3 dir;\r\n  float delay;\r\n};\r\n\r\nBall balls[MAX_MULT_EXPLOSIONS];\r\n\r\n// float tmax = 1.0 + delay_range;\r\nfloat getTime() {\r\n  float tmax = 1.0 + cExplosionDelayRange;\r\n#if defined (ALTERNATE_MOUSE) && !defined (SHADERTOY_APP)\r\n  if( iMouse.z > 0.0 ) return mouse.y/resolution.y*tmax;\r\n#endif\r\n  return fract(time * cExplosionSpeed / tmax) * tmax;\r\n}\r\n\r\nfloat hash( float n ) {\r\n  return fract(cos(n)*41415.92653);\t//https://www.shadertoy.com/view/4sXGRM\r\n    //return fract(sin(n)*753.5453123);\t//https://www.shadertoy.com/view/4sfGzS\r\n}\r\n\r\nvec2 hash2( float n ) {\r\n    //return fract(cos(n)*vec2(10003.579, 37049.7));\t//https://www.shadertoy.com/view/XtsSWs\r\n    return fract(sin(vec2(n,n+1.0))*vec2(13.5453123,31.1459123));\r\n}\r\n\r\nvec3 hash3( float n ) {\r\n    return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(13.5453123,31.1459123,37.3490423));\r\n}\r\n\r\nfloat hash13(vec3 p3) {\r\n  p3 = fract(p3 * vec3(.1031,.11369,.13787));\r\n  p3 += dot(p3, p3.yzx + 19.19);\r\n  return fract((p3.x + p3.y) * p3.z);\r\n}\r\n\r\n#ifdef NOISE_LUT\r\n//iq's LUT 3D noise\r\nfloat noise( in vec3 x ) {\r\n  vec3 f = fract(x);\r\n  vec3 p = x - f; // this avoids the floor() but doesnt affect performance for me.\r\n#ifndef LOW_Q\t\t// in low quality setting, for speed, we try to live without that. we compensate with growth and fade.\r\n  f = f*f*(3.0-2.0*f);\r\n#endif\r\n  vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;\r\n  vec2 rg = texture2D( iChannel0, (uv+ 0.5)/256.0, -100.0 ).yx;\r\n  return mix( rg.x, rg.y, f.z );\r\n}\r\n#else\r\n\r\nfloat noise( in vec3 x ) {\r\n  vec3 f = fract(x);\r\n  vec3 p = x - f; // this avoids the floor() but doesnt affect performance for me.\r\n#ifndef LOW_Q\t\t// in low quality setting, for speed, we try to live without that. we compensate with growth and fade.\r\n  f = f*f*(3.0-2.0*f);\r\n#endif\r\n\t\r\n  float n = p.x + p.y*157.0 + 113.0*p.z;\r\n  return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),\r\n                 mix( hash(n+157.0), hash(n+158.0),f.x),f.y),\r\n             mix(mix( hash(n+113.0), hash(n+114.0),f.x),\r\n                 mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);\r\n}\r\n#endif\r\n\r\nfloat fbm( vec3 p, vec3 dir ) {\r\n  float f;\r\n#ifndef LOW_Q\r\n  vec3 q = p - dir; f  = 0.50000*noise( q );\r\n  q = q*2.02 - dir; f += 0.25000*noise( q );\r\n  q = q*2.03 - dir; f += 0.12500*noise( q );\r\n  q = q*2.01 - dir; f += 0.06250*noise( q );\r\n  q = q*2.02 - dir; f += 0.03125*noise( q );\r\n#elif LOW_Q == 1\r\n    // in low quality setting, for speed, we try to live with a lower-quality fbm. we compensate with higher grain.\r\n  vec3 q = p - dir; f  = 0.50000*noise( q );\r\n  q = q*2.02 - dir; f += 0.25000*noise( q );\r\n  q = q*2.03 - dir; f += 0.12500*noise( q );\r\n  q = q*2.04 - dir; f += 0.08250*noise( q );\r\n#elif LOW_Q == 2\r\n  vec3 q = p - dir; f  = 0.50000*noise( q );\r\n  q = q*2.14 - dir; f += 0.29000*noise( q );\r\n  q = q*2.25 - dir; f += 0.16500*noise( q );\r\n#endif\r\n  return f;\r\n}\r\n\r\nfloat tri(in float x) {\r\n  return abs(fract(x)-.5);\r\n}\r\n\r\nvec3 tri3(in vec3 p) {\r\n  return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));\r\n}\r\n\r\nfloat triNoise3d(in vec3 p, in float spd, float ti) {\r\n  float z=1.1;\r\n  float rz = 0.;\r\n  vec3 bp = p*1.5;\r\n  for (float i=0.; i<=3.; i++ ) {\r\n    vec3 dg = tri3(bp);\r\n    p += (dg+spd);\r\n    bp *= 1.9;\r\n    z *= 1.5;\r\n    p *= 1.3;\r\n\r\n    rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;\r\n    bp += 0.14;\r\n  }\r\n  return rz;\r\n}\r\n\r\nfloat fogmap(in vec3 p, in float d, float ti) {\r\n  p.x *= .4;\r\n  p.x += ti*1.5;\r\n  p.z += sin(p.x*.5);\r\n  p.z *= .4;\r\n  return max(triNoise3d(p*.3/(d+20.),0.2, ti)-.4, 0.)*(smoothstep(0.,25.,p.y));\r\n    //return triNoise3d(p*1.2/(d+20.),0.2, ti)*(1.25-smoothstep(0.,25.,p.y));\r\n}\r\n// Thanks to nimitz for the fast fog/clouds idea...\r\n// https://www.shadertoy.com/view/4ts3z2\r\nvec3 clouds(in vec3 col, in vec3 ro, in vec3 rd, in float mt, float ti, in vec3 cloudcolor) {\r\n  float d = 1.5;\t//.5\r\n  for(int i=0; i<7; i++) {\r\n    if (d>mt) break;\r\n    vec3  pos = ro + rd*d;\r\n    float rz = fogmap(pos, d, ti);\r\n//float grd =  clamp((rz - fogmap(pos+.8-float(i)*0.1,d, ti))*3., 0.1, 1. );\r\n//vec3 cloudcolor = (vec3(.1,0.8,.5)*.5 + .5*vec3(.5, .8, 1.)*(1.7-grd))*0.55;\r\n//vec3 cloudcolor = (2.*vec3(.4,0.4,.4) + .5*vec3(.5)*(1.7-grd))*0.55;\r\n//vec3 cloudcolor = 2.*(vec3(.4,0.4,.4));\r\n    col = mix(col,cloudcolor,clamp(rz*smoothstep(d-0.4,2.+d*1.75,mt),0.,1.) );\r\n//col = mix(col,cloudcolor,clamp(rz*smoothstep(d,d*1.86,mt),0.,1.) );\r\n    d *= 1.5+0.3;\r\n  }\r\n  return col;\r\n}\r\n\r\n// Thanks to bjarkeck for the fast star field implementation...\r\n// https://www.shadertoy.com/view/lsc3z4\r\nfloat stars(vec3 ray) {\r\n  vec3 p = ray * STARDISTANCE;\r\n  float brigtness = smoothstep(1.0 - STARDENCITY, 1.0, hash13(floor(p)));\r\n  return smoothstep(STARBRIGHTNESS, 0., length(fract(p) - 0.5)) * brigtness;\r\n}\r\n\r\n// assign colour to the media\r\nvec4 computeColour( float density, float radius, float bright ) {\r\n\t// colour based on density alone. gives impression of occlusion within\r\n\t// the media\r\n\t//vec4 result = vec4( mix( vec3(1.0,0.9,0.8), vec3(.7,0.3,0.2), density ), density );\r\n\t//vec4 result = vec4( mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density ), density );\r\n  vec4 result = vec4( vec3(mix( 1.0, color_low, density )), density );\r\n    //vec4 result = vec4( mix( 1.1*vec3(1.0,0.9,0.8), 0.9*vec3(0.4,0.15,0.1), density ), density );\r\n    //vec4 result = vec4(1.,1.,1.,density);\r\n\r\n\t// colour added for explosion\r\n    //result *= mix( colBottom * bright, colTop * bright, min( (radius+0.5)*0.588, 1.0 ) );\r\n  result *= mix( colBottom, colTop, min( (radius+0.5)*0.588, 1.0 ) ) * bright;\r\n    //result *= mix( colBottom, colTop, radius ) * bright;\r\n\t//result.rgb *= mix( colBottom * bright, colTop, smoothstep( 0., 1., (radius-0.5)*0.6+0.5 ) );\r\n\t//result *= mix( colBottom * bright, colTop, clamp( radius * 1.7-.2, 0.0, 1.0 ) );\r\n    //result.a*=density*1.5;\r\n\t//result.a *= mix( 1.0, 0.0, min( (radius / expRadius + 0.2)*0.5, 1.0 ) );\r\n    //result.a *= mix( 1.0, 0.2, min( (radius+0.5)/1.7, 1.0 ) );\r\n\t//result.a *= mix( 0.0, 1.0, 1.0-radius*0.25 );\r\n\t//if(radius<1.0-mouseY) result.a=0.0;\r\n\t// make central hole\r\n\t//result.a *= clamp((radius/expRadius-0.5*mouseIn)*15.0, 0.0, 1.0);\r\n\t//result.xyz *= mix( 3.1*vec3(1.0,0.5,0.05), vec3(0.48,0.53,0.5), min( radius*.76, 1.0 ) );\r\n\t\r\n    //result = mix( colBottom * bright * vec4(1.0,0.9,0.8,1.0), colTop*vec4(0.4,0.15,0.1,1.0), min( (radius+0.5)/1.7, 1.0 ) );\r\n    //result.a *= density;\r\n    \r\n  return result;\r\n}\r\n\r\n// maps 3d position to density\r\nfloat densityFn( in vec3 p, in float r, float t, in vec3 dir, float seed ) {\r\n  //const float pi = 3.1415926;\r\n  float den = cExplosionBallness + (cExplosionGrowth+cExplosionBallness)*log(t)*r;\r\n  den -= (2.5+cExplosionBallness)*pow(t,cExplosionFade)/r;\r\n    //den = -1.7 - p.y;\r\n\t//den *= 1.+smoothstep(0.75,1.,r);\r\n    \r\n    //if ( den <= -4. || den > -1. ) return -1.;\r\n    //if ( den <= -2.8 ) return -1.;\r\n  if ( den <= -3. ) return -1.;\r\n    //if ( den > -1. ) return -1.;\r\n    \r\n#ifdef SHOW_BOUNDS\r\n  p = 0.5 * normalize(p);\r\n  return abs(p.y);\r\n    //return 0.8;\r\n#endif\r\n    \r\n\t// offset noise based on seed\r\n\t// plus a time based offset for the rolling effect (together with the space inversion below)\r\n    //float s = seed-(rolling_speed/(t+rolling_init_damp));\r\n  float s = seed-(cExplosionRollingSpeed/(sin(min(t*3.,1.57))+cExplosionRollingInitDamp));\r\n\t//if( iMouse.z > 0.0 ) t += iMouse.y * 0.02;\r\n    //vec3 dir = vec3(0.,1.,0.);\r\n\t//vec3 dir = -0.5*(p - expCenter);\r\n    //vec3 dir = normalize( vec3( noise(p.xyz), noise(p.yxz), noise(p.zyx) ) );\r\n  dir *= s;\r\n\r\n    // invert space\r\n  p = -cExplosionGrain*p/(dot(p,p)*cExplosionDownScale);\r\n\r\n    // participating media\r\n  float f = fbm( p, dir );\r\n    //f=clamp(f,.1,.7);\r\n\t\r\n\t// add in noise with scale factor\r\n  den += 4.0*f;\r\n    //den -= r*r;\r\n\t\r\n\t//den *= density;\t// we do that outside\r\n\t//den *= 1.25;\r\n    //den *= .8;\r\n\r\n  return den;\r\n}\r\n\r\n// rad = radius of complete mult explosion (range 0 to 1)\r\n// r = radius of the explosion ball that contributes the highest density\r\n// rawDens = non-clamped density at the current maching location on the current ray\r\n// foffset = factor for offset how much the offsetting should be applied. best to pass a time-based value.\r\nvoid calcDens( in vec3 pos, out float rad, out float r, out float rawDens, in float t, in float foffset, out vec4 col, in float bright ) {\r\n  float radiusFromExpCenter = length(pos);\r\n  rad = radiusFromExpCenter / cExplosionRadius;\r\n\r\n  r = 0.0;\r\n  rawDens = 0.0;\r\n  col = vec4(0.0);\r\n\r\n  for ( int k = 0; k < mult_explosions; ++k )\r\n  {\r\n    float t0 = t - balls[k].delay;\r\n    if ( t0 < 0.0 || t0 > 1.0 ) continue;\r\n\r\n    vec3 p = pos - balls[k].offset * foffset;\r\n    float radiusFromExpCenter0 = length(p);\r\n\r\n    float r0 = cExplosionDownScale * radiusFromExpCenter0 / cExplosionRadius;\r\n    if( r0 > 1.0 ) continue;\r\n// BUG: Skipping for r0 > 1.0 gives some artefacts on later smoke where the inside of sphere\r\n    // is more transparent than the outside (for the parts where other expl balls contribute density in).\r\n    // I can't figure yet what the problem is. Inside the sphere near border, densities should be\r\n    // practically 0.0 which also does not contribute (almost) anything to sum in contributeDens.\r\n    // So what's the problem then?\r\n    // Notice, the same bug happens with skipping for t0 > 1.0, just there slight jumps can be seen near\r\n    // end of animation for certain angle views.\r\n    // Reason for the bug: Below, we pass r0 as r. If a density is not skipped but becomes in final color\r\n    // actually transparent, r0 is still passed as r. Outside the r0, the r gains a value from another\r\n    // explosion ball and thus gains also its rawDens0. Inside our r0, the other's ball's density gets\r\n    // skipped, which is producing the jump.\r\n// Fix would be to intermengle all densities altogether without\r\n    // skipping any. But how? Especially how to intermengle all the r0's?\r\n// Actually the problem comes from color calculation which makes the final color near transparent the\r\n// higher the density value.\r\n// So maybe the fix would be to put the transparency information into the density somehow before\r\n// selecting one radius. Actually we could add up all the densities, but the one which was the\r\n// highest could be that one who's r0 we will use as r. Maybe.\r\n    // FIX: The bug is only with OLD_COLORING. New coloring should not have this bug anymore.\r\n    \r\n    float rawDens0 = densityFn( p, r0, t0, balls[k].dir, explosion_seed + 33.7*float(k) ) * cExplosionDensity;\r\n\r\n#ifndef SHOW_BOUNDS\r\n\t// thin out the volume at the far extends of the bounding sphere to avoid\r\n\t// clipping with the bounding sphere\r\n    rawDens0 *= 1.-smoothstep(thinout_smooth,1.,r0);\r\n#endif\r\n\r\n#ifndef OLD_COLORING\r\n    float dens = clamp( rawDens0, 0.0, 1.0 );\r\n\r\n    //vec4 col0 = computeColour(dens, r0*(.9+.5*dens)/1.75, bright);\t// also adds some variation to the radius\r\n    //vec4 col0 = computeColour(dens, r0*(1.4+rawDens0), bright);\t\t// also adds some variation to the radius\r\n    vec4 col0 = computeColour(dens, r0*(brightrad.x+brightrad.y*rawDens0), bright);\t// also adds some variation to the radius\r\n\r\n#ifndef SHOW_BOUNDS\r\n    // uniform scale density\r\n    //col0.a *= 0.8;\r\n    //col0.a *= col0.a + .4;\r\n    col0.a *= (col0.a + .4) * (1. - r0*r0);\r\n\r\n    // colour by alpha\r\n    col0.rgb *= col0.a;\r\n#else\r\n    col0.a *= 5.;\r\n#endif\r\n\r\n    col += col0;\r\n\r\n    rawDens = max(rawDens, rawDens0);\r\n    //rawDens+=max(rawDens0,0.);\r\n\r\n\r\n#else\r\n    if ( rawDens0 > rawDens ) {\r\n      rawDens = rawDens0;\r\n      r = r0;\r\n    }\r\n#endif\r\n  }\r\n\r\n#ifdef SHOW_BOUNDS\r\n  col /= float(mult_explosions);\r\n#endif\r\n    \r\n\t//rawDens *= density;\r\n}\r\n\r\n#ifdef OLD_COLORING\r\n// rad = radius of complete mult explosion (range 0 to 1)\r\n// r = radius of the explosion ball that contributes the highest density\r\n// rawDens = non-clamped density at the current maching location on the current ray\r\nvoid contributeDens( in float rad, in float r, in float rawDens, in float bright, out vec4 col, inout vec4 sum ) {\r\n  //float dens = clamp( rawDens, 0.0, 1.0 );\r\n  float dens = min( rawDens, 1.0 );\t// we expect already rawDens to be positive\r\n\r\n//col = computeColour(dens, r*(.9+.5*dens)/1.75, bright);\t// also adds some variation to the radius\r\n//col = computeColour(dens, r*(1.4+rawDens), bright);\t// also adds some variation to the radius\r\n  col = computeColour(dens, r*(brightrad.x+brightrad.y*rawDens), bright);\t// also adds some variation to the radius\r\n\r\n#ifndef SHOW_BOUNDS\r\n// uniform scale density\r\n//col.a *= 0.8;\r\n//col.a *= col.a + .4;\r\n  col.a *= (col.a + .4) * (1. - r*r);\r\n\r\n// colour by alpha\r\n  col.rgb *= col.a;\r\n\r\n// alpha blend in contribution\r\n  sum = sum + col*(1.0 - sum.a);\r\n  sum.a+=0.15*col.a;\r\n#else\r\n  col.a *= 5.;\r\n\t  sum = max(sum, col);\r\n#endif\r\n}\r\n#endif\r\n\r\n#ifndef OLD_COLORING\r\nvoid contributeColor( in vec4 col, inout vec4 sum ) {\r\n#ifndef SHOW_BOUNDS\r\n// alpha blend in contribution\r\n  sum = sum + col*(1.0 - sum.a);\r\n  sum.a+=0.15*col.a;\r\n#else\r\n\t  sum = max(sum, col);\r\n#endif\r\n}\r\n#endif\r\n\r\nvec4 raymarch( in vec3 rayo, in vec3 rayd, in vec2 expInter, in float t, out float d ) {\r\n  vec4 sum = vec4( 0.0 );\r\n\r\n  float step = 1.5 / float(steps);\r\n \r\n// start iterating on the ray at the intersection point with the near half of the bounding sphere\r\n//vec3 pos = rayo + rayd * (expInter.x + step*texture2D( iChannel2, gl_FragCoord.xy/iChannelResolution[0].x ).x);\t\t// dither start pos to break up aliasing\r\n//vec3 pos = rayo + rayd * (expInter.x + 1.0*step*fract(0.5*(gl_FragCoord.x+gl_FragCoord.y)));\t// regular dither\r\n  vec3 pos = rayo + rayd * (expInter.x);\t// no dither\r\n\r\n  float march_pos = expInter.x;\r\n  d = 4000.0;\r\n\r\n// t goes from 0 to 1 + mult delay. that is 0 to 1 is for one explosion ball. the delay for time distribution of the multiple explosion balls.\r\n// t_norm is 0 to 1 for the whole animation (incl mult delay).\r\n  float tmax = 1.0 + cExplosionDelayRange;\r\n  float t_norm = t / tmax;\r\n  float smooth_t = sin(t_norm*2.1);\t//sin(t*2.);\r\n\r\n//float bright = 6.1;\r\n  float t1 = 1.0 - t_norm;\t// we use t_norm instead of t so that final color is reached at end of whole animation and not already at end of first explosion ball.\r\n  //float bright = 3.1 + 18.0 * t1*t1;\r\n//float bright = 3.1 + 1.4 * t1*t1;\r\n//float bright = 3.1 + 4.4 * t1*t1;\r\n  float bright = brightness.x + brightness.y * t1*t1;\r\n//float bright = smoothstep(0.0, 30.1, 1.0);\r\n//float bright = smoothstep(20.0, 3.1, 1.0);\r\n//float bright = 10.;\r\n\r\n  for( int i=0; i<steps; i++ ) {\r\n    if ( sum.a >= 0.98 ) { d = march_pos; break; }\r\n    if ( march_pos >= expInter.y ) break;\r\n\r\n    float rad, r, rawDens;\r\n    vec4 col;\r\n    calcDens( pos, rad, r, rawDens, t, smooth_t, col, bright );\r\n\r\n    if ( rawDens <= 0.0 ) {\r\n      float s = step * 2.0;\r\n      pos += rayd * s;\r\n      march_pos += s;\r\n      continue;\r\n    }\r\n        \r\n#ifdef OLD_COLORING\r\n    contributeDens( rad, r, rawDens, bright, col, sum );\r\n#else\r\n    contributeColor( col, sum );\r\n#endif\r\n  \r\n// take larger steps through low densities.\r\n// something like using the density function as a SDF.\r\n    float stepMult = 1.0 + (1.-clamp(rawDens+col.a,0.,1.));\r\n// step along ray\r\n    pos += rayd * step * stepMult;\r\n    march_pos += step * stepMult;\r\n\r\n//pos += rayd * step;\r\n  }\r\n\r\n#ifdef SHOW_BOUNDS\r\n  if ( sum.a < 0.1 ) {\r\n    sum = vec4(0.,0.,.5,0.1);\r\n  }\r\n#endif\r\n\t\r\n  return clamp( sum, 0.0, 1.0 );\r\n}\r\n\r\n// iq's sphere intersection, but here fixed for a sphere at (0,0,0)\r\nvec2 iSphere(in vec3 ro, in vec3 rd, in float rad) {\r\n\t//sphere at origin has equation |xyz| = r\r\n\t//sp |xyz|^2 = r^2.\r\n\t//Since |xyz| = ro + t*rd (where t is the parameter to move along the ray),\r\n\t//we have ro^2 + 2*ro*rd*t + t^2 - r2. This is a quadratic equation, so:\r\n\t//vec3 oc = ro - sph.xyz; //distance ray origin - sphere center\r\n\t\r\n  float b = dot(ro, rd);\t\t\t\t\t//=dot(oc, rd);\r\n  float c = dot(ro, ro) - rad * rad;\t\t//=dot(oc, oc) - sph.w * sph.w; //sph.w is radius\r\n  float h = b*b - c; // delta\r\n  if(h < 0.0) { \r\n    return vec2(-1.0);\r\n  }\r\n  //h = sqrt(h);\r\n  h *= 0.5;\t\t// just some rough approximation to prevent sqrt.\r\n  return vec2(-b-h, -b+h);\r\n}\r\n\r\nvec3 computePixelRay( in vec2 p, out vec3 cameraPos ) {\r\n    // camera orbits around explosion\r\n  float camRadius = CAM_DIST;\r\n\t// use mouse x coord\r\n  float a = time*CAM_ROTATION_SPEED;\r\n  float b = CAM_TILT * sin(a * .014);\r\n\r\n  a = cCameraPan;\r\n  b = cCameraTilt - 0.5;\r\n\r\n  float phi = b * 3.14;\r\n  float camRadiusProjectedDown = camRadius * cos(phi);\r\n  float theta = a * PI2;\r\n  float xoff = camRadiusProjectedDown * cos(theta);\r\n  float zoff = camRadiusProjectedDown * sin(theta);\r\n  float yoff = camRadius * sin(phi);\r\n  cameraPos = vec3(xoff,yoff,zoff);\r\n     \r\n// camera target\r\n  vec3 target = vec3(0.);\r\n     \r\n// camera frame\r\n  vec3 fo = normalize(target-cameraPos);\r\n  vec3 ri = normalize(vec3(fo.z, 0., -fo.x ));\r\n  vec3 up = normalize(cross(fo,ri));\r\n     \r\n// multiplier to emulate a fov control\r\n  float fov = .5;\r\n\t\r\n// ray direction\r\n  vec3 rayDir = normalize(fo + fov*p.x*ri + fov*p.y*up);\r\n\t\r\n  return rayDir;\r\n}\r\n\r\nvoid setup() {\r\n// first expl ball always centered looking up\r\n  balls[0] = Ball(\r\n    vec3(0.),\r\n    vec3(0.,.7,0.),\t\t// not normalized so that expl ball 0 rolls somewhat slower\r\n    0.0\r\n  );\r\n\r\n  float pseed = variation_seed;\r\n  float tseed = delay_seed;\r\n  float maxdelay = 0.0;\r\n  for ( int k = 1; k < mult_explosions; ++k ) {\r\n    float pseed = variation_seed + 3. * float(k-1);\r\n    float tseed = delay_seed + 3. * float(k-1);\r\n    vec2 phi = hash2(pseed) * vec2(2.*PI, PI*cExplosionBallSpread);\r\n    vec2 tilted = vec2( sin(phi.y), cos(phi.y) );\r\n    vec3 rotated = vec3( tilted.x * cos(phi.x), tilted.y, tilted.x * sin(phi.x) );\r\n    balls[k].offset = 0.7 * rotated; //hash3(pseed) - 0.5;\r\n    balls[k].dir = normalize( balls[k].offset );\r\n    balls[k].delay = cExplosionDelayRange * hash(tseed);\r\n    pseed += 3.;\r\n    tseed += 3.;\r\n    maxdelay = max(maxdelay, balls[k].delay);\r\n  }\r\n\r\n  if ( maxdelay > 0.0 ) {\r\n// Now stretch the ball explosion delays to the maximum allowed range.\r\n// So that the last ball starts with a delay of exactly delay_range and thus we do not waste any final time with just empty space.\r\n\t    for ( int k = 0; k < mult_explosions; ++k ) {\r\n      balls[k].delay *= cExplosionDelayRange / maxdelay;\r\n    }\r\n  }\r\n}";

const explosionUniforms = {
	cCameraTilt: { value: 0.0 },
	cCameraPan: { value: 0.0 },
	cExplosionRadius: { value: 1.75 },
	cExplosionDownScale: { value: 1.25 },
	cExplosionGrain: { value: 2.0 },
	cExplosionSpeed: { value: 0.3 },
	cExplosionBallness: { value: 2.0 },
	cExplosionGrowth: { value: 2.2 },
	cExplosionFade: { value: 1.6 },
	// cExplosionThinoutSmooth: { value: 0.7 },
	cExplosionDensity: { value: 1.35 },
	cExplosionContrast: { value: 1.0 },
	cExplosionRollingInitDamp: { value: 0.3 },
	cExplosionRollingSpeed: { value: 2.0 },
	cExplosionDelayRange: { value: 0.25 },
	cExplosionBallSpread: { value: 1.0 },
};

var fbmNoise2Frag = "vec2 speed = vec2(2.0, 1.0);\r\nvec2 p = pin.uv * cScale * 50.0 - time*0.2;\r\nfloat q = fbm2(p);\r\nvec2 r = vec2(fbm2(p + q + time * speed.x - p.x - p.y), fbm2(p + q - time * speed.y));\r\npout.color = vec3(fbm2(r));\r\n\r\nfloat graph = q;";

var fbmNoise2FragPars = "uniform float cScale;\nfloat fbm2Rand(vec2 n) {\n  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\nfloat fbm2Noise(vec2 n) {\n  const vec2 d = vec2(0.0, 1.0);\n  vec2 b = floor(n);\n  vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n  return mix(mix(fbm2Rand(b), fbm2Rand(b + d.yx), f.x), mix(fbm2Rand(b + d.xy), fbm2Rand(b + d.yy), f.x), f.y);\n}\nfloat fbm2(vec2 n) {\n  float total = 0.0;\n  float amplitude = 1.0;\n  for (int i=0; i<8; i++) {\n    if (i >= cNoiseOctave) break;\n    total += fbm2Noise(n) * amplitude;\n    n += n * cNoiseFrequency;\n    amplitude *= cNoiseAmplitude;\n  }\n  return total;\n}";

const fbmNoise2Uniforms = {
	cScale: { value: 0.2 },
};

var fbmNoise3Frag = "vec2 position = pin.uv + cOffset;\r\nposition *= cNoiseScale * 10.0;\r\nfloat color = intersectcloudscovonly(vec3(position.x, time * 0.03, position.y));\r\npout.color = vec3(color);\r\n\r\nfloat graph = color;";

var fbmNoise3FragPars = "uniform float cNoiseScale;\r\nuniform float cOffset;\r\n\r\nfloat hash(float n) {\r\n  return fract(sin(n)*758.5453);\r\n}\r\nfloat noise3d(in vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  float n = p.x + p.y * 157.0 + 113.0 * p.z;\r\n  return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),\r\n                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),\r\n             mix(mix(hash(n+113.0), hash(n+114.0), f.x),\r\n                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);\r\n}\r\nfloat noise2d(in vec2 x) {\r\n  vec2 p = floor(x);\r\n  vec2 f = smoothstep(0.0, 1.0, fract(x));\r\n  float n = p.x + p.y * 57.0;\r\n  return mix(mix(hash(n+0.0), hash(n+1.0), f.x), mix(hash(n+57.0), hash(n+58.0), f.x), f.y);\r\n}\r\n\r\nfloat configurablenoise(vec3 x, float c1, float c2) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  float h2 = c1;\r\n  float h1 = c2;\r\n  float n = p.x + p.y*h1+h2*p.z;\r\n  return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),\r\n                 mix(hash(n+h1), hash(n+h1+1.0), f.x), f.y),\r\n             mix(mix(hash(n+h2), hash(n+h2+1.0), f.x),\r\n                 mix(hash(n+h1+h2), hash(n+h1+h2+1.0), f.x), f.y), f.z);\r\n}\r\n\r\nfloat supernoise3d(vec3 p) {\r\n  float a = configurablenoise(p, 883.0, 971.0);\r\n  float b = configurablenoise(p+0.5, 113.0, 157.0);\r\n  return (a+b)*0.5;\r\n}\r\n\r\nfloat supernoise3dX(vec3 p) {\r\n  float a = configurablenoise(p, 883.0, 971.0);\r\n  float b = configurablenoise(p+0.5, 113.0, 157.0);\r\n  return (a*b);\r\n}\r\n\r\nfloat fbmHI(vec3 p, float dx) {\r\n  p *= 1.2;\r\n  float a = 0.0;\r\n  float w = 1.0;\r\n  float wc = 0.0;\r\n  for (int i=0; i<8; i++) {\r\n    if (i >= cNoiseOctave) break;\r\n    a += clamp(2.0 * abs(0.5 - supernoise3dX(p)) * w, 0.0, 1.0);\r\n    wc += w;\r\n    w *= cNoiseFrequency;\r\n    p = p * dx;\r\n    a *= cNoiseAmplitude;\r\n  }\r\n  return a / wc;\r\n  // return a / wc + noise(p*100.0)*11.0;\r\n}\r\n\r\n#define clouds pow(smoothstep(0.36 - supernoise3d(mx * 0.3 + time * 0.1) * 1.0, 0.46, supernoise3d(mx * 2.0) * fbmHI(mx * 6.0 + 5.0*fbmHI(mx.yxz * 1.0 + time * 0.001, 2.0) * 0.5 - time * 0.01, 2.8)), 3.0);\r\nfloat intersectcloudscovonly(vec3 start) {\r\n  vec3 mx = start;\r\n  // float h = (length(mx) - planetsize);\r\n  // h = smoothstep(0.0, 0.2, h) * (1.0 - smoothstep(0.2, 0.4, h));\r\n  return clouds\r\n}\r\n";

const fbmNoise3Uniforms = {
	cNoiseScale: { value: 0.5 },
	cOffset: { value: 0.0 },
};

var fbmNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat lum = fbm(pin.uv);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = fbm(pin.uv.xx);";

var fbmNoiseFragPars = "// fractal brownian motion (noise harmonic)\r\n// float fbm4(vec2 uv) {\r\n//   float n = 0.5;\r\n//   float f = 1.0;\r\n//   float l = 0.2;\r\n//   for (int i=0; i<4; i++) {\r\n//     n += snoise(vec3(uv*f, 1.0))*l;\r\n//     f *= 2.0;\r\n//     l *= 0.65;\r\n//   }\r\n//   return n;\r\n// }\r\n\r\n// fractal brownian motion (noise harmonic - fewer octaves = smoother)\r\n// float fbm8(vec2 uv) {\r\n//   float n = 0.5;\r\n//   float f = 4.0;\r\n//   float l = 0.2;\r\n//   for (int i=0; i<8; i++) {\r\n//     n += snoise(vec3(uv*f, 1.0))*l;\r\n//     f *= 2.0;\r\n//     l *= 0.65;\r\n//   }\r\n//   return n;\r\n// }\r\nfloat fbm(vec2 uv) {\r\n  float n = 0.5;\r\n  float f = 1.0;\r\n  float l = 0.2;\r\n  for (int i=0; i<8; i++) {\r\n    if (i >= cNoiseOctave) break;\r\n    n += snoise(vec3(uv*f, time))*l;\r\n//     f *= 2.0;\r\n//     l *= 0.65;\r\n    f *= cNoiseFrequency * 8.0;\r\n    l *= cNoiseAmplitude;\r\n  }\r\n  return n;\r\n}";

var fireFrag = "// https://www.shadertoy.com/view/XsXSWS by xbe\r\n\r\nvec2 q = pin.uv;\r\nq.y *= 2.0 - 1.0 * cPower;\r\nfloat T3 = max(3.0, 1.25 * cStrength) * time;\r\nq.x = mod(q.x, 1.0) - 0.5;\r\nq.y -= 0.25;\r\nfloat n = fbm(cStrength * q - vec2(0, T3));\r\nfloat c = 2.0 * cIntensity - 16.0 * pow(max(0.0, length(q * vec2(3.0 - cWidth*3.0 + q.y*1.5, 0.75)) - n * max(0.0, q.y + 0.25)), 1.2);\r\nfloat c1 = n * c * (1.5 - pow((2.50 / cRange)*pin.uv.y, 4.0));\r\nc1 = clamp(c1, 0.0, 1.0);\r\nvec3 col = vec3(1.5*c1, 1.5*c1*c1*c1, c1*c1*c1*c1*c1);\r\n\r\nfloat a = c * (1.0 - pow(pin.uv.y, 3.0));\r\nvec3 finalColor = mix(vec3(0.0), col, a);\r\nfloat gray = rgb2gray(finalColor);\r\npout.color = mix(vec3(gray), finalColor, cColor);";

var fireFragPars = "// https://www.shadertoy.com/view/XsXSWS by xbe\r\n\r\nuniform float cIntensity;\r\nuniform float cStrength;\r\nuniform float cPower;\r\nuniform float cRange;\r\nuniform float cWidth;\r\nuniform float cColor;\r\n\r\n// procedural noise from IQ\r\nvec2 hash( vec2 p ) {\r\n\tp = vec2( dot(p,vec2(127.1,311.7)),\r\n\t\t\t dot(p,vec2(269.5,183.3)) );\r\n\treturn -1.0 + 2.0*fract(sin(p)*43758.5453123);\r\n}\r\n\r\nfloat noise( in vec2 p ) {\r\n\tconst float K1 = 0.366025404; // (sqrt(3)-1)/2;\r\n\tconst float K2 = 0.211324865; // (3-sqrt(3))/6;\r\n\tvec2 i = floor( p + (p.x+p.y)*K1 );\r\n\tvec2 a = p - i + (i.x+i.y)*K2;\r\n\tvec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);\r\n\tvec2 b = a - o + K2;\r\n\tvec2 c = a - 1.0 + 2.0*K2;\r\n\tvec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );\r\n\tvec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));\r\n\treturn dot( n, vec3(70.0) );\r\n}\r\n\r\nfloat fbm(vec2 uv) {\r\n\tfloat f;\r\n\tmat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );\r\n\tf  = 0.5000*noise( uv ); uv = m*uv;\r\n\tf += 0.2500*noise( uv ); uv = m*uv;\r\n\tf += 0.1250*noise( uv ); uv = m*uv;\r\n\tf += 0.0625*noise( uv ); uv = m*uv;\r\n\tf = 0.5 + 0.5*f;\r\n\treturn f;\r\n}";

const fireUniforms = {
	cIntensity: { value: 0.5 },
	cStrength: { value: 1.0 },
	cPower: { value: 0.1 },
	cRange: { value: 2.0 },
	cWidth: { value: 0.1 },
	cColor: { value: 1.0 },
};

var flameEyeFrag = "vec2 uv = pin.position;\r\nfloat f = 0.0;\r\nfloat f2 = 0.0;\r\nfloat t = time * cSpeed;\r\nfloat alpha = light(uv, cSize, cRadius, cFlameEyeInnerFade, cFlameEyeOuterFade);\r\nfloat angle = atan(uv.x, uv.y);\r\nfloat n = flameEyeNoise(vec2(uv.x*20.0+time, uv.y*20.0+time));\r\nfloat l = length(uv);\r\nif (l < cFlameEyeBorder) {\r\n  t *= 0.8;\r\n  alpha = (1.0 - pow(((cFlameEyeBorder-l)/cFlameEyeBorder),0.22)*0.7);\r\n  alpha = clamp(alpha-light(uv, 0.2, 0.0, 1.3, 0.7)*0.55, 0.0, 1.0);\r\n  f = flare(angle*1.0, alpha,-t*0.5+alpha);\r\n  f2 = flare(angle*1.0, alpha,((-t+alpha*0.5+5.38134)));\r\n}\r\nelse if (alpha < 0.001) {\r\n  f = alpha;\r\n}\r\nelse {\r\n  f = flare(angle, alpha, t)*1.3;\r\n}\r\nvec3 col = vec3(f*(1.0 + sin(angle-t*4.0)*0.3) + f2*f2*f2, \r\n  f*alpha + f2*f2*2.0, \r\n  f*alpha*0.5 + f2*(1.0 + sin(angle + t*4.0)*0.3));\r\nfloat gray = rgb2gray(col);\r\npout.color = mix(vec3(gray), col, cColor);";

var flameEyeFragPars = "// https://www.shadertoy.com/view/ltBfDt\r\nconst float cSize = 2.3;\r\nconst float cRadius = 0.099;\r\n// uniform float cSize;\r\n// uniform float cRadius;\r\nuniform float cSpeed;\r\nuniform float cColor;\r\nuniform float cFlameEyeInnerFade;\r\nuniform float cFlameEyeOuterFade;\r\nuniform float cFlameEyeBorder;\r\n\r\nfloat flameEyeNoise(in vec2 st) {\r\n  vec2 i = floor(st);\r\n  vec2 f = fract(st);\r\n  float a = rand(i);\r\n  float b = rand(i + vec2(1.0, 0.0));\r\n  float c = rand(i + vec2(0.0, 1.0));\r\n  float d = rand(i + vec2(1.0, 1.0));\r\n  \r\n  vec2 u = f*f*(3.0-2.0*f);\r\n  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;\r\n}\r\n\r\nfloat light(in vec2 pos, float size, float radius, float inner_fade, float outer_fade) {\r\n  float len = length(pos/size);\r\n  return pow(clamp((1.0 - pow(clamp(len-radius, 0.0, 1.0), 1.0/inner_fade)), 0.0, 1.0), 1.0/outer_fade);\r\n}\r\n\r\nfloat flare(float angle, float alpha, float t) {\r\n  float n = flameEyeNoise(vec2(t+0.5+abs(angle)+pow(alpha,0.6), t-abs(angle)+pow(alpha+0.1,0.6))*7.0);\r\n  float split = (15.0 + sin(t*2.0+n*4.0+angle*20.0+alpha*1.0*n)*(0.3+0.5+alpha*0.6*n));\r\n  float rotate = sin(angle*20.0 + sin(angle*15.0+alpha*4.0+t*30.0+n*5.0+alpha*4.0))*(0.5 + alpha*1.5);\r\n  float g = pow((2.0 + sin(split + n*1.5*alpha+rotate)*1.4)*n*4.0, n*(1.5-0.8*alpha));\r\n  g *= alpha * alpha * alpha * 0.4;\r\n  g += alpha * 0.7 + g*g*g;\r\n  return g;\r\n}";

const flameEyeUniforms = {
	cSpeed: { value: 0.2 },
	cColor: { value: 1.0 },
	cFlameEyeInnerFade: { value: 0.8 },
	cFlameEyeOuterFade: { value: 0.02 },
	cFlameEyeBorder: { value: 0.23 },
};

var flameFrag = "// https://www.shadertoy.com/view/MdX3zr\r\nvec2 v = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\r\nv.x *= resolution.x / resolution.y;\r\n\r\nvec3 org = vec3(0.0, -2.0, 4.0);\r\nvec3 dir = normalize(vec3(v.x*1.6 / cWidth, -v.y, -1.5 * cScale));\r\n\r\nvec4 p = raymarch(org, dir);\r\nfloat glow = p.w;\r\n\r\n// vec4 col = mix(vec4(1.0, 0.5, 0.1, 1.0), vec4(0.1, 0.5, 1.0, 1.0), p.y*0.02 + 0.4);\r\n// col = mix(vec4(0.0), col, pow(glow*2.0, 4.0));\r\nvec4 col = mix(vec4(0.0), vec4(1.0), pow(glow*2.0*cIntensity, 4.0));\r\npout.color = col.xyz;\r\npout.opacity = col.w;";

var flameFragPars = "// https://www.shadertoy.com/view/MdX3zr\r\nuniform float cIntensity;\r\nuniform float cWidth;\r\nuniform float cScale;\r\n\r\nfloat flameNoise(vec3 p) {\r\n  vec3 i = floor(p);\r\n  vec4 a = dot(i, vec3(1.0, 57.0, 21.0)) + vec4(0.0, 57.0, 21.0, 78.0);\r\n  vec3 f = cos((p-i)*acos(-1.0)) * (-0.5) + 0.5;\r\n  a = mix(sin(cos(a)*a), sin(cos(1.0+a)*(1.0+a)), f.x);\r\n  a.xy = mix(a.xz, a.yw, f.y);\r\n  return mix(a.x, a.y, f.z);\r\n}\r\n\r\nfloat sphere(vec3 p, vec4 spr) {\r\n  return length(spr.xyz-p) - spr.w;\r\n}\r\n\r\nfloat flame(vec3 p) {\r\n  float d = sphere(p * vec3(1.0, 0.5, 1.0), vec4(0.0, -1.0, 0.0, 1.0));\r\n  return d + (flameNoise(p + vec3(0.0, time*2.0, 0.0)) + flameNoise(p*3.0)*0.5)*0.25*p.y;\r\n}\r\n\r\nfloat scene(vec3 p) {\r\n  return min(100.0 - length(p), abs(flame(p)));\r\n}\r\n\r\nvec4 raymarch(vec3 org, vec3 dir) {\r\n  float d = 0.0, glow = 0.0, eps = 0.02;\r\n  vec3 p = org;\r\n  bool glowed = false;\r\n  for (int i=0; i<64; i++) {\r\n    d = scene(p) + eps;\r\n    p += d * dir;\r\n    if (d > eps) {\r\n      if (flame(p) < 0.0) {\r\n        glowed = true;\r\n      } else if (glowed) {\r\n        glow = float(i)/64.0;\r\n      }\r\n    }\r\n  }\r\n  return vec4(p, glow);\r\n}";

var flamelanceFrag = "// compute flame area\r\nvec2 position = vec2((cAngle+1.)/2., 0.) * resolution.xy;\r\nfloat xinc = clamp(mod(time, 6.0)-3.0, -3.0, 3.0);\r\nfloat yinc = clamp(mod(-time, 6.0)+3.0, -3.0, 3.0);\r\n// float inc = xinc/yinc;\r\nfloat inc = -cAngle;\r\nfloat xslope = (pin.coord.x - position.x);\r\nfloat yslope = (pin.coord.y - position.y);\r\nfloat slope = xslope/yslope;\r\nfloat xdif = xinc/xslope;\r\nfloat ydif = yinc/yslope;\r\nfloat dist = distance(position, pin.coord.xy);\r\ndist = abs(slope - inc) * .1 + dist/(10000.*cPower);\r\nif ((inc > 0.0 && inc > 2.0) || (inc < 0.0 && inc < -2.0)) dist *= dist;\r\nif ((xdif < 0.0 && ydif < 0.0) || (ydif < 0.0 && xdif > 0.0)) dist = 10.0;\r\n\r\n// compute flame noise\r\nvec2 noisePosition = cNoiseSize * (pin.coord - position) / resolution.y - vec2(xinc*cSpeed*time, yinc*cSpeed*time);\r\nfloat noise = 0.0;\r\nfor (int i=0; i<10; i++) {\r\n  if (i > cNoiseDepth) break;\r\n  noise += cnoise(noisePosition * pow(2.0, float(i)));\r\n}\r\nvec4 d = mix(-(101.0-cSize) * dist, noise, cNoiseStrength) + color;\r\nvec3 gray = vec3(rgb2gray(d.xyz));\r\npout.color = mix(gray, d.xyz, cColor);";

var flamelanceFragPars = "uniform float cSize;\r\nuniform float cSpeed;\r\nuniform float cPower;\r\nuniform float cAngle;\r\nuniform float cColor;\r\nuniform float cNoiseSize;\r\nuniform float cNoiseStrength;\r\nuniform int cNoiseDepth;\r\nconst vec4 color = vec4(2.0, 1.5, .5, 1.0);\r\n\r\nvec2 fade(vec2 t) {\r\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\r\n}\r\n\r\nfloat cnoise(vec2 P) {\r\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\r\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\r\n  Pi = mod289(Pi);\r\n  vec4 ix = Pi.xzxz;\r\n  vec4 iy = Pi.yyww;\r\n  vec4 fx = Pf.xzxz;\r\n  vec4 fy = Pf.yyww;\r\n  vec4 i = permute(permute(ix)+iy);\r\n  vec4 gx = fract(i*(1.0/41.0))*2.0-1.0;\r\n  vec4 gy = abs(gx) - 0.5;\r\n  vec4 tx = floor(gx + 0.5);\r\n  gx = gx - tx;\r\n  vec2 g00 = vec2(gx.x, gy.x);\r\n  vec2 g10 = vec2(gx.y, gy.y);\r\n  vec2 g01 = vec2(gx.z, gy.z);\r\n  vec2 g11 = vec2(gx.w, gy.w);\r\n  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\r\n  g00 *= norm.x;\r\n  g01 *= norm.y;\r\n  g10 *= norm.z;\r\n  g11 *= norm.w;\r\n  float n00 = dot(g00, vec2(fx.x, fy.x));\r\n  float n10 = dot(g10, vec2(fx.y, fy.y));\r\n  float n01 = dot(g01, vec2(fx.z, fy.z));\r\n  float n11 = dot(g11, vec2(fx.w, fy.w));\r\n  vec2 fade_xy = fade(Pf.xy);\r\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\r\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\r\n  return 2.3 * n_xy;\r\n}";

const flamelanceUniforms = {
	cSize: { value: 32.0 },
	cSpeed: { value: 4.0 },
	cPower: { value: 1.0 },
	cAngle: { value: 0.0 },
	cColor: { value: 1.0 },
	cNoiseSize: { value: 8.0 },
	cNoiseStrength: { value: 0.25 },
	cNoiseDepth: { value: 3 },
};

const flameUniforms = {
	cIntensity: { value: 1.0 },
	cWidth: { value: 1.0 },
	cScale: { value: 1.0 },
};

var flare2Frag = "// https://www.shadertoy.com/view/Xs33R2\r\n// Particle star constants\r\nconst float part_int_div = 40000.;                            // Divisor of the particle intensity. Tweak this value to make the particles more or less bright\r\nconst float part_int_factor_min = 0.1;                        // Minimum initial intensity of a particle\r\nconst float part_int_factor_max = 100.2;                        // Maximum initial intensity of a particle\r\nconst float mp_int = 12.0;\r\nconst float ppow = 2.3;\r\n\r\nconst vec2 part_starhv_dfac = vec2(9., 0.32);                 // x-y transformation vector of the distance to get the horizontal and vertical star branches\r\nconst float part_starhv_ifac = 0.25;                          // Intensity factor of the horizontal and vertical star branches\r\nconst vec2 part_stardiag_dfac = vec2(13., 0.61);              // x-y transformation vector of the distance to get the diagonal star branches\r\nconst float part_stardiag_ifac = 0.19;                        // Intensity factor of the diagonal star branches\r\nconst float dist_factor = 3.0;\r\n\r\nvec2 p = vec2(0.5);\r\nfloat dist = distance(pin.uv, p);\r\nvec2 uvp = pin.uv - p;\r\n\r\n// rotate\r\nvec2 A = sin(vec2(0.0, 1.57) + time);\r\nuvp = uvp * mat2(A, -A.y, A.x);\r\n\r\nfloat distv = distance(uvp * part_starhv_dfac + p, p);\r\nfloat disth = distance(uvp * part_starhv_dfac.yx + p, p);\r\nvec2 uvd = 0.7071 * vec2(dot(uvp, vec2(1.0, 1.0)), dot(uvp, vec2(1.0, -1.0)));\r\nfloat distd1 = distance(uvd * part_stardiag_dfac + p, p);\r\nfloat distd2 = distance(uvd * part_stardiag_dfac.yx + p, p);\r\nfloat pint1 = 1.0 / (dist * dist_factor + 0.015);\r\npint1 += part_starhv_ifac / (disth * dist_factor + 0.01);\r\npint1 += part_starhv_ifac / (distv * dist_factor + 0.01);\r\npint1 += part_stardiag_ifac / (distd1 * dist_factor + 0.01);\r\npint1 += part_stardiag_ifac / (distd2 * dist_factor + 0.01);\r\n// if (part_int_factor_max * pint1 > 6.0) {\r\n  float pint = part_int_factor_max * (pow(pint1, ppow) / part_int_div) * mp_int * cIntensity;\r\n  pint = pow(pint, cPowerExponent);\r\n  pout.color = vec3(pint);\r\n// \"} else { pout.color = vec3(0.0); }\"";

var flare2FragPars = "// https://www.shadertoy.com/view/Xs33R2\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;";

const flare2Uniforms = {
	cIntensity: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
};

var flare3Frag = "// https://www.shadertoy.com/view/4sX3Rs#\r\nvec2 pos = vec2(0.5);\r\nvec2 uv = pin.uv - 0.5;\r\nvec2 uvd = uv * length(uv);\r\nvec2 p = vec2(0.0) - uv;\r\nfloat ang = atan(p.x, p.y);\r\nfloat dist = length(p); dist = pow(dist, 0.1);\r\nfloat f0 = cIntensity / (length(uv-p)*16.0+1.0);\r\nf0 = f0+f0*(sin(noise(time + (pos.x+pos.y)*2.2 + ang*4.0+5.954)*16.0)*0.1+dist*0.1+0.8);\r\n\r\n// float f1 = max(0.01-pow(length(uv+1.2*pos),1.9),.0)*7.0;\r\n// float f2 = max(1.0/(1.0+32.0*pow(length(uvd+0.8*pos),2.0)),.0)*00.25;\r\n// float f22 = max(1.0/(1.0+32.0*pow(length(uvd+0.85*pos),2.0)),.0)*00.23;\r\n// float f23 = max(1.0/(1.0+32.0*pow(length(uvd+0.9*pos),2.0)),.0)*00.21;\r\n// \r\n// vec2 uvx = mix(uv,uvd,-0.5);\r\n// float f4 = max(0.01-pow(length(uvx+0.4*pos),2.4),.0)*6.0;\r\n// float f42 = max(0.01-pow(length(uvx+0.45*pos),2.4),.0)*5.0;\r\n// float f43 = max(0.01-pow(length(uvx+0.5*pos),2.4),.0)*3.0;\r\n// \r\n// uvx = mix(uv,uvd,-.4);\r\n// float f5 = max(0.01-pow(length(uvx+0.2*pos),5.5),.0)*2.0;\r\n// float f52 = max(0.01-pow(length(uvx+0.4*pos),5.5),.0)*2.0;\r\n// float f53 = max(0.01-pow(length(uvx+0.6*pos),5.5),.0)*2.0;\r\n// \r\n// uvx = mix(uv,uvd,-0.5);\r\n// float f6 = max(0.01-pow(length(uvx-0.3*pos),1.6),.0)*6.0;\r\n// float f62 = max(0.01-pow(length(uvx-0.325*pos),1.6),.0)*3.0;\r\n// float f63 = max(0.01-pow(length(uvx-0.35*pos),1.6),.0)*5.0;\r\n\r\nvec3 c = vec3(.0);\r\n// c.r+=f2+f4+f5+f6; c.g+=f22+f42+f52+f62; c.b+=f23+f43+f53+f63;\r\n// c = c*1.3 - vec3(length(uvd)*.05);\r\nc+=vec3(f0);\r\n\r\nc *= vec3(1.4, 1.2, 1.0);\r\nc -= noise(pin.uv) * 0.015;\r\nc = cc(c, 0.5, 0.1);\r\n\r\nfloat t = c.x;\r\nt = pow(t, cPowerExponent);\r\n\r\npout.color = vec3(t);\r\n// pout.color = vec3(f0);\r\n// pout.color = vec3(iqnoise(pin.uv*64.0, 0.0, 0.0));";

var flare3FragPars = "// https://www.shadertoy.com/view/4sX3Rs#\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;\r\n\r\nfloat noise(float x) {\r\n//   return iqnoise(vec2(x,0.0), 0.0, 0.0);\r\n//   return pnoise(vec2(x*16.0,0.0));\r\n  return pnoise(vec2(x,0.0), 1, 2.0, 0.5);\r\n  // float map = min(resolution.x, resolution.y);\r\n  // vec2 t = mod(vec2(x,0.0), map);\r\n  // return snoise(t, t / map, vec2(map));\r\n}\r\n\r\nfloat noise(vec2 x) {\r\n  return iqnoise(x*512.0, 0.0, 0.0);\r\n//   return noise(x*0.1);\r\n}\r\n\r\nvec3 cc(vec3 color, float factor, float factor2) {\r\n  float w = color.x + color.y + color.z;\r\n  return mix(color, vec3(w)*factor, w*factor2);\r\n}";

const flare3Uniforms = {
	cIntensity: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
};

var flareFrag = "// https://www.shadertoy.com/view/4scXWB\r\n// rotation hexagon\r\nvec2 A = sin(vec2(0.0, 1.57) + time);\r\nvec2 U = abs(pin.position * mat2(A, -A.y, A.x)) * mat2(2.0, 0.0, 1.0, 1.7);\r\nfloat t = cIntensity * 0.5 / max(U.x, U.y); // glowing-spiky approx of step(max, 0.2)\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var flareFragPars = "// https://www.shadertoy.com/view/4scXWB\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;";

const flareUniforms = {
	cIntensity: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
};

var flashFrag = "float t = atan(pin.position.y, pin.position.x) + time;\r\nt = sin(t * cFrequency);\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var flashFragPars = "uniform float cFrequency;\r\nuniform float cPowerExponent;";

const flashUniforms = {
	cFrequency: { value: 10.0 },
	cPowerExponent: { value: 1.0 },
};

var flowerFrag = "float u = sin((atan(pin.position.y, pin.position.x) + time * 0.5) * floor(cPetals)) * cRadius;\r\nfloat t = cIntensity / abs(u - length(pin.position));\r\nt = pow(abs(t), cPowerExponent);\r\npout.color = vec3(t);";

var flowerFragPars = "uniform float cPetals;\r\nuniform float cRadius;\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;";

var flowerFunFrag = "float u = abs(sin((atan(pin.position.y, pin.position.x) - length(pin.position) + time) * floor(cPetals)) * cRadius) + cOffset;\r\nfloat t = cIntensity / abs(u - length(pin.position));\r\nt = pow(abs(t), cPowerExponent);\r\npout.color = vec3(t);";

var flowerFunFragPars = "uniform float cPetals;\r\nuniform float cRadius;\r\nuniform float cOffset;\r\nuniform float cIntensity;\r\nuniform float cPowerExponent;";

const flowerFunUniforms = {
	cPetals: { value: 6.0 },
	cRadius: { value: 0.5 },
	cOffset: { value: 0.2 },
	cIntensity: { value: 0.1 },
	cPowerExponent: { value: 1.0 },
};

const flowerUniforms = {
	cPetals: { value: 6.0 },
	cRadius: { value: 0.5 },
	cIntensity: { value: 0.1 },
	cPowerExponent: { value: 1.0 },
};

var frag = "  PSInput pin;\r\n  // [-1,1]\r\n  pin.position = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\r\n  pin.mouse = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);\r\n  // [0,scrx]\r\n  pin.coord = gl_FragCoord.xy;\r\n  // [0,1]\r\n  pin.uv = gl_FragCoord.xy / resolution;\r\n  // [-0.5,0.5]\r\n  // = (gl_FragCoord.xy - 0.5*resolution.xy) / min(resolution.x, resolution.y)\r\n  // = pin.position*0.5\r\n\r\n  PSOutput pout;\r\n  pout.color = vec3(0.0);\r\n  pout.opacity = 1.0;";

var fragEnd = "gl_FragColor = vec4(pout.color, pout.opacity);";

var fragPars = "uniform vec2 resolution;\r\nuniform vec2 mouse;\r\nuniform float time;\r\nuniform vec3 cameraPos;\r\nuniform vec3 cameraDir;\r\nuniform sampler2D tDiffuse;";

var glsl3Frag = "precision mediump sampler2DArray;\r\n#define varying in\r\nlayout(location = 0) out highp vec4 outFragColor;\r\n#define gl_FragColor outFragColor\r\n#define gl_FragDepthEXT gl_FragDepth\r\n#define texture2D texture\r\n#define textureCube texture\r\n#define texture2DProj textureProj\r\n#define texture2DLodEXT textureLod\r\n#define texture2DProjLodEXT textureProjLod\r\n#define textureCubeLodEXT textureLod\r\n#define texture2DGradEXT textureGrad\r\n#define texture2DProjGradEXT textureProjGrad\r\n#define textureCubeGradEXT textureGrad\r\nprecision highp float;\r\nprecision highp int;\r\n#define HIGH_PRECISION";

var glsl3Vert = "precision mediump sampler2DArray;\r\n#define attribute in\r\n#define varying out\r\n#define texture2D texture\r\nprecision highp float;\r\nprecision highp int;\r\n#define HIGH_PRECISION";

var gradationFrag = "float len = length(cDirection);\r\nif (len == 0.0) {\r\n  pout.color = vec3(1.0);\r\n} else {\r\n  vec2 n = normalize(cDirection);\r\n  vec2 pos = pin.position - (-cDirection);\r\n  float t = (dot(pos, n) * 0.5) / len;\r\n  t = pow(t, cPowerExponent);\r\n  pout.color = vec3(t);\r\n}";

var gradationFragPars = "uniform vec2 cDirection;\r\nuniform float cPowerExponent;";

var gradationLineFrag = "float len = length(cDirection);\r\nif (len == 0.0) {\r\n  pout.color = vec3(1.0);\r\n} else {\r\n  vec2 n = normalize(cDirection);\r\n  vec2 pos = pin.position - (-cDirection);\r\n  float t = (dot(pos, n) * 0.5 + cOffset) / len;\r\n  float r = rand(vec2(pin.uv.x, 0.0)) + 1e-6;\r\n  float a = 1.0 / (1.0 - r);\r\n  t = a*t - a*r;\r\n  t = pow(t, cPowerExponent);\r\n  pout.color = vec3(t);\r\n}";

var gradationLineFragPars = "uniform vec2 cDirection;\r\nuniform float cPowerExponent;\r\nuniform float cOffset;";

const gradationLineUniforms = {
	cDirection: { value: new THREE$1.Vector2(0.0, 1.0) },
	cPowerExponent: { value: 1.0 },
	cOffset: { value: 0.0 },
};

const gradationUniforms = {
	cDirection: { value: new THREE$1.Vector2( 0.0, 1.0 ) },
	cPowerExponent: { value: 1.0 },
};

var gradient = "// http://g3d.cs.williams.edu/websvn/filedetails.php?repname=g3d&path=%2FG3D10%2Fdata-files%2Fshader%2Fgradient.glsl\r\nvec3 hueGradient(float t) {\r\n  vec3 p = abs(fract(t+vec3(1.0,2.0/3.0,1.0/3.0))*6.0 - 3.0);\r\n  return clamp(p-1.0, 0.0, 1.0);\r\n}\r\n\r\nvec3 techGradient(float t) {\r\n  return pow(vec3(t+0.01), vec3(120.0, 10.0, 180.0));\r\n}\r\n\r\nvec3 fireGradient(float t) {\r\n  return max(pow(vec3(min(t*1.02,1.0)), vec3(1.7,25.0,100.0)),\r\n             vec3(0.06 * pow(max(1.0 - abs(t-0.35), 0.0), 5.0)));\r\n}\r\n\r\nvec3 desertGradient(float t) {\r\n  float s = sqrt(clamp(1.0 - (t - 0.4) / 0.6, 0.0, 1.0));\r\n  vec3 sky = sqrt(mix(vec3(1, 1, 1), vec3(0, 0.8, 1.0), smoothstep(0.4, 0.9, t)) * vec3(s, s, 1.0));\r\n  vec3 land = mix(vec3(0.7, 0.3, 0.0), vec3(0.85, 0.75 + max(0.8 - t * 20.0, 0.0), 0.5), pow2(t / 0.4));\r\n  return clamp((t > 0.4) ? sky : land, 0.0, 1.0) * clamp(1.5 * (1.0 - abs(t - 0.4)), 0.0, 1.0);\r\n}\r\n\r\nvec3 electricGradient(float t) {\r\n  return clamp( vec3(t * 8.0 - 6.3, pow2(smoothstep(0.6, 0.9, t)), pow(t, 3.0) * 1.7), 0.0, 1.0);\r\n}\r\n\r\nvec3 neonGradient(float t) {\r\n  return clamp(vec3(t * 1.3 + 0.1, pow2(abs(0.43 - t) * 1.7), (1.0 - t) * 1.7), 0.0, 1.0);\r\n}\r\n\r\nvec3 heatmapGradient(float t) {\r\n  return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);\r\n}\r\n\r\nvec3 rainbowGradient(float t) {\r\n  vec3 c = 1.0 - pow(abs(vec3(t) - vec3(0.65, 0.5, 0.2)) * vec3(3.0, 3.0, 5.0), vec3(1.5, 1.3, 1.7));\r\n  c.r = max((0.15 - pow2(abs(t - 0.04) * 5.0)), c.r);\r\n  c.g = (t < 0.5) ? smoothstep(0.04, 0.45, t) : c.g;\r\n  return clamp(c, 0.0, 1.0);\r\n}\r\n\r\nvec3 brightnessGradient(float t) {\r\n  return vec3(t * t);\r\n}\r\n\r\nvec3 grayscaleGradient(float t) {\r\n  return vec3(t);\r\n}\r\n\r\nvec3 stripeGradient(float t) {\r\n  return vec3(mod(floor(t * 32.0), 2.0) * 0.2 + 0.8);\r\n}\r\n\r\nvec3 ansiGradient(float t) {\r\n  return mod(floor(t * vec3(8.0, 4.0, 2.0)), 2.0);\r\n}";

var gradientNoiseFrag = "vec2 uv = pin.uv * cNoiseScale * 10.0;\r\nvec3 p = normal(vec3(uv, time), 0.01);\r\np = (p + vec3(1.0)) * 0.5;\r\nvec3 gray = vec3(rgb2gray(p));\r\npout.color = mix(gray, p, cColor);\r\n\r\nfloat graph = gray.x;";

var gradientNoiseFragPars = "uniform float cNoiseScale;\r\nuniform float cColor;\r\nvec3 normal(vec3 v, float delta) {\r\n  vec2 coefficient = vec2(\r\n    snoise(v + vec3(delta, 0.0, 0.0)) - snoise(v - vec3(delta, 0.0, 0.0)),\r\n    snoise(v + vec3(0.0, delta, 0.0)) - snoise(v - vec3(0.0, delta, 0.0))) / delta;\r\n  coefficient *= 0.3;\r\n  vec3 req = vec3(-coefficient.x, -coefficient.y, 1.0);\r\n  return req / length(req);\r\n}";

const gradientNoiseUniforms = {
	cNoiseScale: { value: 1.0 },
	cColor: { value: 1.0 },
};

var grungeFrag = "vec2 p = pin.uv;\r\nfloat pixelSize = 1.0;\r\nfloat dx = mod(p.x, pixelSize) - pixelSize*0.5;\r\nfloat dy = mod(p.y, pixelSize) - pixelSize*0.5;\r\np.x -= dx;\r\np.y -= dy;\r\nvec3 col = texture2D(tGrunge, mix(3.0, 0.1, cScale) * pin.uv + vec2(time*0.1)).rgb;\r\nfloat bright = 0.3333*(col.r + col.g + col.b);\r\nfloat dist = sqrt(dx*dx + dy*dy);\r\nfloat rad = bright * pixelSize * 0.8 * cRadius;\r\nfloat m = step(dist, rad);\r\npout.color = mix(vec3(0.0), vec3(1.0), m);";

var grungeFragPars = "uniform sampler2D tGrunge;\r\nuniform float cRadius;\r\nuniform float cScale;";

const grungeUniforms = {
	tGrunge: { value: null },
	cRadius: { value: 1.0 },
	cScale: { value: 1.0 },
};

var height2NormalFrag = "//   // Determine the offsets\r\n//   vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);\r\n//   \r\n//   // Take three samples to determine two vectors that can be\r\n//   // use to generate the normal at this pixel\r\n//   float h0 = texture2D(tDiffuse, pin.uv).r;\r\n//   float h1 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).r;\r\n//   float h2 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).r;\r\n//   \r\n//   vec3 v01 = vec3(vPixelSize.xy, h1-h0);\r\n//   vec3 v02 = vec3(vPixelSize.yx, h2-h0);\r\n//   vec3 n = cross(v01, v02);\r\n//   \r\n//   // Can be useful to scale the Z component to tweak the\r\n//   // amount bumps show up, less than 1.0 will make them\r\n//   // more apparent, greater than 1.0 will smooth them out\r\n//   n.z *= 0.5;\r\n//   \r\n//   pout.color = n;\r\n\r\nconst vec2 size = vec2(2.0, 0.0);\r\nvec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);\r\nfloat s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;\r\nfloat s21 = texture2D(tDiffuse, pin.uv + vPixelSize.zy).x;\r\nfloat s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;\r\nfloat s12 = texture2D(tDiffuse, pin.uv + vPixelSize.yz).x;\r\nvec3 va = normalize(vec3(size.xy,(s21-s01)*cHeightScale));\r\nvec3 vb = normalize(vec3(size.yx,(s10-s12)*cHeightScale));\r\nvec3 n = cross(va,vb);\r\npout.color = n*0.5 + 0.5;\r\n\r\n// THREE.JS (NormalMapShader.js)\r\n// vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);\r\n// float s11 = texture2D(tDiffuse, pin.uv).x;\r\n// float s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;\r\n// float s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;\r\n// vec3 n = normalize(vec3((s11-s10) * heightScale, (s11-s01)*heightScale, 2.0));\r\n// pout.color = n*0.5 + 0.5;\r\n\r\n// vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);\r\n// float s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;\r\n// float s21 = texture2D(tDiffuse, pin.uv + vPixelSize.zy).x;\r\n// float s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;\r\n// float s12 = texture2D(tDiffuse, pin.uv + vPixelSize.yz).x;\r\n// vec3 n = normalize(vec3((s11-s10) * heightScale, (s11-s01)*heightScale, 2.0));\r\n// pout.color = n*0.5 + 0.5;";

var height2NormalFragPars = "uniform float cHeightScale;";

var height2NormalSobelFrag = "vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);\r\n\r\n\r\n\r\n// Use of the sobel filter requires the eight samples\r\n// surrounding the current pixel:\r\nfloat h00 = texture2D( tDiffuse, pin.uv + vPixelSize.zz ).r;\r\nfloat h10 = texture2D( tDiffuse, pin.uv + vPixelSize.yz ).r;\r\nfloat h20 = texture2D( tDiffuse, pin.uv + vPixelSize.xz ).r;\r\n\r\nfloat h01 = texture2D( tDiffuse, pin.uv + vPixelSize.zy ).r;\r\nfloat h21 = texture2D( tDiffuse, pin.uv + vPixelSize.xy ).r;\r\n\r\nfloat h02 = texture2D( tDiffuse, pin.uv + vPixelSize.zx ).r;\r\nfloat h12 = texture2D( tDiffuse, pin.uv + vPixelSize.yx ).r;\r\nfloat h22 = texture2D( tDiffuse, pin.uv + vPixelSize.xx ).r;\r\n\r\n// The Sobel X kernel is:\r\n//\r\n// [ 1.0  0.0  -1.0 ]\r\n// [ 2.0  0.0  -2.0 ]\r\n// [ 1.0  0.0  -1.0 ]\r\n\r\nfloat Gx = h00 - h20 + 2.0 * h01 - 2.0 * h21 + h02 - h22;\r\n\t\t\t\r\n// The Sobel Y kernel is:\r\n//\r\n// [  1.0    2.0    1.0 ]\r\n// [  0.0    0.0    0.0 ]\r\n// [ -1.0   -2.0   -1.0 ]\r\n\r\nfloat Gy = h00 + 2.0 * h10 + h20 - h02 - 2.0 * h12 - h22;\r\n\r\n// Generate the missing Z component - tangent\r\n// space normals are +Z which makes things easier\r\n// The 0.5f leading coefficient can be used to control\r\n// how pronounced the bumps are - less than 1.0 enhances\r\n// and greater than 1.0 smoothes.\r\nfloat Gz = 0.5 * sqrt( 1.0 - Gx * Gx - Gy * Gy );\r\n\r\n// Make sure the returned normal is of unit length\r\nvec3 n = normalize( vec3( cHeightScale * Gx, cHeightScale * Gy, Gz ) );\r\n\r\n// Encode\r\npout.color = n*0.5 + 0.5;";

const height2NormalUniforms = {
	cHeightScale: { value: 10.0 },
};

var inksplatFrag = "// vec2 uv = 12.0 * (pin.coord - 0.5*resolution.xy) / resolution.x;\r\n// float v = length(uv);\r\n// vec2 h = vec2(ceil(3.0*time));\r\n// float a, w;\r\n// \r\n// // lines\r\n// for (int i=0; i<21; i++) {\r\n//   h = splatHash(h);\r\n//   w = 0.03;\r\n//   a = (atan(uv.x, uv.y)+3.14)/6.28*(1.0+w);\r\n//   v -= sin(smoothstep(h.x, h.x+w, a)*3.14);\r\n// }\r\n// \r\n// // spots\r\n// for (float s = 3.0; s>0.5; s -= 0.04) {\r\n//   h = (splatHash(h)*2.0-1.0)*s;\r\n//   v -= (1.01-smoothstep(0.0,0.5*(3.0-s), length(uv-h)));\r\n// }\r\n\r\nvec3 xyz = fwidth(vec3(0,0,0));\r\nvec2 uv = 6.0*pin.position;\r\nfloat v = splat(splat_uv(pin.coord));\r\n// float w = 0.75 * splat_fwidth(pin.coord, v);\r\nfloat w = 0.75*fwidth(v);\r\nv = 1.0 - smoothstep(-w,w,v);\r\npout.color = vec3(v,v,v);\r\n";

var inksplatFragPars = "uniform int cSplatLines;\r\nuniform float cSplatSpotStep;\r\n\r\nvec2 splatHash(in vec2 p) {\r\n  return fract(sin(p*mat2(63.31,127.63,395.467,213.799))*43141.59265);\r\n}\r\n\r\nfloat splat(in vec2 p) {\r\n  float v = length(p);\r\n  vec2 h = vec2(ceil(3.0*time));\r\n  float a, w;\r\n\r\n  // lines\r\n  for (int i=0; i<100; i++) {\r\n    if (i>=cSplatLines) break;\r\n    h = splatHash(h);\r\n    w = 0.03;\r\n    a = (atan(p.x, p.y)+3.14)/6.28*(1.0+w);\r\n    v -= sin(smoothstep(h.x, h.x+w, a)*3.14);\r\n  }\r\n\r\n  // spots\r\n  // for (float s = 3.0; s>0.5; s -= cSplatSpotStep) {\r\n  float s = 3.0;\r\n  for (int i=0; i<100; i++) {\r\n    h = (splatHash(h)*2.0-1.0)*s;\r\n    v -= (1.01-smoothstep(0.0,0.5*(3.0-s), length(p-h)));\r\n    s -= cSplatSpotStep;\r\n    if (s <= 0.5) break;\r\n  }\r\n  \r\n  return v;\r\n}\r\n\r\nvec2 splat_uv(in vec2 coord) {\r\n  return 8.0 * (coord - 0.5*resolution.xy) / min(resolution.x, resolution.y);\r\n}\r\n\r\nfloat splat_fwidth(in vec2 coord, in float v11) {\r\n  float v10 = splat(splat_uv(coord + vec2(0.0,1.0)));\r\n  float v01 = splat(splat_uv(coord + vec2(-1.0,0.0)));\r\n  return abs(v11-v01) + abs(v10-v11);\r\n}\r\n";

const inksplatUniforms = {
	cSplatLines: { value: 20 },
	cSplatSpotStep: { value: 0.04 },
};

var julia = "int j=0;\r\nvec2 x = vec2(-0.345, 0.654);\r\nvec2 y = vec2(time * 0.005, 0.0);\r\nvec2 z = pin.position;\r\n\r\nfor (int i=0; i<360; i++) {\r\n  j++;\r\n  if (length(z) > 2.0) break;\r\n  z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + x + y;\r\n}\r\n\r\nfloat h = abs(mod(time * 15.0 - float(j), 360.0) / 360.0);\r\nvec3 color = hsv2rgb(vec3(h, 1.0, 1.0));\r\n\r\nfloat t = float(j) / 360.0;\r\npout.color = color * t;";

var kochCurveFrag = "// https://www.shadertoy.com/view/XdcGzH\r\nAngle = 90.0 * 0.5 * (1.0 + sin(time + 0.1 * PI));\r\nfloat ang = A2B * Angle;\r\nca = cos(ang);\r\nsa = sin(ang);\r\ncsa = vec2(ca, -sa);\r\nlambda = 0.5 / (ca*ca);\r\nlscl = 2.0 / lambda;\r\n\r\nconst float scaleFactor = 1.4;\r\nvec2 uv = scaleFactor * (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;\r\nuv.y += 0.5;\r\npout.color = color(uv);";

var kochCurveFragPars = "// https://www.shadertoy.com/view/XdcGzH\r\n#define A2B PI/360.0\r\n#define MaxIter 14\r\n\r\nconst float DRadius = 0.7;\r\nconst float Width = 1.4;\r\nconst float Gamma = 2.2;\r\nconst vec3 BackgroundColor = vec3(1.0);\r\nconst vec3 CurveColor = vec3(0.0);\r\n\r\nfloat lambda, ca, sa, lscl;\r\nfloat aaScale;\r\nfloat Angle = 60.0;\r\nvec2 csa;\r\n\r\nfloat d2hline(vec2 p) {\r\n  float t = max(-1.0, min(1.0, p.x));\r\n  p.x -= t;\r\n  return length(p);\r\n}\r\n\r\nfloat DE(vec2 p) {\r\n  float d = 1.0;\r\n  float r = dot(p,p);\r\n  for (int i=0; i<MaxIter; i++) {\r\n    p.x = abs(p.x);\r\n    p.x -= 1.0 - lambda;\r\n    float t = 2.0 * min(0.0, dot(p, csa));\r\n    p -= csa * t;\r\n    p.x -= lambda;\r\n    p *= lscl;\r\n    d *= lscl;\r\n    p.x += 1.0;\r\n    r = dot(p,p);\r\n  }\r\n  return d2hline(p) / d; // length(p)-1.0;\r\n}\r\n\r\nfloat coverageFunction(float t) {\r\n// this function returns the area of the part of the unit disc that is at the right of the vertical line x=t.\r\n// the exact coverage function is:\r\n// t = clamp(t, -1.0, 1.0); return (acos(t) - t*sqrt(1.0 - t*t)) / PI;\r\n// this is a good approximation\r\n  return 1.0 - smoothstep(-1.0, 1.0, t);\r\n// a better approximiation\r\n// t = clamp(t, -1.0, 1.0); return (t*t*t*t-5.0)*t*1.0/8.0+0.5; // but there is no virtual difference\r\n}\r\n\r\nfloat coverageLine(float d, float lineWidth, float pixsize) {\r\n  d = d * 1.0 / pixsize;\r\n  float v1 = (d-0.5*lineWidth)/DRadius;\r\n  float v2 = (d+0.5*lineWidth)/DRadius;\r\n  return coverageFunction(v1) - coverageFunction(v2);\r\n}\r\n\r\nvec3 color(vec2 pos) {\r\n  float pixsize = dFdx(pos.x);\r\n  float v = coverageLine(abs(DE(pos)), Width, pixsize);\r\n  return pow(mix(pow(BackgroundColor, vec3(Gamma)), pow(CurveColor, vec3(Gamma)), v), vec3(1.0 / Gamma));\r\n}";

var laser2Frag = "// http://glslsandbox.com/e#37112.0\r\n\r\n// float dist = -Capsule(pin.position, vec2(1.0, 0), .25);\r\n// dist = 1.0 - pow(dist, 2.0) * 4.0;\r\n// if (abs(pin.position.y) < laserInnerWidth) {\r\n//   float t = dist * abs(pin.position.y) / laserInnerWidth + 0.5;\r\n//   dist = clamp(t, 0.0, dist);\r\n// }\r\n\r\nfloat dist = cWidth / abs(pin.position.x);\r\ndist = clamp(pow(dist, 10.0), 0.0, 1.0);\r\n\r\nfloat d2 = (0.1 * cInnerWidth) / abs(pin.position.x);\r\ndist -= clamp(pow(d2, 2.0), 0.0, 1.0) * 0.5;\r\n\r\n// vec3 c = vec3(dist*0.1, dist*0.4, dist*0.8);\r\n// pout.color = mix(vec3(dist), c, laserColor);\r\npout.color = vec3(dist);";

var laser2FragPars = "uniform float cWidth;\r\nuniform float cInnerWidth;\r\n// \r\n// float Capsule(vec2 p, vec2 a, float r) {\r\n//   vec2 pa = p - a, ba = -a*2.0;\r\n//   float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);\r\n//   return length(pa - ba*h) - r;\r\n// }\r\n";

const laser2Uniforms = {
	cWidth: { value: 0.5 },
	cInnerWidth: { value: 0.4 },
};

var laserFrag = "// http://glslsandbox.com/e#26951.0\r\n\r\nfloat t = abs(cWidth / (sin(pin.position.x + sin(pin.position.y*0.0) * pin.position.y) * 5.0));\r\nt -= (1.0 - abs(cWidth / (sin(pin.position.x) * 0.5))) * 4.0;\r\nvec3 c = vec3(t*0.1, t*0.4, t*0.8);\r\nvec3 g = vec3(rgb2gray(c));\r\npout.color = mix(g, c, cColor);";

var laserFragPars = "uniform float cWidth;\r\nuniform float cColor;";

const laserUniforms = {
	cWidth: { value: 0.4 },
	cColor: { value: 1.0 },
};

var lensFlareFrag = "// http://glslsandbox.com/e#36072.2\r\n\r\nvec2 uv = pin.uv;\r\nfloat tt = cRadius / abs(distance(uv, vec2(0.5)) * zoom);\r\nfloat v = cRange / abs(length((vec2(0.5) - pin.uv) * vec2(0.03, 1.0)) * (zoom * 10.0));\r\n\r\nvec3 finalColor = tex2D(uv) * 0.5 * cRadius;\r\ntt = pow(tt, cPowerExponent);\r\nv = pow(v, cPowerExponent);\r\nfinalColor += vec3(2.0 * tt, 4.0 * tt, 8.0 * tt);\r\nfinalColor += vec3(2.0 * v, 4.0 * v, 8.0 * v);\r\n\r\nfloat x;\r\n\r\n// ghost\r\n\r\n// uv = pin.uv - 0.5;\r\n// x = length(uv);\r\n// uv *= pow(x, 4.0) * -100.0 + 1.0 / (x-0.5);\r\n// uv = clamp(uv + 0.5, 0.0, 1.0);\r\n// finalColor += tex2D(uv);\r\n\r\n// ghost with double chroma\r\n// uv = pin.uv - 0.5;\r\n// x = length(uv);\r\n// uv *= pow(x, 16.0) * -1000000.0 + 0.2 / (x-0.3);\r\n// uv = clamp(uv + 0.5, 0.0, 1.0);\r\n// finalColor += tex2D(uv);\r\n\r\n// chroma\r\n// uv = pin.uv - 0.5;\r\n// x = length(uv);\r\n// uv *= pow(x, 16.0) * -20000.0 + 0.2 / (x*x+5.0);\r\n// uv = clamp(uv + 0.5, 0.0, 1.0);\r\n// finalColor += tex2D(uv);\r\n\r\n// double chroma\r\n// uv = pin.uv - 0.5;\r\n// x = length(uv);\r\n// uv *= pow(x, 16.0) * -10000.0 + 0.2 / (x*x);\r\n// uv = clamp(uv + 0.5, 0.0, 1.0);\r\n// finalColor += tex2D(uv);\r\n\r\nvec2 D = 0.5 - pin.uv;\r\nvec3 o = vec3(-D.x * 0.4, 0.0, D.x * 0.4);\r\nvec3 lx = vec3(0.01, 0.01, 0.3);\r\nvec2 S = pin.uv - 0.5;\r\nvec2 m = 0.5 * S;\r\nm.xy *= pow(4.0 * length(S), 1.0);\r\nm.xy *= -2.0;\r\nm.xy = 0.5 + m.xy;\r\n\r\nvec3 e = tex2D(m.xy);\r\nS = (m.xy - 0.5) * 1.75;\r\ne *= clamp(1.0 - dot(S,S), 0.0, 1.0);\r\n\r\nfloat n = max(e.x, max(e.y, e.z)), c = n / (1.0 + n);\r\ne.xyz *= c;\r\nfinalColor += e;\r\n\r\nvec3 gray = vec3(rgb2gray(finalColor));\r\npout.color = mix(gray, finalColor, cColor);";

var lensFlareFragPars = "// http://glslsandbox.com/e#36072.2\r\n\r\nuniform float cRadius;\r\nuniform float cRange;\r\nuniform float cColor;\r\nuniform float cPowerExponent;\r\n\r\n#define dist 0.05\r\n#define zoom 100.0\r\n\r\nvec3 tex2D(vec2 uv) {\r\n  if (uv.x == 0.0 || uv.y == 0.0 || uv.x == 1.0 || uv.y == 1.0) return vec3(0.0);\r\n  float d = distance(uv, vec2(0.5));\r\n  if (d >= dist) return vec3(0.0);\r\n  return vec3(0.2 * ((dist - d)/dist), 0.4 * ((dist-d) / dist), 0.8 * ((dist-d) / dist));\r\n}";

const lensFlareUniforms = {
	cRadius: { value: 1.0 },
	cRange: { value: 1.0 },
	cColor: { value: 0.0 },
	cPowerExponent: { value: 1.0 },
};

var lightFrag = "// http://glslsandbox.com/e#30670.0\r\n\r\nfloat size = 200.0 * cRadius;\r\nfloat lum = size/length(pin.coord - resolution*0.5);\r\nvec3 c = vec3(lum, pow(max(lum*0.9,0.0), 2.0)*0.4, pow(max(lum*0.8, 0.0), 3.0)*0.15);\r\nc = pow(c, vec3(cPowerExponent));\r\nvec3 g = vec3(rgb2gray(c));\r\npout.color = mix(g, c, cColor);";

var lightFragPars = "uniform float cRadius;\r\nuniform float cPowerExponent;\r\nuniform float cColor;";

var lightningFrag = "// http://glslsandbox.com/e#36774.0\r\nvec2 uv = pin.uv * 2.0111 - 1.5;\r\n\r\nvec3 finalColor = vec3(0.0);\r\nfor (int i=0; i<3; ++i) {\r\n  float amp = 80.0 + float(i) * 5.0;\r\n  float period = 0.4;\r\n  float thickness = mix(0.9, 1.0, noise(uv*10.0));\r\n  float t = abs(cWidth / (sin(uv.x + fbm(uv * cFrequency + 4.0*time*period)) * amp) * thickness);\r\n//   float show = fract(abs(sin(time))) >= 0.0 ? 1.0 : 0.0;\r\n//   finalColor += t * vec3(0.2, 0.2, 1.0);\r\n  finalColor += t * vec3(0.1) * cIntensity;\r\n}\r\n\r\npout.color = finalColor;";

var lightningFragPars = "// http://glslsandbox.com/e#36774.0\r\nuniform float cIntensity;\r\nuniform float cFrequency;\r\nuniform float cWidth;\r\n\r\nfloat hash(vec2 p) {\r\n  return fract(sin(dot(vec3(p.xy,1.0), vec3(37.1, 61.7, 12.4))) * 3758.5453123);\r\n}\r\n\r\nfloat noise(in vec2 p) {\r\n  vec2 i = floor(p);\r\n  vec2 f = fract(p);\r\n  f *= f * (3.0 - 2.0 * f);\r\n  return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), f.x),\r\n             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x),\r\n             f.y);\r\n}\r\n\r\nfloat fbm(vec2 p) {\r\n  float v = 0.0;\r\n  v += noise(p*1.0) * 0.5;\r\n  v += noise(p*2.0) * 0.25;\r\n  v += noise(p*4.0) * 0.125;\r\n  return v;\r\n}";

const lightningUniforms = {
	cIntensity: { value: 1.0 },
	cFrequency: { value: 1.0 },
	cWidth: { value: 7.0 },
};

const lightUniforms = {
	cRadius: { value: 1.0 },
	cPowerExponent: { value: 1.0 },
	cColor: { value: 1.0 },
};

var magicCircleFrag = "// http://glslsandbox.com/e#36354.1\r\npout.color = scene(pin.position);";

var magicCircleFragPars = "// http://glslsandbox.com/e#36354.1\r\nvec2 rotate(vec2 p, float rad) {\r\n  mat2 m = mat2(cos(rad), sin(rad), -sin(rad), cos(rad));\r\n  return m * p;\r\n}\r\n\r\nvec2 translate(vec2 p, vec2 diff) {\r\n  return p - diff;\r\n}\r\n\r\nvec2 scale(vec2 p, float r) {\r\n  return p * r;\r\n}\r\n\r\nfloat circle(float pre, vec2 p, float r1, float r2, float power) {\r\n  float l = length(p);\r\n  if (r1 < l && l < r2) pre = 0.0;\r\n  float d = min(abs(l-r1), abs(l-r2));\r\n  float res = power / d;\r\n  return clamp(pre + res, 0.0, 1.0);\r\n}\r\n\r\n// https://www.shadertoy.com/view/4dfXDn\r\n// float triangle(float pre, vec2 p, float width, float height, float power) {\r\n//   vec2 n = normalize(vec2(height, width/2.0));\r\n//   float d = max(abs(p).x * n.x + p.y * n.y - (height * n.y), -p.y);\r\n//   float res = power / d;\r\n//   return clamp(pre + res, 0.0, 1.0);\r\n// }\r\n\r\nfloat rectangle(float pre, vec2 p, vec2 half1, vec2 half2, float power) {\r\n  p = abs(p);\r\n  if ((half1.x < p.x || half1.y < p.y) && (p.x < half2.x && p.y < half2.y)) {\r\n    pre = max(0.01, pre);\r\n  }\r\n  float dx1 = (p.y < half1.y) ? abs(half1.x - p.x) : length(p - half1);\r\n  float dx2 = (p.y < half2.y) ? abs(half1.x - p.x) : length(p - half2);\r\n  float dy1 = (p.x < half1.x) ? abs(half1.y - p.y) : length(p - half1);\r\n  float dy2 = (p.x < half2.x) ? abs(half1.y - p.y) : length(p - half2);\r\n  float d = min(min(dx1, dx2), min(dy1, dy2));\r\n  float res = power / d;\r\n  return clamp(pre + res, 0.0, 1.0);\r\n}\r\n\r\nfloat radiation(float pre, vec2 p, float r1, float r2, int num, float power) {\r\n  float angle = 2.0 * PI / float(num);\r\n  float d = 1e10;\r\n  for (int i=0; i<360; i++) {\r\n    if (i >= num) break;\r\n    float _d = (r1 < p.y && p.y < r2) ? abs(p.x) : min(length(p-vec2(0.0, r1)), length(p-vec2(0.0, r2)));\r\n    d = min(d, _d);\r\n    p = rotate(p, angle);\r\n  }\r\n  float res = power / d;\r\n  return clamp(pre + res, 0.0, 1.0);\r\n}\r\n\r\nvec3 scene(vec2 p) {\r\n  float dest = 0.0;\r\n  p = scale(p, sin(PI*time/1.0) * 0.02+1.1);\r\n\r\n// frame\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, time * PI / 6.0);\r\n  dest = circle(dest, q, 0.85, 0.9, 0.006);\r\n  dest = radiation(dest, q, 0.87, 0.88, 36, 0.0008);\r\n }\r\n\r\n// outer rectangles\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, time * PI / 6.0);\r\n  const int n = 6;\r\n  float angle = PI / float(n);\r\n  q = rotate(q, floor(atan(q.x, q.y) / angle + 0.5) * angle);\r\n  for (int i=0; i<n; i++) {\r\n    dest = rectangle(dest, q, vec2(0.85/sqrt(2.0)), vec2(0.85/sqrt(2.0)), 0.0015);\r\n    q = rotate(q, angle);\r\n  }\r\n }\r\n\r\n// circles on frame\r\n//  {\r\n//   vec2 q = p;\r\n//   q = rotate(q, time * PI / 6.0);\r\n//   const int n = 12;\r\n//   q = rotate(q, 2.0 * PI / float(n) / 2.0);\r\n//   float angle = 2.0 * PI / float(n);\r\n//   for (int i=0; i<n; i++) {\r\n//     dest = circle(dest, q-vec2(0.0, 0.875), 0.001, 0.05, 0.004);\r\n//     dest = circle(dest, q-vec2(0.0, 0.875), 0.001, 0.001, 0.008);\r\n//     q = rotate(q, angle);\r\n//   }\r\n//  }\r\n\r\n// inner circles\r\n {\r\n   vec2 q = p;\r\n   dest = circle(dest, q, 0.5, 0.55, 0.002);\r\n }\r\n\r\n// inner rectangles\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, -time * PI / 6.0);\r\n  const int n = 3;\r\n  float angle = PI / float(n);\r\n  q = rotate(q, floor(atan(q.x, q.y) / angle + 0.5) * angle);\r\n  for (int i=0; i<n; i++) {\r\n    dest = rectangle(dest, q, vec2(0.36, 0.36), vec2(0.36, 0.36), 0.0015);\r\n    q = rotate(q, angle);\r\n  }\r\n }\r\n\r\n// circles on inner circle\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, -time * PI / 6.0);\r\n  const int n = 12;\r\n  q = rotate(q, 2.0 * PI / float(n) / 2.0);\r\n  float angle = 2.0 * PI / float(n);\r\n  for (int i=0; i<n; i++) {\r\n    dest = circle(dest, q-vec2(0.0, 0.53), 0.001, 0.035, 0.004);\r\n    dest = circle(dest, q-vec2(0.0, 0.53), 0.001, 0.001, 0.001);\r\n    q = rotate(q, angle);\r\n  }\r\n }\r\n\r\n// dots\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, time * PI / 6.0);\r\n  dest = radiation(dest, q, 0.25, 0.3, 12, 0.005);\r\n }\r\n\r\n// triangles\r\n//  {\r\n//   vec2 q = p;\r\n//   q = rotate(q, -time * PI / 6.0);\r\n//   dest = triangle(dest, q, 0.2, 0.2, 0.005);\r\n//   q = rotate(q, PI);\r\n//   dest = triangle(dest, q, 0.2, 0.2, 0.005);\r\n//  }\r\n\r\n// rectangle\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, -time * PI / 6.0);\r\n  const int n = 3;\r\n  float angle = PI / float(n);\r\n  q = rotate(q, floor(atan(q.x, q.y) / angle + 0.5) * angle);\r\n  for (int i=0; i<n; i++) {\r\n    dest = rectangle(dest, q, vec2(0.15, 0.15), vec2(0.15, 0.15), 0.0015);\r\n    q = rotate(q, angle);\r\n  }\r\n }\r\n\r\n// dots\r\n {\r\n  vec2 q = p;\r\n  q = rotate(q, time * PI / 6.0);\r\n  dest = radiation(dest, q, 0.1, 0.1, 12, 0.005);\r\n }\r\n\r\n// rings\r\n//  {\r\n//   vec2 q = p;\r\n//   q = scale(q, sin(PI * time / 1.0) * 0.04 + 1.1);\r\n//   q = rotate(q, -time * PI / 6.0);\r\n//   for (float i=0.0; i<6.0; i++) {\r\n//     float r = 0.13 - i*0.01;\r\n//     q = translate(q, vec2(0.1, 0.0));\r\n//     dest = circle(dest, q, r, r, 0.002);\r\n//     q = translate(q, -vec2(0.1, 0.0));\r\n//     q = rotate(q, -time * PI / 12.0);\r\n//   }\r\n//   dest = circle(dest, q, 0.04, 0.04, 0.004);\r\n//  }\r\n\r\n//   return pow(dest, 2.5) * vec3(1.0, 0.95, 0.8);\r\n  return vec3(pow(dest, 2.5));\r\n}";

var mandalasFrag = "// https://www.shadertoy.com/view/4tdSDr\r\n\r\n#define S 4\r\nvec2 I = pin.coord;\r\nvec2 R = resolution;\r\nI = I+I-R;\r\nvec4 O = vec4(1.0,1.0,0.0,0.0);\r\nmat2 M;\r\nfor (int i=0; i<S+S; i++) {\r\n  M = mat2(O.y=cos(O.x=acos(-1.0)*float(i)/float(S)), O.z=sin(O.x), -O.z,O.y);\r\n  I *= M;\r\n  O.a = max(O.a, calc((I+R)/(R+R)));\r\n}\r\npout.color = O.aaa;";

var mandaraFrag = "// https://www.shadertoy.com/view/MtcSz4\r\n\r\nvec2 p = pin.position * 0.7;\r\nvec2 f = vec2(length(p), atan(p.y, p.x));\r\nfloat T0 = cos(0.3*time);\r\nfloat T1 = 0.5 + 0.5*T0;\r\nfloat T2 = sin(0.15*time);\r\n\r\nfloat m0 = 0.0;\r\nfloat m1 = 0.0;\r\nfloat m2 = 0.0;\r\nfloat m3 = 0.0;\r\nfloat m4 = 0.0;\r\n\r\nif (f.x < cRadius) {\r\n  f.y += 0.1 * time;\r\n  vec2 c;\r\n  vec2 f2;\r\n\r\n  c = vec2(0.225 -0.1*T0, PI/4.0);\r\n  if (f.x < 0.25) {\r\n    for (float i=0.0; i<2.0; ++i) {\r\n      f2 = mod(f,c)-0.5*c;\r\n      m0 += spiral(vec2(f2.x, f2.y), 192.0);\r\n    }\r\n  }\r\n\r\n  c = vec2(0.225 -0.1*T0, PI/4.0);\r\n  if (f.x < cInnerRadius) {\r\n    for (float i=0.0; i<2.0; ++i) {\r\n      f.y += PI/8.0;\r\n      f2 = mod(f,c)-0.5*c;\r\n      m1 += rose((0.75-0.5*T0)*f2, 0.4*T1, 24.0);\r\n      m1 += rose2((0.5+0.5*T1)*f2, 0.2+0.2*T0, 36.0);\r\n    }\r\n  }\r\n\r\n  c = vec2(0.6 -0.2*T0, PI/4.0);\r\n  if (f.x > cInnerRadius2) {\r\n    for (float i=0.0; i<2.0; ++i) {\r\n      f.y += PI/8.0;\r\n      f2 = mod(f,c)-0.5*c;\r\n      m2 += spiral(vec2((0.25+0.5*T1)*f2.x, f2.y), 392.0);\r\n//       m2 += rose2((1.0+0.25*T0)*f2, 0.5, 24.0);\r\n    }\r\n  }\r\n\r\n//   c = vec2(0.4 -0.23*T0, PI/4.0);\r\n//   if (f.x < 0.265) {\r\n//     for (float i=0.0; i<2.0; ++i) {\r\n//       f.y += PI/8.0;\r\n//       f2 = mod(f,c)-0.5*c;\r\n//       m3 += spiral(f2, 256.0);\r\n//       m3 += rose(f2, 1.5*T1, 16.0);\r\n//     }\r\n//   }\r\n\r\n  m4 += circle(f, 0.040, 192.0);\r\n  m4 += circle(f, cInnerRadius2, 192.0);\r\n  m4 += circle(f, cInnerRadius, 192.0);\r\n\r\n}\r\n\r\n// m4 += circle(f, cRadius, 192.0);\r\n\r\n// color\r\nfloat z = m0+m1+m2+m3+m4;\r\nz *= z;\r\nz = clamp(z, 0.0, 1.0);\r\npout.color = vec3(z);";

var mandaraFragPars = "// https://www.shadertoy.com/view/MtcSz4\r\n\r\nuniform float cRadius;\r\nuniform float cInnerRadius;\r\nuniform float cInnerRadius2;\r\n\r\nfloat circle(vec2 p, float r, float width) {\r\n  float d = 0.0;\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-r));\r\n  return d;\r\n}\r\n\r\nfloat arc(vec2 p, float r, float a, float width) {\r\n  float d = 0.0;\r\n  if (abs(p.y) < a) {\r\n    d += smoothstep(1.0, 0.0, width*abs(p.x-r));\r\n  }\r\n  return d;\r\n}\r\n\r\nfloat rose(vec2 p, float t, float width) {\r\n  const float a0 = 6.0;\r\n  float d = 0.0;\r\n  p.x *= 7.0 + 8.0 * t;\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-sin(a0*p.y)));\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-abs(sin(a0*p.y))));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-sin(a0*p.y)));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-abs(sin(a0*p.y))));\r\n  return d;\r\n}\r\n\r\nfloat rose2(vec2 p, float t, float width) {\r\n  const float a0 = 6.0;\r\n  float d = 0.0;\r\n  p.x *= 7.0 + 8.0 * t;\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-cos(a0*p.y)));\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-abs(cos(a0*p.y))));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-cos(a0*p.y)));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-abs(cos(a0*p.y))));\r\n  return d;\r\n}\r\n\r\nfloat spiral(vec2 p, float width) {\r\n  float d = 0.0;\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-0.5*p.y/PI));\r\n  d += smoothstep(1.0, 0.0, width*abs(p.x-0.5*abs(p.y)/PI));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-0.5*p.y/PI));\r\n  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-0.5*abs(p.y)/PI));\r\n  return d;\r\n}";

const mandaraUniforms = {
	cRadius: { value: 0.7325 },
	cInnerRadius: { value: 0.43 },
	cInnerRadius2: { value: 0.235 },
};

var mandelblot = "int j=0;\r\nvec2 x = pin.position + vec2(-0.5, 0.0);\r\nfloat y = 1.5 - pin.mouse.x * 0.5;\r\nvec2 z = vec2(0.0);\r\n\r\nfor (int i=0; i<360; i++) {\r\n  j++;\r\n  if (length(z) > 2.0) break;\r\n  z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + x * y;\r\n}\r\n\r\nfloat h = mod(time * 20.0, 360.0) / 360.0;\r\nvec3 color = hsv2rgb(vec3(h, 1.0, 1.0));\r\n\r\nfloat t = float(j) / 360.0;\r\npout.color = color * t;";

var marbleNoiseFrag = "vec2 pos = pin.coord / cScale;\r\nvec2 dpos = vec2(pos.x - pos.y, pos.x + pos.y);\r\ndpos = dpos * rotate2d(radians(time*5.0));\r\ndpos += 0.12 * combinedNoise(dpos);\r\ndpos += 0.25 * snoise(0.5*dpos*vec2(0.5,1.0));\r\nfloat graph = 0.5 + sin(dpos.x * cFrequency) / 2.0;\r\npout.color = vec3(graph);";

var marbleNoiseFragPars = "uniform float cScale;\r\nuniform float cFrequency;\r\n\r\nfloat combinedNoise(vec2 p) {\r\n  float s = 0.5;\r\n  float v = 0.0;\r\n  for (int i=0; i<3; i++) {\r\n    v += s*snoise(p/s);\r\n    s *= 0.4;\r\n  }\r\n  return v;\r\n}";

const marbleNoiseUniforms = {
	cScale: { value: 100.0 },
	cFrequency: { value: 10.0 },
};

var noise = "#define NOISE_OCTAVE_MAX 10\r\nuniform int cNoiseOctave;\r\nuniform float cNoiseFrequency;\r\nuniform float cNoiseAmplitude;\r\nuniform float cNoisePersistence;\r\nuniform bool cNoiseGraphEnable;\r\n\r\n// [0,1]\r\nfloat rand(float x) {\r\n  return fract(sin(x) * 4358.5453123);\r\n}\r\n// [0,1]\r\nfloat rand3(float n) {\r\n  return fract(cos(n*89.42) * 343.32);\r\n}\r\n// [0,1]\r\nfloat rand(vec2 p) {\r\n  return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);\r\n}\r\n// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.\r\n// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/\r\nhighp float rand2(const in vec2 uv) {\r\n  const highp float a = 12.9898, b = 78.233, c = 43758.5453;\r\n  highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);\r\n  return fract(sin(sn) * c);\r\n}\r\n\r\nfloat cosine(float a, float b, float x) {\r\n  float f = (1.0 - cos(x * PI)) * 0.5;\r\n  return a * (1.0 - f) + b * f;\r\n}\r\n\r\nfloat bicosine(float tl, float tr, float bl, float br, float x, float y) {\r\n  return cosine(cosine(tl,tr,x), cosine(bl,br,x), y);\r\n}\r\n\r\nfloat linear(float a, float b, float t) {\r\n  return a + (b-a)*t;\r\n}\r\n\r\nfloat bilinear(float tl, float tr, float bl, float br, float x, float y) {\r\n  return linear(linear(tl,tr,x), linear(bl,br,x), y);\r\n}\r\n\r\nfloat cubic(float a, float b, float x) {\r\n  float f = x*x*(3.0 - 2.0*x); // 3x^2 + 2x\r\n  return a * (1.0 - f) + b * f;\r\n}\r\n\r\nfloat bicubic(float tl, float tr, float bl, float br, float x, float y) {\r\n  return cubic(cubic(tl,tr,x), cubic(bl,br,x), y);\r\n}\r\n\r\nfloat quintic(float a, float b, float x) {\r\n  float f = x*x*x*(x*(x*6.0 - 15.0)+10.0); // 6x^5 - 15x^4 + 10x^3\r\n  return a * (1.0 - f) + b * f;\r\n}\r\n\r\nfloat biquintic(float tl, float tr, float bl, float br, float x, float y) {\r\n  return quintic(quintic(tl,tr,x), quintic(bl,br,x), y);\r\n}\r\n\r\nfloat bimix(float tl, float tr, float bl, float br, float x, float y) {\r\n  return mix(mix(tl,tr,x), mix(bl,br,x), y);\r\n}\r\n\r\n// Value Noise by Inigo Quilez - iq/2013\r\n// https://www.shadertoy.com/view/lsf3WH\r\nvec2 vrand(vec2 p) {\r\n  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));\r\n  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);\r\n}\r\n\r\n// gradation noise\r\nfloat vnoise(vec2 p) {\r\n  vec2 i = floor(p);\r\n  vec2 f = fract(p);\r\n  vec2 u = f*f*(3.0-2.0*f);\r\n  return mix(mix(dot(vrand(i+vec2(0.0,0.0)), f-vec2(0.0,0.0)),\r\n                 dot(vrand(i+vec2(1.0,0.0)), f-vec2(1.0,0.0)), u.x),\r\n             mix(dot(vrand(i+vec2(0.0,1.0)), f-vec2(0.0,1.0)),\r\n                 dot(vrand(i+vec2(1.0,1.0)), f-vec2(1.0,1.0)), u.x), u.y);\r\n}\r\n\r\nfloat plerp(vec2 p) {\r\n  vec2 i = floor(p);\r\n  vec2 f = fract(p);\r\n  return bicosine(rand(i+vec2(0.0,0.0)),\r\n                  rand(i+vec2(1.0,0.0)),\r\n                  rand(i+vec2(0.0,1.0)),\r\n                  rand(i+vec2(1.0,1.0)), f.x, f.y);\r\n//   vec4 v = vec4(rand(vec2(i.x,       i.y)),\r\n//                 rand(vec2(i.x + 1.0, i.y)),\r\n//                 rand(vec2(i.x,       i.y + 1.0)),\r\n//                 rand(vec2(i.x + 1.0, i.y + 1.0)));\r\n//   return cosine(cosine(v.x, v.y, f.x), cosine(v.z, v.w, f.x), f.y);\r\n}\r\n\r\nfloat pnoise(vec2 p) {\r\n  float t = 0.0;\r\n  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {\r\n    if (i >= cNoiseOctave) break;\r\n    float freq = pow(2.0, float(i));\r\n    float amp = pow(cNoisePersistence, float(cNoiseOctave - i));\r\n    t += plerp(vec2(p.x / freq, p.y / freq)) * amp;\r\n  }\r\n  return t;\r\n}\r\n\r\nfloat pnoise(vec2 p, int octave, float frequency, float persistence) {\r\n  float t = 0.0;\r\n  float maxAmplitude = EPSILON;\r\n  float amplitude = 1.0;\r\n  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {\r\n    if (i >= octave) break;\r\n    t += plerp(p * frequency) * amplitude;\r\n    frequency *= 2.0;\r\n    maxAmplitude += amplitude;\r\n    amplitude *= persistence;\r\n  }\r\n  return t / maxAmplitude;\r\n}\r\n\r\n// ridged noise\r\nfloat rpnoise(vec2 p, int octave, float frequency, float persistence) {\r\n  float t = 0.0;\r\n  float maxAmplitude = EPSILON;\r\n  float amplitude = 1.0;\r\n  for (int i=0; i<NOISE_OCTAVE_MAX; i++) {\r\n    if (i >= octave) break;\r\n    t += ((1.0 - abs(plerp(p * frequency))) * 2.0 - 1.0) * amplitude;\r\n    frequency *= 2.0;\r\n    maxAmplitude += amplitude;\r\n    amplitude *= persistence;\r\n  }\r\n  return t / maxAmplitude;\r\n}\r\n\r\nfloat psnoise(vec2 p, vec2 q, vec2 r) {\r\n  return pnoise(vec2(p.x,       p.y      )) *        q.x  *        q.y +\r\n         pnoise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +\r\n         pnoise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y +\r\n         pnoise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);\r\n}\r\n\r\n// PRNG (https://www.shadertoy.com/view/4djSRW)\r\nfloat prng(in vec2 seed) {\r\n  seed = fract(seed * vec2(5.3983, 5.4427));\r\n  seed += dot(seed.yx, seed.xy + vec2(21.5351, 14.3137));\r\n  return fract(seed.x * seed.y * 95.4337);\r\n}\r\n\r\n// https://www.shadertoy.com/view/Xd23Dh\r\n// Created by inigo quilez - iq/2014\r\n// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\r\n// This is a procedural pattern that has 2 parameters, that generalizes cell-noise, \r\n// perlin-noise and voronoi, all of which can be written in terms of the former as:\r\n//\r\n// cellnoise(x) = pattern(0,0,x)\r\n// perlin(x) = pattern(0,1,x)\r\n// voronoi(x) = pattern(1,0,x)\r\n//\r\n// From this generalization of the three famouse patterns, a new one (which I call \r\n// \"Voronoise\") emerges naturally. It's like perlin noise a bit, but within a jittered \r\n// grid like voronoi):\r\n//\r\n// voronoise(x) = pattern(1,1,x)\r\n//\r\n// Not sure what one would use this generalization for, because it's slightly slower \r\n// than perlin or voronoise (and certainly much slower than cell noise), and in the \r\n// end as a shading TD you just want one or another depending of the type of visual \r\n// features you are looking for, I can't see a blending being needed in real life.  \r\n// But well, if only for the math fun it was worth trying. And they say a bit of \r\n// mathturbation can be healthy anyway!\r\n// Use the mouse to blend between different patterns:\r\n// cell noise   u=0,v=0\r\n// voronoi      u=1,v=0\r\n// perlin noise u=0,v=1\r\n// voronoise    u=1,v=1\r\n// More info here: http://iquilezles.org/www/articles/voronoise/voronoise.htm\r\n// psudo-random number generator\r\nfloat iqhash2(vec2 p) {\r\n  vec2 q = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));\r\n  return abs(fract(sin(q.x*q.y)*43758.5453123)-0.5)*2.0;\r\n}\r\nvec2 iqhash2vec(vec2 p) {\r\n  vec2 q = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));\r\n  return -1.0 + 2.0 * fract(sin(q)*43758.5453123);\r\n}\r\n\r\n\r\nvec3 iqhash3( vec2 p ) {\r\n  vec3 q = vec3(dot(p,vec2(127.1,311.7)), \r\n                dot(p,vec2(269.5,183.3)), \r\n                dot(p,vec2(419.2,371.9)) );\r\n  return fract(sin(q)*43758.5453);\r\n}\r\n\r\nfloat iqnoise( in vec2 x, float u, float v ) {\r\n  vec2 p = floor(x);\r\n  vec2 f = fract(x);\r\n  float k = 1.0+63.0*pow(1.0-v,4.0);\r\n  float va = 0.0;\r\n  float wt = 0.0;\r\n  for( int j=-2; j<=2; j++ ) {\r\n    for( int i=-2; i<=2; i++ ) {\r\n      vec2 g = vec2( float(i),float(j) );\r\n      vec3 o = iqhash3( p + g )*vec3(u,u,1.0);\r\n      vec2 r = g - f + o.xy;\r\n      float d = dot(r,r);\r\n      float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\r\n      va += o.z*ww;\r\n      wt += ww;\r\n    }\r\n  }\r\n  return va/wt;\r\n}\r\n\r\n// https://www.shadertoy.com/view/MdX3Rr by inigo quilez\r\nconst mat2 iqfbmM = mat2(0.8,-0.6,0.6,0.8);\r\nfloat iqfbm( in vec2 p ) {\r\n  float f = 0.0;\r\n  f += 0.5000*pnoise( p ); p = iqfbmM*p*2.02;\r\n  f += 0.2500*pnoise( p ); p = iqfbmM*p*2.03;\r\n  f += 0.1250*pnoise( p ); p = iqfbmM*p*2.01;\r\n  f += 0.0625*pnoise( p );\r\n  return f/0.9375;\r\n}\r\n\r\n\r\n// simplex noise\r\n\r\nfloat mod289(float x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec2 mod289(vec2 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec3 mod289(vec3 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec4 mod289(vec4 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nfloat permute(in float x) {\r\n  return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nvec2 permute(in vec2 x) {\r\n  return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nvec3 permute(in vec3 x) {\r\n  return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nvec4 permute(in vec4 x) {\r\n  return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nvec4 taylorInvSqrt(in vec4 r) {\r\n  return 1.79284291400159 - 0.85373472095314 * r;\r\n}\r\n\r\nfloat snoise(in vec2 v) {\r\n  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0\r\n                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)\r\n                     -0.577350269189626, // -1.0 + 2.0 * C.x\r\n                      0.024390243902439); // 1.0 / 41.0\r\n// First corner\r\n  vec2 i = floor(v + dot(v, C.yy) );\r\n  vec2 x0 = v - i + dot(i, C.xx);\r\n\r\n// Other corners\r\n  vec2 i1;\r\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\r\n  //i1.y = 1.0 - i1.x;\r\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\r\n  // x1 = x0 - i1 + 1.0 * C.xx ;\r\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\r\n  vec4 x12 = x0.xyxy + C.xxzz;\r\n  x12.xy -= i1;\r\n\r\n// Permutations\r\n  i = mod289(i); // Avoid truncation effects in permutation\r\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\r\n+ i.x + vec3(0.0, i1.x, 1.0 ));\r\n\r\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\r\n  m = m*m ;\r\n  m = m*m ;\r\n\r\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\r\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\r\n\r\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r\n  vec3 h = abs(x) - 0.5;\r\n  vec3 ox = floor(x + 0.5);\r\n  vec3 a0 = x - ox;\r\n\r\n// Normalise gradients implicitly by scaling m\r\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\r\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\r\n\r\n// Compute final noise value at P\r\n  vec3 g;\r\n  g.x = a0.x * x0.x + h.x * x0.y;\r\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r\n  return 130.0 * dot(m, g);\r\n}\r\n\r\n\r\nfloat snoise(vec3 v) {\r\nconst vec2  C = vec2(1.0/6.0, 1.0/3.0);\r\nconst vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\r\n\r\n// First corner\r\nvec3 i  = floor(v + dot(v, C.yyy) );\r\nvec3 x0 =   v - i + dot(i, C.xxx) ;\r\n\r\n// Other corners\r\nvec3 g = step(x0.yzx, x0.xyz);\r\nvec3 l = 1.0 - g;\r\nvec3 i1 = min( g.xyz, l.zxy );\r\nvec3 i2 = max( g.xyz, l.zxy );\r\n\r\n// x0 = x0 - 0.0 + 0.0 * C.xxx;\r\n// vec3 x1 = x0 - i1 + 1.0 * C.xxx;\r\n// vec3 x2 = x0 - i2 + 2.0 * C.xxx;\r\n// vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;\r\nvec3 x1 = x0 - i1 + C.xxx;\r\nvec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\r\nvec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\r\n\r\n// Permutations\r\n\ti = mod289(i); \r\n\tvec4 p = permute( permute( permute( \r\n           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\r\n         + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \r\n         + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\r\n\r\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\r\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\r\nfloat n_ = 0.142857142857; // 1.0/7.0\r\nvec3  ns = n_ * D.wyz - D.xzx;\r\n\r\nvec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\r\n\r\nvec4 x_ = floor(j * ns.z);\r\nvec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\r\n\r\nvec4 x = x_ *ns.x + ns.yyyy;\r\nvec4 y = y_ *ns.x + ns.yyyy;\r\nvec4 h = 1.0 - abs(x) - abs(y);\r\n\r\nvec4 b0 = vec4( x.xy, y.xy );\r\nvec4 b1 = vec4( x.zw, y.zw );\r\n\r\n//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\r\n//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\r\nvec4 s0 = floor(b0)*2.0 + 1.0;\r\nvec4 s1 = floor(b1)*2.0 + 1.0;\r\nvec4 sh = -step(h, vec4(0.0));\r\n\r\nvec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\r\nvec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\r\n\r\nvec3 p0 = vec3(a0.xy,h.x);\r\nvec3 p1 = vec3(a0.zw,h.y);\r\nvec3 p2 = vec3(a1.xy,h.z);\r\nvec3 p3 = vec3(a1.zw,h.w);\r\n\r\n//Normalise gradients\r\nvec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\r\np0 *= norm.x;\r\np1 *= norm.y;\r\np2 *= norm.z;\r\np3 *= norm.w;\r\n\r\n// Mix final noise value\r\nvec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\r\nm = m * m;\r\nreturn 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\r\n}\r\n\r\n// vec4 grad4(float j, vec4 ip) {\r\n//   const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\r\n//   vec4 p,s;\r\n//   p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\r\n//   p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\r\n//   s = vec4(lessThan(p,vec4(0.0)));\r\n//   p.xyz = p.xyz + (s.xyz*2.0-1.0)*s.www;\r\n//   return p;\r\n// }\r\n\r\n// float snoise(in vec4 v) {\r\n//   const vec4 C = vec4(0.138196601125011, // (5-sqrt(5))/20 G4\r\n//                       0.276393202250021, // 2 * G4\r\n//                       0.414589803375032, // 3 * G4\r\n//                      -0.447213595499958); // -1 + 4 * G4\r\n\r\n//   // First corner\r\n//   vec4 i = floor(v + dot(v, C.yyyy));\r\n//   vec4 x0 = v - i + dot(i, C.xxxx);\r\n\r\n//   // Other corners\r\n\r\n//   // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\r\n//   vec4 i0;\r\n//   vec3 isX = step(x0.yzw, x0.xxx);\r\n//   vec3 isYZ = step(x0.zww, x0.yyz);\r\n//   // i0.x = dot(isX, vec3(1.0));\r\n//   i0.x = isX.x + isX.y + isX.z;\r\n//   i0.yzw = 1.0 - isX;\r\n//   // i0.y += dot(isYZ.xy, vec2(1.0));\r\n//   i0.y += isYZ.x + isYZ.y;\r\n//   i0.zw += 1.0 - isYZ.xy;\r\n//   i0.z += isYZ.z;\r\n//   i0.w += 1.0 - isYZ.z;\r\n\r\n//   // i0 now contains the unique values 0,1,2,3 in each channel\r\n//   vec4 i3 = clamp(i0, 0.0, 1.0);\r\n//   vec4 i2 = clamp(i0-1.0, 0.0, 1.0);\r\n//   vec4 i1 = clamp(i0-2.0, 0.0, 1.0);\r\n\r\n//   // x0 = x0 - 0.0 + 0.0 * C.xxxx\r\n//   // x1 = x0 - i1 + 1.0 * C.xxxx\r\n//   // x2 = x0 - i2 + 2.0 * C.xxxx\r\n//   // x3 = x0 - i3 + 3.0 * C.xxxx\r\n//   // x4 = x0 - 1.0 + 4.0 * C.xxxx\r\n//   vec4 x1 = x0 - i1 + C.xxxx;\r\n//   vec4 x2 = x0 - i2 + C.yyyy;\r\n//   vec4 x3 = x0 - i3 + C.zzzz;\r\n//   vec4 x4 = x0 + C.wwww;\r\n\r\n//   // Permutations\r\n//   i = mod289(i);\r\n//   float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);\r\n//   vec4 j1 = permute(permute(permute(permute(\r\n//       i.w + vec4(i1.w, i2.w, i3.w, 1.0))\r\n//     + i.z + vec4(i1.z, i2.z, i3.z, 1.0))\r\n//     + i.y + vec4(i1.y, i2.y, i3.y, 1.0))\r\n//     + i.z + vec4(i1.z, i2.z, i3.z, 1.0))\r\n//   ))));\r\n\r\n//   // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope\r\n//   // 7x7x6 = 294, which is close to the ring size 17*17=289.\r\n//   vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);\r\n\r\n//   vec4 p0 = grad4(j0,   ip);\r\n//   vec4 p1 = grad4(j1.x, ip);\r\n//   vec4 p2 = grad4(j1.y, ip);\r\n//   vec4 p3 = grad4(j1.z, ip);\r\n//   vec4 p4 = grad4(j1.w, ip);\r\n\r\n//   // Normalize gradients\r\n//   vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));\r\n//   p0 *= norm.x;\r\n//   p1 *= norm.y;\r\n//   p2 *= norm.z;\r\n//   p3 *= norm.w;\r\n//   p4 *= taylorInvSqrt(dot(p4,p4));\r\n\r\n//   // Mix contributions from the five corners\r\n//   vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(p2,x2)), 0.0);\r\n//   vec3 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);\r\n//   m0 = m0*m0;\r\n//   m1 = m1*m1;\r\n//   return 49.0 * (dot(m0*m0), vec3(dot(p0,x0), dot(p1,x1), dot(p2,x2))) + \r\n//     dot(m1*m1, vec2(dot(p3,x3), dot(p4,x4)));\r\n// }\r\n\r\nfloat scaleShift(float x, float a, float b) { return x*a+b; }\r\nvec2 scaleShift(vec2 x, float a, float b) { return x*a+b; }\r\nvec3 scaleShift(vec3 x, float a, float b) { return x*a+b; }\r\n// @return Value of the noise, range: [0,1]\r\nfloat hash1(float x) {\r\n    return fract(sin(x)*12345.0);\r\n}\r\n// @return Value of the noise, range: [0,1]\r\nfloat hash1(vec2 st) {\r\n    return fract(sin(dot(st.xy, vec2(12.9898, 78.233)))*43758.5453123);\r\n}\r\n// @return Value of the noise, range: [0,1]\r\nfloat hash1(vec3 v) {\r\n    return fract(sin(dot(v.xyz ,vec3(12.9898,78.233,144.7272))) * 43758.5453);\r\n}\r\n// @return Value of the noise, range: [0,1]\r\nvec2 hash2(vec2 st) {\r\n    st = vec2(dot(st,vec2(127.1,311.7)),\r\n              dot(st,vec2(269.5,183.3)));\r\n    return fract(sin(st)*43758.5453123);\r\n}\r\n// @return Value of the noise, range: [0,1]\r\nvec3 hash3(vec3 st) {\r\n    st = vec3(dot(st,vec3(127.1,311.7,217.3)), \r\n              dot(st,vec3(269.5,183.3,431.1)), \r\n              dot(st,vec3(365.6,749.9,323.7)));\r\n    return fract(sin(st)*43758.5453123);\r\n}\r\n// @return Value of the noise, range: [-1,1]\r\nfloat random1(float x) {\r\n    return scaleShift(hash1(x), 2.0, -1.0);\r\n}\r\n// @return Value of the noise, range: [-1,1]\r\nfloat random1(vec2 st) {\r\n    return scaleShift(hash1(st), 2.0, -1.0);\r\n}\r\n// @return Value of the noise, range: [-1,1]\r\nfloat random1(vec3 v) {\r\n    return scaleShift(hash1(v), 2.0, -1.0);\r\n}\r\n// @return Value of the noise, range: [-1,1]\r\nvec2 random2(vec2 p) {\r\n    return scaleShift(hash2(p), 2.0, -1.0);\r\n}\r\n// @return Value of the noise, range: [-1,1]\r\nvec3 random3(vec3 v) {\r\n    return scaleShift(hash3(v), 2.0, -1.0);\r\n}";

var noiseGraphFrag = "if (cNoiseGraphEnable) {\r\n  graph = clamp(graph, 0.0, 1.0);\r\n  graph = step(graph - fract(pin.uv.y), 0.0);\r\n  pout.color = mix(vec3(0.0, 0.5, 0.0), vec3(1.0), graph);\r\n}";

const noiseUniforms = {
	cNoiseOctave: { value: 6 },
	cNoiseFrequency: { value: 2.0 },
	cNoiseAmplitude: { value: 0.65 },
	cNoisePersistence: { value: 0.5 },
	cNoiseGraphEnable: { value: false },
};

var particleFrag = "vec3 col = vec3(0.);\r\nfor (float i=0.0; i<PARTICLE_COUNT; i++) {\r\n    if (i>=cCount) break;\r\n    float seed = SEED + floor(i/cCount+time);\r\n    vec2 anchor = vec2(0.5, 0.5);\r\n    vec2 velocity = vec2(mix(-.5, .5, rand(vec2(seed,i))),mix(-.5, .5, rand(vec2(i,seed)/3.)));\r\n    float creationTime = time - fract(i/cCount + time);\r\n    col += particle(pin.uv, 0., anchor, velocity, creationTime) * currentColor();\r\n}\r\ncol = smoothstep(.6, .9, col);\r\npout.color = vec3(rgb2gray(col));";

var particleFragPars = "// https://www.shadertoy.com/view/llGBWw\r\nuniform float cSize;\r\nuniform float cLifeTime;\r\nuniform float cGravity;\r\nuniform float cCount;\r\n#define SEED 0.12345679\r\n#define GRAV vec2(0,-.26)\r\n#define SIZE 0.024\r\n#define DIE_TIME 0.9\r\n#define PARTICLE_COUNT 500.0\r\n\r\nfloat particle(vec2 uv, float identifier, vec2 anchor, vec2 velocity, float creationTime) {\r\n    float particleTime = max(0., time - creationTime);\r\n    float size = max(0., cLifeTime - particleTime) * cSize;\r\n    vec2 velocityOffset = velocity * particleTime;\r\n    vec2 gravityOffset = vec2(0,-cGravity) * pow(particleTime, 1.798);\r\n    vec2 point = anchor + velocityOffset + gravityOffset;\r\n    float dist = distance(uv, point);\r\n    float hit = smoothstep(size, 0., dist);\r\n    return hit;\r\n}\r\nvec3 currentColor() {\r\n    float c = time * 0.2;\r\n    float r = sin(c*PI)/2. + .5;\r\n    float g = sin((c+.6)*PI)/2. +.5;\r\n    float b = sin((c+1.2)*PI)/2. + .5;\r\n    return vec3(r,g,b);\r\n}\r\n\r\n";

const particleUniforms = {
	cSize: { value: 0.024 },
	cLifeTime: { value: 0.9 },
	cGravity: { value: 0.26 },
	cCount: { value: 300.0 },
};

var pentagonFrag = "vec2 R = resolution.xy;\r\nvec2 U = pin.coord;\r\nvec2 V = U = (U+U-R) / R.y;\r\nvec3 O = vec3(0.0);\r\n\r\nU = U * rotate2d(0.3+time);\r\n\r\nfloat p = 0.6283; // = 2Pi/10\r\nfloat x,y;\r\nfloat a = mod(atan(U.y,U.x) + p, p+p)-p; // 2Pi/5 symmetry\r\nU = P(length(U), a)*1.25;\r\nx = U.x;\r\ny = U.y = abs(U.y); // mirror symmetry in each fan\r\n\r\n// B S( x-0.6*cSize  - 0.4*y, 0.01+cWidth*0.01); // exterior thin wall\r\nB S( x-cScale*0.5  - cAlpha*y, 0.5*cWidth); // exterior thin wall\r\n// B S( x-0.67 + 1.2*y, 0.01) * S(abs(y), 0.04)*0.6;\r\n\r\n// B S( x-cStarX*0.5  - cStarY*y, 0.5*cWidth) // thick wall\r\n  // * max(S(y,0.45),\r\n  //       C(P(0.83,p), 0.07));\r\n\r\n// B S( x-0.46, 0.06) * S(y, 0.19) // interior bar attached to thick wall\r\n//   * (1.0 - C(vec2(0.477,0.18), 0.045));\r\n\r\n// U *= 0.72;\r\n// B S( U.x-0.5 - 0.4*U.y, 0.05) * 0.3 // exterior pit (by scaling thick wall)\r\n//   * max(S(U.y, 0.45),\r\n//         C(P(0.83,p), 0.07))\r\n//   * (0.6 + 0.4*cos(200.0*a)); // radial strips\r\n\r\n// B S( x-1.7 - 0.4*y, 0.9) * 0.3\r\n//   * max(0.0, cos(200.0*V.y) - 0.6); // background strips (V: before 5-sym)\r\n\r\n// O += (1.0-O)*0.3; // B&W background\r\n//O = mix(vec3(1.0, 0.95, 0.6), vec3(0.6, 0.3, 0.3), O); // background + color scheme\r\npout.color = O;\r\n";

var pentagonFragPars = "// https://www.shadertoy.com/view/MlBfWz\r\nuniform float cScale;\r\nuniform float cAlpha;\r\nuniform float cWidth;\r\n\r\n#define P(r,a) (r)*vec2(cos(a),sin(a)) // to polar\r\n#define S(v,tk) smoothstep(2.0/R.y, -2.0/R.y, abs(v)-(tk)) // darw bar (antialiased)\r\n#define C(p,r) (S(length(U-p), r) + S(length(U-p*vec2(1.0,-1.0)), r)) // draw(2 sym disks)\r\n#define B O += (1.0-O)* // blend";

const pentagonUniforms = {
	cScale: { value: 1.0 },
	cAlpha: { value: 1.0 },
	cWidth: { value: 0.02 },
};

var perlinNoiseFrag = "vec2 t = pin.coord + vec2(time * 10.0);\r\nfloat n = pnoise(t);\r\npout.color = vec3(n);\r\n\r\nfloat graph = pnoise(t.xx);";

var polarConversionFrag = "vec2 coords = pin.uv - vec2(0.5); // cartesian\r\n// cartesian -> polar\r\nfloat mag = length(coords) * 2.0; // length(coords) / 0.5\r\nif (mag > 1.0) {\r\n  pout.color = vec3(0.0);\r\n} else {\r\n  mag = clamp(mag, 0.0, 1.0);\r\n  float angle = atan(coords.y, coords.x);\r\n  angle -= 1.57079632679;\r\n  if (angle < 0.0) angle += 6.28318530718;\r\n  angle /= 6.28318530718;\r\n  vec4 c = texture2D(tDiffuse, vec2(angle, mag));\r\n  pout.color = c.rgb;\r\n}";

var polarConversionFragPars = "// https://gist.github.com/KeyMaster-/70c13961a6ed65b6677d\r\n// vec2 polar;\r\n// polar.y = sqrt(dot(pin.position, pin.position));\r\n// polar.y /= resolution.x / 0.5;\r\n// polar.y = 1.0 - polar.y;\r\n// \r\n// polar.x = atan(pin.position.y, pin.position.x);\r\n// polar.x -= 1.57079632679;\r\n// if (polar.x < 0.0) polar.x += 6.28318530718;\r\n// polar.x /= 6.28318530718;\r\n// polar.x = 1.0 - polar.x;\r\n// \r\n// vec4 c = texture2D(tDiffuse, polar);\r\n// pout.color = c.rgb;\r\n\r\nvec2 cartesian(vec2 coords) {\r\n  return coords - vec2(0.5);\r\n}\r\n\r\nvec2 cartToPolar(vec2 coords) {\r\n  float mag = length(coords) / 0.5;\r\n  if (mag > 1.0) return vec2(0.0);\r\n  mag = clamp(mag, 0.0, 1.0);\r\n  float angle = atan(coords.y, coords.x);\r\n//   angle += 1.57079632679;\r\n  if (angle < 0.0) angle += 6.28318530718;\r\n  angle /= 6.28318530718;\r\n  return vec2(angle, mag);\r\n}";

var randomNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat lum = iqhash2(p);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = iqhash2(p.xx);";

var randomNoiseFragPars = "// dummy";

var raymarch = "float box(vec2 p, vec2 b, float r) {\r\n  return length(max(abs(p)-b,0.0))-r;\r\n}";

var ringAnimFrag = "float t = 0.02 / abs(sin(time) - length(pin.position));\r\npout.color = vec3(t);";

var ringFrag = "float t = cWidth / (abs(cRadius - length(pin.position)));\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var ringFragPars = "uniform float cRadius;\r\nuniform float cWidth;\r\nuniform float cPowerExponent;";

const ringUniforms = {
	cRadius: { value: 0.5 },
	cWidth: { value: 0.1 },
	cPowerExponent: { value: 1.0 },
};

var seamlessNoiseFrag = "float map = min(resolution.x, resolution.y) * cNoiseScale;\r\nvec2 t = mod(pin.coord.xy + vec2(time * 10.0), map);\r\nfloat n = psnoise(t, t / map, vec2(map));\r\npout.color = vec3(n);\r\n\r\nfloat graph = psnoise(t.xx, t.xx/map, vec2(map));";

var seamlessNoiseFragPars = "uniform float cNoiseScale;";

const seamlessNoiseUniforms = {
	cNoiseScale: { value: 1.0 },
};

var silexarsFrag = "vec3 c;\r\nfloat l, z = sin(time) * 1.0 + 17.0;\r\nfor (int i=0; i<3; i++) {\r\n  vec2 uv = pin.uv;\r\n  vec2 p = uv - 0.5;\r\n  z += 0.07;\r\n  l = length(p);\r\n  uv += p / l * (sin(z) + 1.0) * abs(sin(l*9.0-z*2.0));\r\n  c[i] = 0.01 / length(abs(mod(uv, 1.0)-0.5));\r\n}\r\npout.color = c/l;";

var smokeFrag = "// http://glslsandbox.com/e#37011.6\r\nfloat rot = -1.0 * time * 0.2;\r\nvec3 ro = vec3(0.0, -0.0, -1.0); // 4.0 * normalize(vec3(cos(rot), 0.0, sin(rot)))\r\nvec3 ta = vec3(0.0);\r\n\r\n// build ray\r\nvec3 ww = normalize(ta - ro);\r\nvec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));\r\nvec3 vv = normalize(cross(ww, uu));\r\nvec3 rd = normalize(pin.position.x*uu + pin.position.y*vv + 0.8*ww);\r\n\r\n// vec3 rd = normalize(vec3(pin.position, 2.0));\r\n// circle\r\nfloat circle_radius = 1.0;\r\nfloat border = 0.015;\r\nvec4 bkg_color = vec4(0.0);\r\nvec4 circle_color = vec4(1.0);\r\nfloat dist = sqrt(dot(pin.position, pin.position));\r\nif ((dist > (circle_radius + border)) || (dist < (circle_radius - border))) {\r\n  circle_color = bkg_color;\r\n}\r\n\r\n// raymarch\r\npout.color = raymarch(ro, rd);";

var smokeFragPars = "// http://glslsandbox.com/e#37011.6\r\nuniform float cVolume;\r\nuniform float cBeta;\r\nuniform float cDelta;\r\n\r\nfloat hash(float n) { return fract(sin(n) * 783.5453123); }\r\n\r\nfloat noise(in vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  float n = p.x + p.y * 157.0 + 113.0 * p.z;\r\n  return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),\r\n                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),\r\n             mix(mix(hash(n+113.0), hash(n+114.0), f.x),\r\n                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);\r\n}\r\n\r\nfloat fbm(vec3 p) {\r\n  float f;\r\n  f = 0.50000 * noise(p); p = p*2.02;\r\n  f += 0.2500 * noise(p); p = p*2.03;\r\n  f += 0.1250 * noise(p); p = p*2.01;\r\n  f += 0.0625 * noise(p);\r\n  return f;\r\n}\r\n\r\nfloat sdEllipsoid(in vec3 p, in vec3 r) {\r\n  return (length(p/r) - 1.0) * min(min(r.x, r.y), r.z);\r\n}\r\n\r\nfloat map(in vec3 p, float f, vec3 r) {\r\n  float den = sdEllipsoid(p, r);\r\n  den = smoothstep(-0.1, 0.25, den);\r\n  den = -den - (sin(0.0) + 1.0) * 0.3;\r\n  return clamp(den + f, 0.0, 1.0);\r\n}\r\n\r\n// vec3 light(vec3 ro, vec3 rd) {\r\n//   vec4 rnd = vec4(0.1, 0.2, 0.3, 0.4);\r\n//   float arclight = 0.0;\r\n//   vec3 pos = ro + rd;\r\n//   for (int i=0; i<3; ++i) {\r\n//     rnd = fract(sin(rnd * 1.111111) * 298729.258972);\r\n//     float ts = rnd.z * 4.0 * 1.61803398875 + 1.0;\r\n//     float arcfl = floor(time / ts + rnd.y) * ts;\r\n//     float arcfr = fract(time / ts + rnd.y) * ts;\r\n//     float arcseed = floor(time * 1.0 + rnd.y);\r\n//     float arcdur = rnd.x * 0.2 + 0.05;\r\n//     float arcint = smoothstep(0.1 + arcdur, arcdur, arcfr);\r\n//     arclight += exp(-0.5) * fract(sin(arcseed) * 198721.6231) * arcint;\r\n//   }\r\n//   vec3 arccol = vec3(0.9, 0.7, 0.7);\r\n//   vec3 lighting = arclight * arccol * 0.5;\r\n//   return lighting;\r\n// }\r\n\r\nvec3 raymarch(in vec3 ro, in vec3 rd) {\r\n  vec4 sum = vec4(0.0);\r\n  float t = 0.0;\r\n  for (int i=0; i<100; ++i) {\r\n    if (sum.a > 0.99) break;\r\n    vec3 pos = ro + t*rd;\r\n    float f = fbm(cBeta * pos + vec3(0.0, 0.0, 0.25) * time);\r\n    float d = map(pos, f, vec3(1.0, 1.0, 0.5));\r\n//     vec4 col = vec4(mix(vec3(0.07, 0.1, 0.2), vec3(1.5), d), 1.0);\r\n    vec4 col = vec4(mix(vec3(0.0), vec3(1.5), d), 1.0);\r\n    col *= d*cVolume;\r\n    sum += col * (1.0 - sum.a);\r\n    t += cDelta;\r\n  }\r\n//   vec3 lighting = light(ro, rd);\r\n//   vec3 rain_cloud = mix(vec3(0.0), lighting, sum.a);\r\n//   rain_cloud += sum.rgb;\r\n//   vec3 sky_color = mix(rain_cloud, vec3(0.5, 0.5, 0.3), 1.0 - sum.a);\r\n//   vec3 sky_color = mix(rain_cloud, vec3(0.0), 1.0 - sum.a);\r\n//   return clamp(sky_color, 0.0, 1.0);\r\n  return clamp(mix(sum.rgb, vec3(0.0), 1.0 - sum.a), 0.0, 1.0);\r\n}";

const smokeUniforms = {
	cVolume: { value: 3.0 },
	cBeta: { value: 4.0 },
	cDelta: { value: 0.05 },
};

var snowFrag = "t = time * cSpeed;\r\n\r\nfloat c = .0;\r\nif (cDensity > 4.) c += snow(pin.uv, 30.);\r\nif (cDensity > 3.) c += snow(pin.uv, 15.);\r\nif (cDensity > 2.) c += snow(pin.uv, 10.);\r\nc += snow(pin.uv, 5.);\r\nif (cDensity > 1. && cDensity < 5.5) c += snow(pin.uv, 3.);\r\n\r\n\r\nvec3 finalColor = vec3(c*.6);\r\n\r\nvec2 v = pin.position;\r\nfinalColor *= (.5+cRange - sqrt((v.x*v.x) + (v.y*v.y)))*2.5;\r\n\r\n// vec2 p = pin.uv;\r\n// p = 2.*p - 2.;\r\n// p.x *= resolution.x / resolution.y;\r\n// p.x -= time * .125;\r\n// float a = 0.5;\r\n// float n = pin.coord.y / resolution.y;\r\n// n *= n;\r\n// n *= snowNoise(p*2.) * a;\r\n// finalColor += vec3(n) * 1.2;\r\n\r\npout.color = finalColor;";

var snowFragPars = "uniform float cSpeed;\r\nuniform float cScale;\r\nuniform float cDensity;\r\nuniform float cRange;\r\nfloat t = 0.0;\r\n\r\nvec2 snowHash(in vec2 p) {\r\n  return cos(t + sin(mat2(17., 5., 3., 257.) * p - p) * 1234.5678);\r\n}\r\n\r\nfloat snowNoise(in vec2 p) {\r\n  const float K1 = (sqrt(3.)-1.)/2.;\r\n  const float K2 = (3.-sqrt(3.))/6.;\r\n  vec2 i = floor(p+(p.x + p.y)*K1);\r\n  vec2 a = p - i + (i.x + i.y)*K2;\r\n  vec2 o = (a.x > a.y) ? vec2(1., 0.) : vec2(0., 1.);\r\n  vec2 b = a - o + K2;\r\n  vec2 c = a - 1. + 2. * K2;\r\n  vec3 h = (.5 - vec3(dot(a,a), dot(b,b), dot(c,c))) * 3.;\r\n  vec3 n = vec3(dot(a,snowHash(i)), dot(b, snowHash(i+o)), dot(c, snowHash(i+1.)));\r\n  return dot(n, h*h*h*h*h)*.5 + .5;\r\n}\r\n\r\nfloat snow(vec2 uv, float scale) {\r\n  float w = smoothstep(1., 0., -uv.y * (scale / 40.0));\r\n  uv += t/scale;\r\n  uv.y += t/scale;\r\n  uv.x += sin(uv.y + t*.25)/scale;\r\n  uv *= scale;\r\n  \r\n  vec2 s = floor(uv);\r\n  vec2 f = fract(uv);\r\n  float k = 4.;\r\n  vec2 p = .5 + .3 * sin(11. * fract(sin((s+scale)*mat2(7., 3., 6., 5.))*5.)) - f;\r\n  float d = length(p);\r\n  k = min(d,k);\r\n  k = smoothstep(0., k, sin(f.x + f.y)*.01);\r\n  return w*k*(cScale*5.0);\r\n}";

const snowUniforms = {
	cSpeed: { value: 0.2 },
	cScale: { value: 0.5 },
	cDensity: { value: 5.0 },
	cRange: { value: 0.5 },
};

var solarFrag = "// float t = 1.0 / (length(pin.position) * solarIntensity);\r\nfloat t = cIntensity / (length(pin.position));\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var solarFragPars = "uniform float cIntensity;\r\nuniform float cPowerExponent;";

const solarUniforms = {
	cIntensity: { value: 0.4 },
	cPowerExponent: { value: 1.0 },
};

var sparkFrag = "vec2 n = normalize(pin.position);\r\nfloat t = cIntensity * 2.0 / length(pin.position);\r\nfloat r = pnoise(n*resolution+time) * 2.0;\r\nr = max(t-r, 0.0);\r\nr = pow(r, cPowerExponent);\r\npout.color = vec3(r);";

var sparkFragPars = "uniform float cIntensity;\r\nuniform float cPowerExponent;";

var sparkNoiseFrag = "float lum = fbm(vec3(pin.uv * 16.0 * cNoiseFrequency, time));\r\npout.color = vec3(lum);\r\n\r\nfloat graph = fbm(vec3(pin.uv.xx * 16.0 * cNoiseFrequency, time));";

var sparkNoiseFragPars = "float fbm(vec3 v) {\r\n  float n = 0.0;\r\n  n += 1.0000 * abs(snoise(v));\r\n  n += 0.5000 * abs(snoise(v*2.0));\r\n  n += 0.2500 * abs(snoise(v*4.0));\r\n  n += 0.1250 * abs(snoise(v*8.0));\r\n  float rn = 1.0 - n;\r\n  return rn*rn;\r\n}";

const sparkUniforms = {
	cIntensity: { value: 0.5 },
	cPowerExponent: { value: 1.0 },
};

var speckleFrag = "float w = 1.0 - dot(pin.position, pin.position) * mix(100.0, 3.0, cRadius);\r\nvec2 uv = pin.position * mix(48.0, 1.0, cScale);\r\nvec2 ip = floor(uv);\r\nvec2 v = cellular2x2x2(vec3(uv, time/2.0));\r\nfloat c = v.x; // v.y - v.x\r\nc -= (0.35 + 1.0*cDensity)*w;\r\nc = smoothstep(0.0, max(0.1/c, 0.0), c);\r\nc = mix(0.0, 1.0, c);\r\npout.color = vec3(1.0 - sqrt(max(c, 0.0)));";

var speckleFragPars = "// https://www.shadertoy.com/view/XlSBDz\r\nuniform float cRadius;\r\nuniform float cScale;\r\nuniform float cDensity;\r\n\r\n// Cellular noise, returning F1 and F2 in a vec2.\r\n// Speeded up by using 2x2x2 search window instead of 3x3x3,\r\n// at the expense of some pattern artfiacts.\r\n// F2 is often wrong and has sharp discontinuities.\r\n// If you need a good F2, use th slower 3x3x3 version.\r\nvec2 cellular2x2x2(vec3 P) {\r\n  #define K 0.142957142857 // 1/7\r\n  #define Ko 0.428571428571 // 1/2-K/2\r\n  #define K2 0.020408163265306 // 1/(7*7)\r\n  #define Kz 0.166666666667 // 1/6\r\n  #define Kzo 0.416666666667 // 1/2-1/6*2\r\n  #define jitter 0.8 // smaller jitter gives less errors in F2\r\n  vec3 Pi = mod(floor(P), 289.0);\r\n  vec3 Pf = fract(P);\r\n  vec4 Pfx = Pf.x + vec4(0.0, -1.0, 0.0, -1.0);\r\n  vec4 Pfy = Pf.y + vec4(0.0, 0.0, -1.0, -1.0);\r\n  vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));\r\n  p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));\r\n  vec4 p1 = permute(p + Pi.z); // z+0\r\n  vec4 p2 = permute(p + Pi.z + vec4(1.0)); // z+1\r\n  vec4 ox1 = fract(p1*K) - Ko;\r\n  vec4 oy1 = mod(floor(p1*K), 7.0)*K - Ko;\r\n  vec4 oz1 = floor(p1*K2)*Kz - Kzo; // p1 < 289 guaranteed\r\n  vec4 ox2 = fract(p2*K) - Ko;\r\n  vec4 oy2 = mod(floor(p2*K), 7.0)*K - Ko;\r\n  vec4 oz2 = floor(p2*K2)*Kz - Kzo;\r\n  vec4 dx1 = Pfx + jitter*ox1;\r\n  vec4 dy1 = Pfy + jitter*oy1;\r\n  vec4 dz1 = Pf.z + jitter*oz1;\r\n  vec4 dx2 = Pfx + jitter*ox2;\r\n  vec4 dy2 = Pfy + jitter*oy2;\r\n  vec4 dz2 = Pf.z - 1.0 + jitter*oz2;\r\n  vec4 d1 = dx1*dx1 + dy1*dy1 + dz1*dz1; // z+0\r\n  vec4 d2 = dx2*dx2 + dy2*dy2 + dz2*dz2; // z+1\r\n  \r\n  // Sort out the two smallest distances (F1, F2)\r\n  // Do it right and sort out both F1 and F2\r\n  vec4 d = min(d1,d2); // F1 is now in d\r\n  d2 = max(d1,d2); // Make sure we keep all candidates for F2\r\n  d.xy = (d.x < d.y) ? d.xy : d.yx; // Swap smallest to d.x\r\n  d.xz = (d.x < d.z) ? d.xz : d.zx;\r\n  d.xw = (d.x < d.w) ? d.xw : d.wx; // F1 is now in d.x\r\n  d.yzw = min(d.yzw, d2.yzw); // F2 now not in d2.yzw\r\n  d.y = min(d.y, d.z); // nor in d.z\r\n  d.y = min(d.y, d.w); // nor in d.w\r\n  d.y = min(d.y, d2.x); // F2 is now in d.y\r\n  return sqrt(d.xy); // F1 and F2\r\n}";

const speckleUniforms = {
	cRadius: { value: 1.0 },
	cScale: { value: 1.0 },
	cDensity: { value: 1.0 },
};

var squigglesFrag = "vec3 color = vec3(0.0);\r\nfloat s = 1.0;\r\nfor (int i=0; i<numLayers; ++i) {\r\n    if (float(i)>=cDensity) break;\r\n    float sn = 0.0;\r\n    float y = 0.0;\r\n    \r\n    vec2 deriv;\r\n    float nx = smplxNoise2D(pin.position*s*mix(10., 1., cScale), deriv, 0.1+1./s, 0.0);\r\n    float ny = smplxNoise2D(pin.position*s*mix(10., 1., cScale), deriv, 0.11+1./s, 0.0);\r\n    for (int j=0; j<wormLength; ++j) {\r\n        if (float(j)>=cSize) break;\r\n        sn += smplxNoise2D(pin.position*s+vec2(1./s,0.)+vec2(nx,ny)*4., deriv, 0.2+1./s, y);\r\n        color += vec3(norm(deriv).z)/s;\r\n        y += 0.1;\r\n    }\r\n    s *= 1.1;\r\n}\r\ncolor /= 4.;\r\n\r\nvec2 deriv;\r\nfloat delay = smplxNoise2D(pin.position*s*1., deriv, 0.111, 0.);\r\npout.color = mix(color, vec3(1.0)-color, clamp(sin(time*0.25+pin.position.x*.5+delay*32.)*32., 0.0, 1.0));";

var squigglesFragPars = "uniform float cDensity;\r\nuniform float cSize;\r\nuniform float cScale;\r\n\r\n// https://www.shadertoy.com/view/MstBD4\r\n// Number of layars.\r\n// Higher value shows more layers of effects\r\n// Lower value higer FPS.\r\nconst int numLayers = 16;\r\n\r\n//Length of worm\r\nconst int wormLength = 8;\r\n\r\nfloat squigglesRand(vec3 pos) {\r\n    vec3 p = pos + vec3(2.);\r\n    vec3 fp = fract(p*p.yzx*222.)+vec3(2.);\r\n    p.y *= p.z * fp.x;\r\n    p.x *= p.y * fp.y;\r\n    return fract(p.x*p.x);\r\n}\r\n\r\nfloat skewF(float n) {\r\n    return (sqrt(n+1.0)-1.0)/n;\r\n}\r\n\r\nfloat unskewG(float n) {\r\n    return (1.0/sqrt(n+1.0)-1.0)/n;\r\n}\r\n\r\nvec2 smplxNoise2DDeriv(vec2 x, float m, vec2 g) {\r\n    vec2 dmdxy = min(dot(x,x)-vec2(0.5), 0.0);\r\n    dmdxy = 8.*x*dmdxy*dmdxy*dmdxy;\r\n    return dmdxy*dot(x,g) + m*g;\r\n}\r\n\r\nfloat smplxNoise2D(vec2 p, out vec2 deriv, float randKey, float roffset) {\r\n    // i is a skewed coordinate of a bottom vertex of a simplex where p is in.\r\n    vec2 i0 = floor(p+vec2(p.x+p.y)*skewF(2.0));\r\n    // x0, x1, x2 are unskewed displacement vectors.\r\n    float unskew = unskewG(2.0);\r\n    vec2 x0 = p-(i0+vec2((i0.x+i0.y)*unskew));\r\n\r\n    vec2 ii1 = x0.x > x0.y ? vec2(1.0,0.0) : vec2(0.0,1.0);\r\n    vec2 ii2 = vec2(1.0);\r\n    vec2 x1 = x0 - ii1 - vec2(unskew);\r\n    vec2 x2 = x0 - ii2 - vec2(2.0*unskew);\r\n\r\n    vec3 m = max(vec3(0.5)-vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\r\n    m = m*m;\r\n    m = m*m;\r\n\r\n    float r0 = 3.1416*2.0*squigglesRand(vec3(mod(i0, 16.0)/16.0, randKey));\r\n    float r1 = 3.1416*2.0*squigglesRand(vec3(mod(i0+ii1, 16.0)/16.0, randKey));\r\n    float r2 = 3.1416*2.0*squigglesRand(vec3(mod(i0+ii2, 16.0)/16.0, randKey));\r\n\r\n    float randKey2 = randKey + 0.01;\r\n    float spmin = 0.5;\r\n    float sps = 2.0;\r\n    float sp0 = spmin + sps*squigglesRand(vec3(mod(i0, 16.0)/16.0, randKey2));\r\n    float sp1 = spmin + sps*squigglesRand(vec3(mod(i0+ii1, 16.0)/16.0, randKey2));\r\n    float sp2 = spmin + sps*squigglesRand(vec3(mod(i0+ii2, 16.0)/16.0, randKey2));\r\n\r\n    r0 += time*sp0 + roffset;\r\n    r1 += time*sp1 + roffset;\r\n    r2 += time*sp2 + roffset;\r\n\r\n    // Gradients\r\n    vec2 g0 = vec2(cos(r0), sin(r0));\r\n    vec2 g1 = vec2(cos(r1), sin(r1));\r\n    vec2 g2 = vec2(cos(r2), sin(r2));\r\n\r\n    deriv = smplxNoise2DDeriv(x0, m.x, g0);\r\n    deriv += smplxNoise2DDeriv(x1, m.y, g1);\r\n    deriv += smplxNoise2DDeriv(x2, m.z, g2);\r\n\r\n    return dot(m*vec3(dot(x0,g0), dot(x1,g1), dot(x2,g2)), vec3(1.0));\r\n}\r\n\r\nvec3 norm(vec2 deriv) {\r\n    deriv *= 2000.0;\r\n    vec3 tx = vec3(1.0, 0.0, deriv.x);\r\n    vec3 ty = vec3(0.0, 1.0, deriv.y);\r\n    return normalize(cross(tx,ty));\r\n}\r\n";

const squigglesUniforms = {
	cSize: { value: 8.0 },
	cScale: { value: 0.5 },
	cDensity: { value: 16.0 },
};

var sunFrag = "// https://www.shadertoy.com/view/MlKGDc by Iulian Marinescu Ghetau\r\n\r\ninitScene();\r\n\r\nvec3 col0 = rayTrace(pin.coord + vec2(0.0, 0.0));\r\nvec3 col1 = rayTrace(pin.coord + vec2(0.5, 0.0));\r\nvec3 col2 = rayTrace(pin.coord + vec2(0.0, 0.5));\r\nvec3 col3 = rayTrace(pin.coord + vec2(0.5, 0.5));\r\nvec3 col = 0.25 * (col0 + col1 + col2 + col3);\r\n\r\nvec3 gray = vec3(rgb2gray(col));\r\npout.color = mix(gray, col, cColor);";

var sunFragPars = "// https://www.shadertoy.com/view/MlKGDc by Iulian Marinescu Ghetau\r\n\r\nuniform float cRadius;\r\nuniform float cColor;\r\n\r\nstruct Ray {\r\n  vec3 o;\r\n  vec3 dir;\r\n};\r\n\r\nstruct Intersect {\r\n  vec3 pos;\r\n  vec3 norm;\r\n};\r\n\r\nvec4 obj;  // xyz - position, w - cRadius\r\n\r\nconst float eps = 1e-3;\r\n\r\n// Number of ray iteration\r\nconst int iterations = 15;\r\n\r\n// Next, I define an exposure time adn gamma value. At this point, I also create\r\n// a basic directional light and define the ambient light color; the color here\r\n// is mostly a matter of taste. Basically ... lighting controls.\r\nconst float exposure = 0.3;\r\nconst float gamma = 2.2;\r\nconst float intensity = 50.0;\r\n\r\n// The maximum Radius the Camera can move around (sync with the value in BufA)\r\nconst float cCamPanRadius = 10000.0;\r\n\r\n// The position of the saved camera variables in the Render Buffer A (sync with the value in BufA)\r\nconst vec2 txCamPos = vec2(0.0, 0.0);\r\nconst vec2 txCamForward = vec2(1.0, 0.0);\r\n\r\n// Convert val from [0,1] interval to [minVal,maxVal]\r\n// vec3 decode(vec3 val, float minVal, float maxVal) {\r\n//   return vec3(minVal) + (maxVal - minVal) * val;\r\n// }\r\n\r\n// The intersection functions are from inigo's article\r\n// http://www.iquilezles.org/www/articles/simplegpurt/simplegpurt.htm\r\nbool intSphere(in vec4 sp, in vec3 ro, in vec3 rd, in float tm, out float t) {\r\n  bool r = false;\r\n  vec3 d = ro - sp.xyz;\r\n  float b = dot(rd, d);\r\n  float c = dot(d,d) - sp.w*sp.w;\r\n  t = b*b-c;\r\n  if (t > 0.0) {\r\n    t = -b-sqrt(t);\r\n    r = (t > 0.0) && (t < tm);\r\n  }\r\n  return r;\r\n}\r\n\r\n// Ray Marching code based on Fiery Spikeball shader: https://www.shadertoy.com/view/4lBXzy#\r\n\r\n// #define DITHERING\r\n\r\n// Noise function based on https://www.shadertoy.com/view/4sfGzS\r\n// I tried the Iq's faster version but it shows discontinuities when you zoom in very close\r\nfloat hash(float n) { return fract(sin(n) * 783.5453123); }\r\n\r\nfloat noise(in vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n  f = f*f*(3.0-2.0*f);\r\n  float n = p.x + p.y * 157.0 + 113.0 * p.z;\r\n  return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),\r\n                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),\r\n             mix(mix(hash(n+113.0), hash(n+114.0), f.x),\r\n                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);\r\n}\r\n\r\nfloat fbm(vec3 p) {\r\n  const mat3 m = mat3(1.0);\r\n  vec3 q = 0.1 * p;\r\n  float f;\r\n  f = 0.5000 * noise(q); q = m*q*2.01;\r\n  f += 0.2500 * noise(q); q = m*q*2.02;\r\n  f += 0.1250 * noise(q); q = m*q*2.03;\r\n  f += 0.0625 * noise(q);\r\n  return f;\r\n}\r\n\r\nfloat sdSphere(vec4 sp, vec3 p) {\r\n  return length(p - sp.xyz) - sp.w;\r\n}\r\n\r\nfloat dfSunSurface(vec3 p) {\r\n  float cs = cos(time * 0.1);\r\n  float si = sin(time * 0.1);\r\n  mat2 rM = mat2(cs, si, -si, cs);\r\n  p.xz *= rM;\r\n  return max(0.0, sdSphere(obj + vec4(0.0, 0.0, 0.0, -1.0), p) + fbm(p*60.0+time*2.0) * 0.15);\r\n}\r\n\r\n// See \"Combustible Voronoi\"\r\n// https://www.shadertoy.com/view/4tlSzl\r\nvec3 firePalette(float i) {\r\n  float T = 900.0 + 3500.0 * i; // Temperature range (in Kelvin)\r\n  vec3 L = vec3(7.4, 5.6, 4.4); // Red, green, blue wavelengths (in hundreds of nanometers).\r\n  L = pow(L, vec3(5.0)) * (exp(1.43876719683e5/(T*L))-1.0);\r\n  return 1.0 - exp(-5e8/L); // Exposure level. Set to \"50.\" For \"70,\" change the \"5\" to a \"7,\" etc.\r\n}\r\n\r\nvec3 rayMarch(vec3 ro, vec3 rd, vec2 uv, out float dist) {\r\n// ld, td: local, total density\r\n// w: weighwing factor\r\n  float ld = 0.0, td = 0.0, w;\r\n\r\n// t: length of the ray\r\n// d: distance function\r\n  float d = 1.0, t = 0.0;\r\n\r\n// Distance threshold\r\n  const float h = 0.25;\r\n\r\n// total color\r\n  float tc = 0.0;\r\n\r\n  vec2 seed = uv + fract(time);\r\n\r\n// Tidied the raymarcher up a bit. Plus, got rid some redundancies... I think.\r\n\r\n  for (int i=0; i<30; i++) {\r\n    // Loop break conditions. Seems to work, but let me know if I've \r\n    // overlooked something. The middle break isn't really used here, but\r\n    // it can help in certain situations.\r\n    if (td > (1.0 - 0.02) || d < 0.001*t || t>12.0)  break;\r\n\r\n    // evaluate distance function\r\n    // Took away the \"0.5\" factor, and put it below\r\n    d = dfSunSurface(ro + t*rd);\r\n\r\n    // check whether we are close enough (step)\r\n    // compute local density and weighing factor\r\n    ld = (h-d) * step(d, h);\r\n    w = (1.0 - td) * ld;\r\n\r\n    // accumulate color and density\r\n    tc += w*w + 1.0/70.0;  // Difference weight distribution\r\n    td += w;\r\n\r\n    // dithering implementation come from Eiffies' https://www.shadertoy.com/view/MsBGRh\r\n    #ifdef DITHERING\r\n    // add in noise to reduce banding and create fuzz\r\n    d = abs(d) * (0.9 + 0.4*rnd(seed*vec2(i)));\r\n    #endif\r\n\r\n    // enforce minumum stepsize\r\n    // d = max(d, 0.01);\r\n\r\n    // step forward\r\n    t += d * 0.5;\r\n  }\r\n\r\n  dist = clamp(d, 0.0, 1.0);\r\n\r\n  return firePalette(tc);\r\n}\r\n\r\n// http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/\r\n// mat3 rotMat(vec3 axis, float angle) {\r\n//   axis = normalize(axis);\r\n//   float s = sin(angle);\r\n//   float c = cos(angle);\r\n//   float oc = 1.0 - c;\r\n// \r\n//   return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,\r\n//               oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,\r\n//               oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);\r\n// }\r\n\r\nvoid initScene() {\r\n  obj = vec4(0.0, 0.0, 0.0, 5.0 - 3.5 * (1.0 - cRadius));\r\n}\r\n\r\n// Get a Ray from the Camera position (read from BufA) to the fragment given by the uv coordinates\r\nRay calcFragmentRay(vec2 uv) {\r\n  vec3 camPos = vec3(0.0, 0.0, 12.0);\r\n  vec3 camForward = vec3(0.0, 0.0, -1.0);\r\n//   vec3 camPos = decode(loadValue(txCamPos), -cCamPanRadius, cCamPanRadius);\r\n//   vec3 camForward = decode(loadValue(txCamForward), -1.0, 0.0);\r\n  vec3 camRight = normalize(cross(vec3(0.0, 1.0, 0.0), camForward));\r\n  vec3 camUp = cross(camForward, camRight);\r\n  return Ray(camPos, normalize(uv.x * camRight + uv.y * camUp + camForward));\r\n}\r\n\r\n// Intersects a ray with the scene and return the closest intersection\r\nbool intObjs(vec3 ro, vec3 rd, out Intersect hit) {\r\n  bool r = false;\r\n  float t = 0.0, tm = cCamPanRadius;\r\n  if (intSphere(obj, ro, rd, tm, t)) {\r\n    tm = t; r = true;\r\n    hit.pos = ro + tm * rd;\r\n    hit.norm = normalize(hit.pos - obj.xyz);\r\n  }\r\n  return r;\r\n}\r\n\r\n// Check if a ray is in the shadow\r\nbool inShadow(vec3 ro, vec3 rd) {\r\n  float t, tm = cCamPanRadius;\r\n  if (intSphere(obj, ro, rd, tm, t)) return true;\r\n  return false;\r\n}\r\n\r\n// Calculate the fresnel coef using Schlick's approximation\r\n// float calcFresnel(vec3 n, vec3 rd, float r0) {\r\n//   float ndotv = clamp(dot(n, -rd), 0.0, 1.0);\r\n//   return r0 + (1.0 - r0) * pow(1.0 - ndotv, 5.0);\r\n// }\r\n\r\nvec3 calcShading(Ray ray, Intersect hit, vec2 uv, out float sunDist) {\r\n// The Sun is shaded using a distance based function, \r\n// bounded by the objs[ixLight] sphere.\r\n// Start to march the ray from points equally distant from the\r\n// sun's center, this way the Sun's shading does not depend on the camera location.\r\n// (The Sun looks the same no matter where you look from)\r\n  vec3 col = rayMarch(hit.pos, ray.dir, uv, sunDist);\r\n  return col;\r\n}\r\n\r\nvec3 rayTrace(vec2 fragCoord) {\r\n// Pixels to fragment coordinates do not map one a one-to-one basis, so I need \r\n// to divide the fragment coordinates by the viewport resolution. I then offset \r\n// that by a fixed value to re-center the coordinate system.\r\n  vec2 uv = fragCoord / resolution - vec2(0.5);\r\n\r\n// For each fragment, create a ray at a fixed point of origin directed at\r\n// the coordinates of each fragment.\r\n  Ray ray = calcFragmentRay(uv);\r\n\r\n  float mask = 1.0; // accumulates reflected light (fresnel coefficient)\r\n  vec3 color = vec3(0.0); // accumulates color\r\n  for (int i=0; i <= iterations; i++) {\r\n    Intersect hit;\r\n    if (intObjs(ray.o, ray.dir, hit)) {\r\n      \r\n      float sunDist = 0.0;\r\n      color += mask * calcShading(ray, hit, uv, sunDist);\r\n\r\n//       float fresnel = calcFresnel(hit.norm, ray.dir, 0.0);\r\n\r\n// The sun\r\n      mask *= sunDist;\r\n// The original ray doesn't change\r\n// This allows to shade objects behind Sun's Corona\r\n      ray.o = hit.pos + eps * ray.dir;\r\n    } else {\r\n// If the trace failed\r\n      color += mask * vec3(0.0);\r\n      break;\r\n    }\r\n  }\r\n\r\n// Adjust for exposure and perform linear gamma correction\r\n//   color = pow(color * exposure, vec3(1.0 / gamma));\r\n\r\n  return color;\r\n}";

const sunUniforms = {
	cRadius: { value: 1.0 },
	cColor: { value: 0.0 },
};

var tessNoiseFrag = "vec2 p = pin.uv - cOffset;\r\np *= pow(2.0, 13.0);\r\nvec4 a = tessNoise(p);\r\nvec4 n = vec4(a.x+a.y+a.z+a.w) * .5;\r\npout.color = vec3(n.xyz);\r\n\r\nfloat graph = n.x;";

var tessNoiseFragPars = "uniform float cOffset;\r\n\r\nvec4 tessNoise(vec2 p) {\r\n  vec4 base = vec4(p, 0.0, 0.0);\r\n  vec4 rotation = vec4(0.0, 0.0, 0.0, 0.0);\r\n  float theta = fract(time*1.025);\r\n  float phase = .55;\r\n  float frequency = .49 * mix(1.0, 1.2, cNoiseFrequency);\r\n  \r\n  vec4 result;\r\n  for (int i=0; i<16; i++) {\r\n    base += rotation;\r\n    rotation = fract(base.wxyz - base.zwxy + theta);\r\n    rotation *= (1.0 - rotation);\r\n    base *= frequency;\r\n    base += base.wxyz * phase;\r\n  }\r\n  return rotation * 2.0;\r\n}";

const tessNoiseUniforms = {
	cOffset: { value: 0.5 },
};

var testFrag = "vec2 p = (-resolution + 2.0*pin.coord) / resolution.y;\nvec2 m = mouse.xy / resolution.xy;\nvec3 ro = 4.0*normalize(vec3(sin(3.0*m.x), 0.4*m.y, cos(3.0*m.x)));\nvec3 ta = vec3(0.0,-1.0,0.0);\nmat3 ca = setCamera(ro, ta, 0.0);\nvec3 rd = ca*normalize(vec3(p.xy,1.5));\npout.color = render(ro, rd).xyz;";

var testFragPars = "uniform sampler2D tNoise;\nfloat noise(in vec3 x) {\n  vec3 p = floor(x);\n  vec3 f = fract(x);\n  f = f*f*(3.0-2.0*f);\n  vec2 uv = (p.xy + vec2(37.0, 17.0)*p.z) + f.xy;\n  uv = (uv+0.5)/256.0;\n  uv = vec2(uv.x, -uv.y);\n  vec2 rg = texture2D(tNoise, uv).yx;\n  return -1.0 + 2.0*mix(rg.x, rg.y, f.z);\n}\nfloat map5(in vec3 p) {\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\n  float f;\n  f  = 0.50000*noise(q); q = q*2.02;\n  f += 0.25000*noise(q); q = q*2.03;\n  f += 0.12500*noise(q); q = q*2.01;\n  f += 0.06250*noise(q); q = q*2.02;\n  f += 0.03125*noise(q);\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\n}\nfloat map4(in vec3 p) {\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\n  float f;\n  f  = 0.50000*noise(q); q = q*2.02;\n  f += 0.25000*noise(q); q = q*2.03;\n  f += 0.12500*noise(q); q = q*2.01;\n  f += 0.06250*noise(q);\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\n}\nfloat map3(in vec3 p) {\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\n  float f;\n  f  = 0.50000*noise(q); q = q*2.02;\n  f += 0.25000*noise(q); q = q*2.03;\n  f += 0.12500*noise(q);\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\n}\nfloat map2(in vec3 p) {\n  vec3 q = p - vec3(0.0, 0.1, 1.0) * time;\n  float f;\n  f  = 0.50000*noise(q); q = q*2.02;\n  f += 0.25000*noise(q);\n  return clamp(1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0);\n}\nvec3 sundir = normalize(vec3(-1.0, 0.0, -1.0));\nvec4 integrate(in vec4 sum, in float dif, in float den, in vec3 bgcol, in float t) {\n  vec3 lin = vec3(0.65,0.7,0.75)*1.4 + vec3(1.0,0.6,0.3)*dif;\n  vec4 col = vec4(mix(vec3(1.0,0.95,0.8), vec3(0.25,0.3,0.35), den), den);\n  col.xyz *= lin;\n  col.xyz = mix(col.xyz, bgcol, 1.0-exp(-0.003*t*t));\n  col.a *= 0.4;\n  col.rgb *= col.a;\n  return sum + col*(1.0-sum.a);\n}\n#define MARCH(STEPS,MAPLOD) for(int i=0; i<STEPS; i++) { vec3 pos = ro + t*rd; if (pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99) break; float den = MAPLOD(pos); if (den>0.01) { float dif = clamp((den - MAPLOD(pos+0.3*sundir))/0.6, 0.0, 1.0); sum = integrate(sum, dif, den, bgcol, t); } t += max(0.05, 0.02*t); }\nvec4 raymarch(in vec3 ro, in vec3 rd, in vec3 bgcol) {\n  vec4 sum = vec4(0.0);\n  float t = 0.0;\n  MARCH(30,map5);\n  MARCH(30,map4);\n  MARCH(30,map3);\n  MARCH(30,map2);\n  return clamp(sum, 0.0, 1.0);\n}\nmat3 setCamera(in vec3 ro, in vec3 ta, float cr) {\n  vec3 cw = normalize(ta-ro);\n  vec3 cp = vec3(sin(cr), cos(cr), 0.0);\n  vec3 cu = normalize(cross(cw,cp));\n  vec3 cv = normalize(cross(cu,cw));\n  return mat3(cu, cv, cw);\n}\nvec4 render(in vec3 ro, in vec3 rd) {\n  float sun = clamp(dot(sundir,rd), 0.0, 1.0);\n  vec3 col = vec3(0.6,0.71,0.75) - rd.y*0.2*vec3(1.0,0.5,1.0) + 0.15*0.5;\n  col += 0.2*vec3(1.0,0.6,0.1)*pow(sun,8.0);\n  vec4 res = raymarch(ro, rd, col);\n  col = col * (1.0-res.w) + res.xyz;\n  col += 0.2*vec3(1.0,0.4,0.2)*pow(sun,3.0);\n  return vec4(col, 1.0);\n}";

const testUniforms = {
	tNoise: { value: null },
};

var tilingFrag = "vec4 c1 = texture2D(tDiffuse, pin.uv);\r\nvec4 c2 = texture2D(tDiffuse, pin.uv+vec2(0.5));\r\nfloat a1 = radialMask(pin.uv);\r\nfloat rm2 = radialMask(pin.uv+vec2(0.5));\r\nfloat lm2 = linearMask(pin.uv+vec2(0.5));\r\nfloat a2 = mix(lm2, rm2, cRadialMask);\r\nfloat a = a1+a2;\r\nfloat r = a1*c1.r/a + a2*c2.r/a;\r\nfloat g = a1*c1.g/a + a2*c2.g/a;\r\nfloat b = a1*c1.b/a + a2*c2.b/a;\r\npout.color = vec3(r,g,b);\r\n";

var tilingFragPars = "uniform float cRadialMask;\r\nfloat radialMask(in vec2 uv) {\r\n    vec2 p = abs(fract(uv) - vec2(0.5)) * 2.0;\r\n    return max(1.0-dot(p,p), 0.0001);\r\n}\r\nfloat linearMask(in vec2 uv) {\r\n    vec2 p = abs(fract(uv) - vec2(0.5));\r\n    return max((0.5-max(p.x,p.y)) / 0.5, 0.0001);\r\n}";

const tilingUniforms = {
	cRadialMask: { value: 1.0 },
};

var toonFrag = "if (cToonEnable) {\r\n  vec3 dark = mix( vec3(0.0), vec3(0.5),  step(cToonDark, pout.color) ) ;\r\n  vec3 light = mix( dark, vec3(1.0),  step(cToonLight, pout.color) ) ;\r\n//   vec3 dark = mix( vec3(0.0), vec3( 1.0, 0.4, 0.0),  step(0.8, pout.color) ) ;\r\n//   vec3 light = mix( dark, vec3( 1.0, 0.8, 0.0),  step(0.95, pout.color) ) ;\r\n  pout.color = light;\r\n}";

var toonFragPars = "uniform bool cToonEnable;\r\nuniform float cToonDark;\r\nuniform float cToonLight;";

const toonUniforms = {
	cToonEnable: { value: false },
	cToonDark: { value: 0.8 },
	cToonLight: { value: 0.95 },
};

var trabeculumFrag = "vec2 camctrl = vec2(cCameraPan, cCameraTilt);\r\nif (camctrl.x+camctrl.y == 0.) camctrl.xy = vec2(0.5);\r\n\r\nfloat theta = (camctrl.x*2.-1.)*PI;\r\nfloat phi = (camctrl.y-.5)*PI;\r\nfloat t=3.*time, B=.07; theta += B*cos(t); phi += B*sin(t);\r\n\r\nvec3 cameraPos = vec3(sin(theta)*cos(phi), sin(phi), cos(theta)*cos(phi));\r\nvec3 cameraTarget = vec3(0.);\r\nvec3 ww = normalize(cameraPos - cameraTarget);\r\nvec3 uu = normalize(cross(vec3(0.,1.,0.), ww));\r\nvec3 vv = normalize(cross(ww,uu));\r\nvec2 q = 2.*(pin.uv - vec2(.5,.5));\r\nvec3 rayDir = normalize(q.x*uu + q.y*vv - 1.5*ww);\r\n\r\nvec3 col = vec3(0.);\r\nfloat transp=1., epsC = .01/2.;\r\nfloat l = .5;\r\nfloat density = cDensity * 200.;\r\nvec3 p = cameraPos + l*rayDir, p_=p;\r\nfor (int i=0; i<200; i++) {\r\n    if (float(i)>=density) break;\r\n    float Aloc = tweaknoise(p,true);\r\n    if (Aloc>0.01) {\r\n        float a = 2.*PI*float(i)/density;\r\n        vec3 c = .5+.5*cos(a+vec3(0.,2.*PI/3.,-2.*PI/3.)+time);\r\n        col += transp*c*Aloc;\r\n        col = clamp(col, 0., 1.);\r\n        transp *= 1.-Aloc;\r\n        if (transp<.001) break;\r\n    }\r\n    p += epsC*rayDir;\r\n}\r\nvec3 rgb = col+transp*skyColor;\r\nvec3 gray = vec3(rgb2gray(rgb));\r\npout.color = mix(gray, rgb, cColor);\r\n";

var trabeculumFragPars = "uniform float cDensity;\r\nuniform float cScale;\r\nuniform float cIntensity;\r\nuniform float cTrabeculumVariation;\r\nuniform float cCameraTilt;\r\nuniform float cCameraPan;\r\nuniform float cColor;\r\n\r\nconst vec3 skyColor = 0.*vec3(.7,.8,1.); const float skyTrsp = .5;\r\n\r\nfloat grad = .2/2., scale = 5., thresh = .5;\r\n\r\nvec3 hash13(float n) {\r\n    return fract(sin(n+vec3(0.,12.345,124))*43758.5453);\r\n}\r\nfloat hash31(vec3 n) {\r\n    return rand(n.x+10.*n.y+100.*n.z);\r\n}\r\nvec3 hash33(vec3 n) {\r\n    return hash13(n.x+10.*n.y+100.*n.z);\r\n}\r\nvec4 worley(vec3 p) {\r\n    vec4 d = vec4(1e15);\r\n    vec3 ip = floor(p);\r\n    for (float i=-1.;i<2.; i++) {\r\n        for (float j=-1.;j<2.;j++) {\r\n            for (float k=-1.;k<2.;k++) {\r\n                vec3 p0 = ip + vec3(i,j,k);\r\n                vec3 c  = hash33(p0)+p0-p;\r\n                float d0 = dot(c,c);\r\n                if      (d0<d.x) { d.yzw = d.xyz; d.x=d0; }\r\n                else if (d0<d.y) { d.zw  = d.yz;  d.y=d0; }\r\n                else if (d0<d.z) { d.w   = d.z;   d.z=d0; }\r\n                else if (d0<d.w) {                d.w=d0; }\r\n            }\r\n        }\r\n    }\r\n    return sqrt(d);\r\n}\r\n\r\nfloat tweaknoise(vec3 p, bool step) {\r\n    float d1 = smoothstep(grad/2., -grad/2., length(p)-.5);\r\n    float d2 = smoothstep(grad/1., -grad/1., abs(p.z)-.5);\r\n    float d= d1;\r\n    if (cTrabeculumVariation <= .0) d = (1.-d1)*d2;\r\n    if (cTrabeculumVariation >= 2.) d = d2;\r\n    if (d < .5) return 0.;\r\n    grad=.8;\r\n    scale = mix(2.,10.,cScale);\r\n    thresh = .5+.5*(cos(.5*time)+.36*cos(.5*3.*time))/1.36;\r\n    vec4 w = scale*worley(scale*p-vec3(0.,0.,3.*time));\r\n    float v = 1.-1./(1./(w.z-w.x)+1./(w.a-w.x));\r\n\r\n    if (cIntensity < 1.) {\r\n        return v*d*cIntensity;\r\n    } else {\r\n        return smoothstep(thresh-grad/2., thresh+grad/2., v*d);\r\n    }\r\n}\r\n";

const trabeculumUniforms = {
	cDensity: { value: 1.0 },
	cScale: { value: 1.0 },
	cIntensity: { value: 1.0 },
	cTrabeculumVariation: { value: 2.0 },
	cCameraTilt: { value: 0.0 },
	cCameraPan: { value: 0.0 },
	cColor: { value: 1.0 },
};

var turbulentNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat lum = fbm(p, cNoiseOctave, cNoiseFrequency * 128.0, cNoiseAmplitude);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = fbm(p.xx, cNoiseOctave, cNoiseFrequency * 128.0, cNoiseAmplitude);";

var turbulentNoiseFragPars = "float fbm(vec2 v, int octaves, float frequency, float amplitude) {\r\n  const mat2 m = mat2( 0.00, 0.80, -0.80,  0.36 );\r\n  vec2 q = v;\r\n  float f = 0.0;\r\n  f  = 0.5000 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.01;\r\n  f += 0.2500 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.02;\r\n  f += 0.1250 * rpnoise(q, octaves, frequency, amplitude); q = m*q*2.03;\r\n  f += 0.0625 * rpnoise(q, octaves, frequency, amplitude);\r\n\r\n  f = f*1.2 + 0.5;\r\n//   f = sqrt(f);\r\n  return f;\r\n}";

var vert = "attribute vec3 position;\r\nvoid main() {\r\n  gl_Position = vec4(position, 1.0);\r\n}";

var voronoiNoiseFrag = "vec2 p = pin.uv - time*0.1;\r\nfloat lum = iqnoise(p * 48.0 * cNoiseFrequency, 1.0, 0.0);\r\npout.color = vec3(lum);\r\n\r\nfloat graph = iqnoise(p.xx * 48.0 * cNoiseFrequency, 1.0, 0.0);";

var voronoiNoiseFragPars = "// dummy";

var waterCircleWaveFrag = "const float period = 0.2;\r\nconst float amp = 0.05;\r\nconst float lambda = 0.5;\r\nfloat r = sqrt(pow2(pin.position.x) + pow2(pin.position.y));\r\nfloat phase = 2.0 * PI * (time/period - r/lambda);\r\nif (phase >= 0.0 && phase < 2.0*PI) {\r\n  pout.color = vec3((amp * sin(phase)) / sqrt(r));\r\n} else {\r\n  pout.color = vec3(0.0);\r\n}";

var waterPlaneWaveFrag = "const float period = 0.2;\r\nconst float amp = 0.05;\r\nconst float lambda = 0.5;\r\nfloat r = sqrt(pow2(pin.position.x) + pow2(pin.position.y));\r\nfloat phase = 2.0 * PI * (time/period - pin.position.x/lambda - pin.position.y/lambda);\r\nif (phase >= 0.0 && phase < 2.0*PI) {\r\n  pout.color = vec3((amp * sin(phase)));\r\n} else {\r\n  pout.color = vec3(0.0);\r\n}";

var waterTurbulenceFrag = "vec2 p = pin.position * mix(2.0,15.0,cScale);\r\nfloat c = Turb(p);\r\npout.color = vec3(c);";

var waterTurbulenceFragPars = "uniform float cScale;\r\nuniform float cIntensity;\r\n\r\n#define MAX_ITER 2.0\r\n\r\nfloat Turb(vec2 p) {\r\n    vec2 i = p;\r\n    float c = 0.0;\r\n    float inten = cIntensity;\r\n    float r = length(p + vec2(sin(time), sin(time*0.433+2.))*3.);\r\n    for (float n=0.0; n<MAX_ITER; n++) {\r\n        float t = r-time * (1.0 - (1.9/(n+1.)));\r\n        t = r-time/(n+.6);//r-time*(1.+.5/float(n+1.)));\r\n        i -= p + vec2(\r\n            cos(t-i.x-r)+sin(t+i.y),\r\n            sin(t-i.y)+cos(t+i.x)+r);\r\n            c += 1./length(vec2(sin(i.x+t)/inten, cos(i.y+t)/inten));\r\n    }\r\n    c /= float(MAX_ITER);\r\n    c = clamp(c,-1.,1.);\r\n    return c;\r\n}";

const waterTurbulenceUniforms = {
	cScale: { value: 0.5 },
	cIntensity: { value: 0.15 },
};

var waveRingFrag = "float u = sin((atan(pin.position.y, pin.position.x) + time * 0.5) * floor(cFrequency)) * cAmplitude;\r\nfloat t = cWidth / abs(cRadius + u - length(pin.position));\r\nt = pow(abs(t), cPowerExponent);\r\npout.color = vec3(t);";

var waveRingFragPars = "uniform float cRadius;\r\nuniform float cWidth;\r\nuniform float cFrequency;\r\nuniform float cAmplitude;\r\nuniform float cPowerExponent;";

const waveRingUniforms = {
	cRadius: { value: 0.5 },
	cWidth: { value: 0.01 },
	cFrequency: { value: 20.0 },
	cAmplitude: { value: 0.01 },
	cPowerExponent: { value: 1.0 },
};

var woodFrag = "float t = sin(length(pin.position) * cFrequency + time * 5.0);\r\n// float t = sin(length(pin.mouse - pin.position) * 30.0 + time * 5.0);\r\nt = pow(t, cPowerExponent);\r\npout.color = vec3(t);";

var woodFragPars = "uniform float cFrequency;\r\nuniform float cPowerExponent;";

const woodUniforms = {
	cFrequency: { value: 30.0 },
	cPowerExponent: { value: 1.0 },
};

var ShaderChunk = {
	binaryMatrixFrag: binaryMatrixFrag,
	blocksFrag: blocksFrag,
	bonfireFrag: bonfireFrag,
	bonfireFragPars: bonfireFragPars,
	bonfireUniforms: bonfireUniforms,
	booleanNoiseFrag: booleanNoiseFrag,
	booleanNoiseFragPars: booleanNoiseFragPars,
	brushStrokeFrag: brushStrokeFrag,
	brushStrokeFragPars: brushStrokeFragPars,
	brushStrokeUniforms: brushStrokeUniforms,
	bubblesFrag: bubblesFrag,
	bubblesFragPars: bubblesFragPars,
	bubblesUniforms: bubblesUniforms,
	causticsFrag: causticsFrag,
	causticsFragPars: causticsFragPars,
	causticsUniforms: causticsUniforms,
	cellFrag: cellFrag,
	cellFragPars: cellFragPars,
	cellNoiseFrag: cellNoiseFrag,
	cellNoiseFragPars: cellNoiseFragPars,
	cellUniforms: cellUniforms,
	checkerFrag: checkerFrag,
	checkerFragPars: checkerFragPars,
	checkerUniforms: checkerUniforms,
	circleFrag: circleFrag,
	circleFragPars: circleFragPars,
	circleUniforms: circleUniforms,
	cloud2Frag: cloud2Frag,
	cloud2FragPars: cloud2FragPars,
	cloud2Uniforms: cloud2Uniforms,
	cloudFrag: cloudFrag,
	cloudFragPars: cloudFragPars,
	cloudsFrag: cloudsFrag,
	cloudsFragPars: cloudsFragPars,
	cloudsUniforms: cloudsUniforms,
	cloudUniforms: cloudUniforms,
	coherentNoiseFrag: coherentNoiseFrag,
	coherentNoiseFragPars: coherentNoiseFragPars,
	coherentNoiseUniforms: coherentNoiseUniforms,
	color: color,
	colorBalanceFrag: colorBalanceFrag,
	colorBalanceFragPars: colorBalanceFragPars,
	colorBalanceUniforms: colorBalanceUniforms,
	common: common,
	coneFrag: coneFrag,
	coneFragPars: coneFragPars,
	coneUniforms: coneUniforms,
	copyFrag: copyFrag,
	coronaFrag: coronaFrag,
	coronaFragPars: coronaFragPars,
	coronaUniforms: coronaUniforms,
	crossFrag: crossFrag,
	crossFragPars: crossFragPars,
	crossUniforms: crossUniforms,
	derivatives: derivatives,
	diamondGearFrag: diamondGearFrag,
	diamondGearFragPars: diamondGearFragPars,
	diamondGearUniforms: diamondGearUniforms,
	displacementFrag: displacementFrag,
	displacementFragPars: displacementFragPars,
	displacementUniforms: displacementUniforms,
	displacementVert: displacementVert,
	electricFrag: electricFrag,
	electricFragPars: electricFragPars,
	electricUniforms: electricUniforms,
	energyFrag: energyFrag,
	energyFragPars: energyFragPars,
	energyUniforms: energyUniforms,
	explosion2Frag: explosion2Frag,
	explosion2FragPars: explosion2FragPars,
	explosion2Uniforms: explosion2Uniforms,
	explosionFrag: explosionFrag,
	explosionFragPars: explosionFragPars,
	explosionUniforms: explosionUniforms,
	fbmNoise2Frag: fbmNoise2Frag,
	fbmNoise2FragPars: fbmNoise2FragPars,
	fbmNoise2Uniforms: fbmNoise2Uniforms,
	fbmNoise3Frag: fbmNoise3Frag,
	fbmNoise3FragPars: fbmNoise3FragPars,
	fbmNoise3Uniforms: fbmNoise3Uniforms,
	fbmNoiseFrag: fbmNoiseFrag,
	fbmNoiseFragPars: fbmNoiseFragPars,
	fireFrag: fireFrag,
	fireFragPars: fireFragPars,
	fireUniforms: fireUniforms,
	flameEyeFrag: flameEyeFrag,
	flameEyeFragPars: flameEyeFragPars,
	flameEyeUniforms: flameEyeUniforms,
	flameFrag: flameFrag,
	flameFragPars: flameFragPars,
	flamelanceFrag: flamelanceFrag,
	flamelanceFragPars: flamelanceFragPars,
	flamelanceUniforms: flamelanceUniforms,
	flameUniforms: flameUniforms,
	flare2Frag: flare2Frag,
	flare2FragPars: flare2FragPars,
	flare2Uniforms: flare2Uniforms,
	flare3Frag: flare3Frag,
	flare3FragPars: flare3FragPars,
	flare3Uniforms: flare3Uniforms,
	flareFrag: flareFrag,
	flareFragPars: flareFragPars,
	flareUniforms: flareUniforms,
	flashFrag: flashFrag,
	flashFragPars: flashFragPars,
	flashUniforms: flashUniforms,
	flowerFrag: flowerFrag,
	flowerFragPars: flowerFragPars,
	flowerFunFrag: flowerFunFrag,
	flowerFunFragPars: flowerFunFragPars,
	flowerFunUniforms: flowerFunUniforms,
	flowerUniforms: flowerUniforms,
	frag: frag,
	fragEnd: fragEnd,
	fragPars: fragPars,
	glsl3Frag: glsl3Frag,
	glsl3Vert: glsl3Vert,
	gradationFrag: gradationFrag,
	gradationFragPars: gradationFragPars,
	gradationLineFrag: gradationLineFrag,
	gradationLineFragPars: gradationLineFragPars,
	gradationLineUniforms: gradationLineUniforms,
	gradationUniforms: gradationUniforms,
	gradient: gradient,
	gradientNoiseFrag: gradientNoiseFrag,
	gradientNoiseFragPars: gradientNoiseFragPars,
	gradientNoiseUniforms: gradientNoiseUniforms,
	grungeFrag: grungeFrag,
	grungeFragPars: grungeFragPars,
	grungeUniforms: grungeUniforms,
	height2NormalFrag: height2NormalFrag,
	height2NormalFragPars: height2NormalFragPars,
	height2NormalSobelFrag: height2NormalSobelFrag,
	height2NormalUniforms: height2NormalUniforms,
	inksplatFrag: inksplatFrag,
	inksplatFragPars: inksplatFragPars,
	inksplatUniforms: inksplatUniforms,
	julia: julia,
	kochCurveFrag: kochCurveFrag,
	kochCurveFragPars: kochCurveFragPars,
	laser2Frag: laser2Frag,
	laser2FragPars: laser2FragPars,
	laser2Uniforms: laser2Uniforms,
	laserFrag: laserFrag,
	laserFragPars: laserFragPars,
	laserUniforms: laserUniforms,
	lensFlareFrag: lensFlareFrag,
	lensFlareFragPars: lensFlareFragPars,
	lensFlareUniforms: lensFlareUniforms,
	lightFrag: lightFrag,
	lightFragPars: lightFragPars,
	lightningFrag: lightningFrag,
	lightningFragPars: lightningFragPars,
	lightningUniforms: lightningUniforms,
	lightUniforms: lightUniforms,
	magicCircleFrag: magicCircleFrag,
	magicCircleFragPars: magicCircleFragPars,
	mandalasFrag: mandalasFrag,
	mandaraFrag: mandaraFrag,
	mandaraFragPars: mandaraFragPars,
	mandaraUniforms: mandaraUniforms,
	mandelblot: mandelblot,
	marbleNoiseFrag: marbleNoiseFrag,
	marbleNoiseFragPars: marbleNoiseFragPars,
	marbleNoiseUniforms: marbleNoiseUniforms,
	noise: noise,
	noiseGraphFrag: noiseGraphFrag,
	noiseUniforms: noiseUniforms,
	particleFrag: particleFrag,
	particleFragPars: particleFragPars,
	particleUniforms: particleUniforms,
	pentagonFrag: pentagonFrag,
	pentagonFragPars: pentagonFragPars,
	pentagonUniforms: pentagonUniforms,
	perlinNoiseFrag: perlinNoiseFrag,
	polarConversionFrag: polarConversionFrag,
	polarConversionFragPars: polarConversionFragPars,
	randomNoiseFrag: randomNoiseFrag,
	randomNoiseFragPars: randomNoiseFragPars,
	raymarch: raymarch,
	ringAnimFrag: ringAnimFrag,
	ringFrag: ringFrag,
	ringFragPars: ringFragPars,
	ringUniforms: ringUniforms,
	seamlessNoiseFrag: seamlessNoiseFrag,
	seamlessNoiseFragPars: seamlessNoiseFragPars,
	seamlessNoiseUniforms: seamlessNoiseUniforms,
	silexarsFrag: silexarsFrag,
	smokeFrag: smokeFrag,
	smokeFragPars: smokeFragPars,
	smokeUniforms: smokeUniforms,
	snowFrag: snowFrag,
	snowFragPars: snowFragPars,
	snowUniforms: snowUniforms,
	solarFrag: solarFrag,
	solarFragPars: solarFragPars,
	solarUniforms: solarUniforms,
	sparkFrag: sparkFrag,
	sparkFragPars: sparkFragPars,
	sparkNoiseFrag: sparkNoiseFrag,
	sparkNoiseFragPars: sparkNoiseFragPars,
	sparkUniforms: sparkUniforms,
	speckleFrag: speckleFrag,
	speckleFragPars: speckleFragPars,
	speckleUniforms: speckleUniforms,
	squigglesFrag: squigglesFrag,
	squigglesFragPars: squigglesFragPars,
	squigglesUniforms: squigglesUniforms,
	sunFrag: sunFrag,
	sunFragPars: sunFragPars,
	sunUniforms: sunUniforms,
	tessNoiseFrag: tessNoiseFrag,
	tessNoiseFragPars: tessNoiseFragPars,
	tessNoiseUniforms: tessNoiseUniforms,
	testFrag: testFrag,
	testFragPars: testFragPars,
	testUniforms: testUniforms,
	tilingFrag: tilingFrag,
	tilingFragPars: tilingFragPars,
	tilingUniforms: tilingUniforms,
	toonFrag: toonFrag,
	toonFragPars: toonFragPars,
	toonUniforms: toonUniforms,
	trabeculumFrag: trabeculumFrag,
	trabeculumFragPars: trabeculumFragPars,
	trabeculumUniforms: trabeculumUniforms,
	turbulentNoiseFrag: turbulentNoiseFrag,
	turbulentNoiseFragPars: turbulentNoiseFragPars,
	vert: vert,
	voronoiNoiseFrag: voronoiNoiseFrag,
	voronoiNoiseFragPars: voronoiNoiseFragPars,
	waterCircleWaveFrag: waterCircleWaveFrag,
	waterPlaneWaveFrag: waterPlaneWaveFrag,
	waterTurbulenceFrag: waterTurbulenceFrag,
	waterTurbulenceFragPars: waterTurbulenceFragPars,
	waterTurbulenceUniforms: waterTurbulenceUniforms,
	waveRingFrag: waveRingFrag,
	waveRingFragPars: waveRingFragPars,
	waveRingUniforms: waveRingUniforms,
	woodFrag: woodFrag,
	woodFragPars: woodFragPars,
	woodUniforms: woodUniforms,
};

class FxgenShader {

	constructor() {

		this.enables = {};

	}

	enable( key, value ) {

		this.enables[ key ] = value === undefined ? 1 : value;

	}

	clear() {

		this.enables = {};

	}

	checkKey( key ) {

		for ( let i in this.enables ) {

			if ( i === key ) {

				return true;

			}

		}

		return false;

	}

	// +AAA : OR
	// -BBB : NOT
	check( keys ) {

		if ( keys === null || keys.length === 0 ) {

			return true;

		}

		let check = 0;
		for ( let i in keys ) {

			if ( keys[ i ][ 0 ] === '-' ) {

				if ( this.checkKey( keys[ i ].substr( 1 ) ) ) {

					return false;

				}

			} else if ( keys[ i ][ 0 ] === '+' ) {

				if ( check === 0 ) {

					check = 1;

				}

				if ( this.checkKey( keys[ i ].substr( 1 ) ) ) {

					check = 2;

				}

			} else {

				if ( this.checkKey( keys[ i ] ) === false ) {

					return false;

				}

			}

		}

		if ( check > 0 && check < 2 ) {

			return false;

		}

		return true;

	}

	generateDefines() {

		return {
			NOISE_OCTAVE: 8,
			NOISE_PERSISTENCE: 0.5,
		};

	}

	addUniform( uniforms, keys, chunk ) {

		if ( this.check( keys ) ) {

			uniforms.push( ShaderChunk[ chunk ] );

		}

	}

	generateUniforms() {

		const uniforms = [];

		uniforms.push( {
			resolution: { value: new THREE$1.Vector2() },
			mouse: { value: new THREE$1.Vector2() },
			time: { value: 0.0 },
			cameraPos: { value: new THREE$1.Vector3() },
			cameraDir: { value: new THREE$1.Vector3() },
			tDiffuse: { value: null },
		} );

		//! UNIFORMS

		this.addUniform( uniforms, [], 'noiseUniforms' );
		this.addUniform( uniforms, [ 'DISPLACEMENT' ], 'displacementUniforms' );

		this.addUniform( uniforms, [ 'WOOD' ], 'woodUniforms' );
		this.addUniform( uniforms, [ 'CIRCLE' ], 'circleUniforms' );
		this.addUniform( uniforms, [ 'SOLAR' ], 'solarUniforms' );
		this.addUniform( uniforms, [ 'SPARK' ], 'sparkUniforms' );
		this.addUniform( uniforms, [ 'RING' ], 'ringUniforms' );
		this.addUniform( uniforms, [ 'GRADATION' ], 'gradationUniforms' );
		this.addUniform( uniforms, [ 'GRADATIONLINE' ], 'gradationLineUniforms' );
		this.addUniform( uniforms, [ 'FLASH' ], 'flashUniforms' );
		this.addUniform( uniforms, [ 'CONE' ], 'coneUniforms' );
		this.addUniform( uniforms, [ 'FLOWER' ], 'flowerUniforms' );
		this.addUniform( uniforms, [ 'FLOWERFUN' ], 'flowerFunUniforms' );
		this.addUniform( uniforms, [ 'WAVERING' ], 'waveRingUniforms' );
		this.addUniform( uniforms, [ 'COHERENTNOISE' ], 'coherentNoiseUniforms' );
		this.addUniform( uniforms, [ 'FBMNOISE2' ], 'fbmNoise2Uniforms' );
		this.addUniform( uniforms, [ 'FBMNOISE3' ], 'fbmNoise3Uniforms' );
		this.addUniform( uniforms, [ 'SEAMLESSNOISE' ], 'seamlessNoiseUniforms' );
		this.addUniform( uniforms, [ 'MARBLENOISE' ], 'marbleNoiseUniforms' );
		this.addUniform( uniforms, [ 'TESSNOISE' ], 'tessNoiseUniforms' );
		this.addUniform( uniforms, [ 'GRADIENTNOISE' ], 'gradientNoiseUniforms' );
		this.addUniform( uniforms, [ '+HEIGHT2NORMAL', '+HEIGHT2NORMALSOBEL' ], 'height2NormalUniforms' );
		this.addUniform( uniforms, [ 'COLORBALANCE' ], 'colorBalanceUniforms' );
		this.addUniform( uniforms, [ 'SMOKE' ], 'smokeUniforms' );
		this.addUniform( uniforms, [ 'CELL' ], 'cellUniforms' );
		this.addUniform( uniforms, [ 'FLAME' ], 'flameUniforms' );
		this.addUniform( uniforms, [ 'FLAMEEYE' ], 'flameEyeUniforms' );
		this.addUniform( uniforms, [ 'FIRE' ], 'fireUniforms' );
		this.addUniform( uniforms, [ 'LIGHTNING' ], 'lightningUniforms' );
		this.addUniform( uniforms, [ 'FLARE' ], 'flareUniforms' );
		this.addUniform( uniforms, [ 'FLARE2' ], 'flare2Uniforms' );
		this.addUniform( uniforms, [ 'FLARE3' ], 'flare3Uniforms' );
		this.addUniform( uniforms, [ 'MAGICCIRCLE' ], 'magicCircleUniforms' );
		this.addUniform( uniforms, [ 'CROSS' ], 'crossUniforms' );
		this.addUniform( uniforms, [ 'EXPLOSION' ], 'explosionUniforms' );
		this.addUniform( uniforms, [ 'EXPLOSION2' ], 'explosion2Uniforms' );
		this.addUniform( uniforms, [ 'CORONA' ], 'coronaUniforms' );
		this.addUniform( uniforms, [ 'LENSFLARE' ], 'lensFlareUniforms' );
		this.addUniform( uniforms, [ 'SUN' ], 'sunUniforms' );
		this.addUniform( uniforms, [ 'LASER' ], 'laserUniforms' );
		this.addUniform( uniforms, [ 'LASER2' ], 'laser2Uniforms' );
		this.addUniform( uniforms, [ 'LIGHT' ], 'lightUniforms' );
		this.addUniform( uniforms, [ 'CLOUD' ], 'cloudUniforms' );
		this.addUniform( uniforms, [ 'CLOUD2' ], 'cloud2Uniforms' );
		this.addUniform( uniforms, [ 'CLOUDS' ], 'cloudsUniforms' );
		this.addUniform( uniforms, [ 'MANDARA' ], 'mandaraUniforms' );
		this.addUniform( uniforms, [ 'TOON' ], 'toonUniforms' );
		this.addUniform( uniforms, [ 'CHECKER' ], 'checkerUniforms' );
		this.addUniform( uniforms, [ 'FLAMELANCE' ], 'flamelanceUniforms' );
		this.addUniform( uniforms, [ 'BONFIRE' ], 'bonfireUniforms' );
		this.addUniform( uniforms, [ 'SNOW' ], 'snowUniforms' );
		this.addUniform( uniforms, [ 'DIAMONDGEAR' ], 'diamondGearUniforms' );
		this.addUniform( uniforms, [ 'BRUSHSTROKE' ], 'brushStrokeUniforms' );
		this.addUniform( uniforms, [ 'SPECKLE' ], 'speckleUniforms' );
		this.addUniform( uniforms, [ 'BUBBLES' ], 'bubblesUniforms' );
		this.addUniform( uniforms, [ 'PENTAGON' ], 'pentagonUniforms' );
		this.addUniform( uniforms, [ 'GRUNGE' ], 'grungeUniforms' );
		this.addUniform( uniforms, [ 'ENERGY' ], 'energyUniforms' );
		this.addUniform( uniforms, [ 'INKSPLAT' ], 'inksplatUniforms' );
		this.addUniform( uniforms, [ 'PARTICLE' ], 'particleUniforms' );
		this.addUniform( uniforms, [ 'ELECTRIC' ], 'electricUniforms' );
		this.addUniform( uniforms, [ 'TILING' ], 'tilingUniforms' );
		this.addUniform( uniforms, [ 'CAUSTICS' ], 'causticsUniforms' );
		this.addUniform( uniforms, [ 'SQUIGGLES' ], 'squigglesUniforms' );
		this.addUniform( uniforms, [ 'WATERTURBULENCE' ], 'waterTurbulenceUniforms' );
		this.addUniform( uniforms, [ 'TRABECULUM' ], 'trabeculumUniforms' );
		this.addUniform( uniforms, [ 'TEST' ], 'testUniforms' );

		return THREE$1.UniformsUtils.clone( THREE$1.UniformsUtils.merge( uniforms ) );

	}

	addCode( codes, keys, chunk ) {

		if ( this.check( keys ) ) {

			codes.push( '//[ ' + chunk + ' ]' );
			codes.push( ShaderChunk[ chunk ] );
			codes.push( '// ' + chunk );
			// codes.push( '' );

		}

	}

	generateVertexShader() {

		const codes = [];

		// this.addCode(codes, [], "common");
		this.addCode( codes, [ 'GLSL3' ], 'glsl3Vert' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementVert' );
		this.addCode( codes, [ '-DISPLACEMENT' ], 'vert' );
		return codes.join( '\n' );

	}

	generateFragmentShader() {

		//! FRAGMENT PARAMETERS

		const codes = [];
		this.addCode( codes, [ 'GLSL3' ], 'glsl3Frag' );
		this.addCode( codes, [], 'common' );
		this.addCode( codes, [], 'color' );
		this.addCode( codes, [], 'gradient' );
		this.addCode( codes, [], 'noise' );
		this.addCode( codes, [], 'raymarch' );
		this.addCode( codes, [], 'fragPars' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementFragPars' );
		this.addCode( codes, [ 'WOOD' ], 'woodFragPars' );
		this.addCode( codes, [ 'CIRCLE' ], 'circleFragPars' );
		this.addCode( codes, [ 'SOLAR' ], 'solarFragPars' );
		this.addCode( codes, [ 'SPARK' ], 'sparkFragPars' );
		this.addCode( codes, [ 'RING' ], 'ringFragPars' );
		this.addCode( codes, [ 'GRADATION' ], 'gradationFragPars' );
		this.addCode( codes, [ 'GRADATIONLINE' ], 'gradationLineFragPars' );
		this.addCode( codes, [ 'FLASH' ], 'flashFragPars' );
		this.addCode( codes, [ 'CONE' ], 'coneFragPars' );
		this.addCode( codes, [ 'FLOWER' ], 'flowerFragPars' );
		this.addCode( codes, [ 'FLOWERFUN' ], 'flowerFunFragPars' );
		this.addCode( codes, [ 'WAVERING' ], 'waveRingFragPars' );
		this.addCode( codes, [ 'COHERENTNOISE' ], 'coherentNoiseFragPars' );
		this.addCode( codes, [ 'BOOLEANNOISE' ], 'booleanNoiseFragPars' );
		this.addCode( codes, [ 'CELLNOISE' ], 'cellNoiseFragPars' );
		this.addCode( codes, [ 'FBMNOISE' ], 'fbmNoiseFragPars' );
		this.addCode( codes, [ 'FBMNOISE2' ], 'fbmNoise2FragPars' );
		this.addCode( codes, [ 'FBMNOISE3' ], 'fbmNoise3FragPars' );
		this.addCode( codes, [ 'VORONOINOISE' ], 'voronoiNoiseFragPars' );
		this.addCode( codes, [ 'TURBULENTNOISE' ], 'turbulentNoiseFragPars' );
		this.addCode( codes, [ 'SPARKNOISE' ], 'sparkNoiseFragPars' );
		this.addCode( codes, [ 'RANDOMNOISE' ], 'randomNoiseFragPars' );
		this.addCode( codes, [ 'SEAMLESSNOISE' ], 'seamlessNoiseFragPars' );
		this.addCode( codes, [ 'TESSNOISE' ], 'tessNoiseFragPars' );
		this.addCode( codes, [ 'GRADIENTNOISE' ], 'gradientNoiseFragPars' );
		this.addCode( codes, [ '+HEIGHT2NORMAL', '+HEIGHT2NORMALSOBEL' ], 'height2NormalFragPars' );
		this.addCode( codes, [ 'COLORBALANCE' ], 'colorBalanceFragPars' );
		this.addCode( codes, [ 'POLARCONVERSION' ], 'polarConversionFragPars' );
		this.addCode( codes, [ 'SMOKE' ], 'smokeFragPars' );
		this.addCode( codes, [ 'FLAME' ], 'flameFragPars' );
		this.addCode( codes, [ 'FLAMEEYE' ], 'flameEyeFragPars' );
		this.addCode( codes, [ 'FIRE' ], 'fireFragPars' );
		this.addCode( codes, [ 'CELL' ], 'cellFragPars' );
		this.addCode( codes, [ 'LIGHTNING' ], 'lightningFragPars' );
		this.addCode( codes, [ 'FLARE' ], 'flareFragPars' );
		this.addCode( codes, [ 'FLARE2' ], 'flare2FragPars' );
		this.addCode( codes, [ 'FLARE3' ], 'flare3FragPars' );
		this.addCode( codes, [ 'MAGICCIRCLE' ], 'magicCircleFragPars' );
		this.addCode( codes, [ 'CROSS' ], 'crossFragPars' );
		this.addCode( codes, [ 'EXPLOSION' ], 'explosionFragPars' );
		this.addCode( codes, [ 'EXPLOSION2' ], 'explosion2FragPars' );
		this.addCode( codes, [ 'CORONA' ], 'coronaFragPars' );
		this.addCode( codes, [ 'LENSFLARE' ], 'lensFlareFragPars' );
		this.addCode( codes, [ 'SUN' ], 'sunFragPars' );
		this.addCode( codes, [ 'LASER' ], 'laserFragPars' );
		this.addCode( codes, [ 'LASER2' ], 'laser2FragPars' );
		this.addCode( codes, [ 'LIGHT' ], 'lightFragPars' );
		this.addCode( codes, [ 'CLOUD' ], 'cloudFragPars' );
		this.addCode( codes, [ 'CLOUD2' ], 'cloud2FragPars' );
		this.addCode( codes, [ 'CLOUDS' ], 'cloudsFragPars' );
		this.addCode( codes, [ 'MANDARA' ], 'mandaraFragPars' );
		this.addCode( codes, [ 'TOON' ], 'toonFragPars' );
		this.addCode( codes, [ 'CHECKER' ], 'checkerFragPars' );
		this.addCode( codes, [ 'MARBLENOISE' ], 'marbleNoiseFragPars' );
		this.addCode( codes, [ 'FLAMELANCE' ], 'flamelanceFragPars' );
		this.addCode( codes, [ 'BONFIRE' ], 'bonfireFragPars' );
		this.addCode( codes, [ 'SNOW' ], 'snowFragPars' );
		this.addCode( codes, [ 'DIAMONDGEAR' ], 'diamondGearFragPars' );
		this.addCode( codes, [ 'BRUSHSTROKE' ], 'brushStrokeFragPars' );
		this.addCode( codes, [ 'SPECKLE' ], 'speckleFragPars' );
		this.addCode( codes, [ 'BUBBLES' ], 'bubblesFragPars' );
		this.addCode( codes, [ 'PENTAGON' ], 'pentagonFragPars' );
		this.addCode( codes, [ 'GRUNGE' ], 'grungeFragPars' );
		this.addCode( codes, [ 'ENERGY' ], 'energyFragPars' );
		this.addCode( codes, [ 'INKSPLAT' ], 'inksplatFragPars' );
		this.addCode( codes, [ 'PARTICLE' ], 'particleFragPars' );
		this.addCode( codes, [ 'ELECTRIC' ], 'electricFragPars' );
		this.addCode( codes, [ 'TILING' ], 'tilingFragPars' );
		this.addCode( codes, [ 'CAUSTICS' ], 'causticsFragPars' );
		this.addCode( codes, [ 'SQUIGGLES' ], 'squigglesFragPars' );
		this.addCode( codes, [ 'WATERTURBULENCE' ], 'waterTurbulenceFragPars' );
		this.addCode( codes, [ 'TRABECULUM' ], 'trabeculumFragPars' );
		this.addCode( codes, [ 'TEST' ], 'testFragPars' );

		codes.push( '' );
		codes.push( 'void main() {' );

		this.addCode( codes, [], 'frag' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementFrag' );

		//! FRAGMENT

		// this.addCode(codes, [], "");
		this.addCode( codes, [ 'WOOD' ], 'woodFrag' );
		this.addCode( codes, [ 'CIRCLE' ], 'circleFrag' );
		this.addCode( codes, [ 'SOLAR' ], 'solarFrag' );
		this.addCode( codes, [ 'SPARK' ], 'sparkFrag' );
		this.addCode( codes, [ 'RING' ], 'ringFrag' );
		this.addCode( codes, [ 'GRADATION' ], 'gradationFrag' );
		this.addCode( codes, [ 'GRADATIONLINE' ], 'gradationLineFrag' );
		this.addCode( codes, [ 'FLASH' ], 'flashFrag' );
		this.addCode( codes, [ 'CONE' ], 'coneFrag' );
		this.addCode( codes, [ 'FLOWER' ], 'flowerFrag' );
		this.addCode( codes, [ 'FLOWERFUN' ], 'flowerFunFrag' );
		this.addCode( codes, [ 'WAVERING' ], 'waveRingFrag' );
		this.addCode( codes, [ 'COHERENTNOISE' ], 'coherentNoiseFrag' );
		this.addCode( codes, [ 'PERLINNOISE' ], 'perlinNoiseFrag' );
		this.addCode( codes, [ 'BOOLEANNOISE' ], 'booleanNoiseFrag' );
		this.addCode( codes, [ 'CELLNOISE' ], 'cellNoiseFrag' );
		this.addCode( codes, [ 'FBMNOISE' ], 'fbmNoiseFrag' );
		this.addCode( codes, [ 'FBMNOISE2' ], 'fbmNoise2Frag' );
		this.addCode( codes, [ 'FBMNOISE3' ], 'fbmNoise3Frag' );
		this.addCode( codes, [ 'VORONOINOISE' ], 'voronoiNoiseFrag' );
		this.addCode( codes, [ 'TURBULENTNOISE' ], 'turbulentNoiseFrag' );
		this.addCode( codes, [ 'SPARKNOISE' ], 'sparkNoiseFrag' );
		this.addCode( codes, [ 'RANDOMNOISE' ], 'randomNoiseFrag' );
		this.addCode( codes, [ 'MANDELBLOT' ], 'mandelblotFrag' );
		this.addCode( codes, [ 'JULIA' ], 'juliaFrag' );
		this.addCode( codes, [ 'SEAMLESSNOISE' ], 'seamlessNoiseFrag' );
		this.addCode( codes, [ 'MARBLENOISE' ], 'marbleNoiseFrag' );
		this.addCode( codes, [ 'TESSNOISE' ], 'tessNoiseFrag' );
		this.addCode( codes, [ 'GRADIENTNOISE' ], 'gradientNoiseFrag' );
		this.addCode(
			codes,
			[
				'+COHERENTNOISE',
				'+PERLINNOISE',
				'+BOOLEANNOISE',
				'+CELLNOISE',
				'+FBMNOISE',
				'+FBMNOISE2',
				'+FBMNOISE3',
				'+VORONOINOISE',
				'+TURBULENTNOISE',
				'+SPARKNOISE',
				'+RANDOMNOISE',
				'+SEEMLESSNOISE',
				'+MARBLENOISE',
				'+TESSNOISE',
				'+GRADIENTNOISE'
			],
			'noiseGraphFrag'
		);
		this.addCode( codes, [ 'HEIGHT2NORMAL' ], 'height2NormalFrag' );
		this.addCode( codes, [ 'HEIGHT2NORMALSOBEL' ], 'height2NormalSobelFrag' );
		this.addCode( codes, [ 'POLARCONVERSION' ], 'polarConversionFrag' );
		this.addCode( codes, [ 'COLORBALANCE' ], 'colorBalanceFrag' );
		this.addCode( codes, [ 'SMOKE' ], 'smokeFrag' );
		this.addCode( codes, [ 'FLAME' ], 'flameFrag' );
		this.addCode( codes, [ 'FLAMEEYE' ], 'flameEyeFrag' );
		this.addCode( codes, [ 'FIRE' ], 'fireFrag' );
		this.addCode( codes, [ 'CELL' ], 'cellFrag' );
		this.addCode( codes, [ 'LIGHTNING' ], 'lightningFrag' );
		this.addCode( codes, [ 'FLARE' ], 'flareFrag' );
		this.addCode( codes, [ 'FLARE2' ], 'flare2Frag' );
		this.addCode( codes, [ 'FLARE3' ], 'flare3Frag' );
		this.addCode( codes, [ 'MAGICCIRCLE' ], 'magicCircleFrag' );
		this.addCode( codes, [ 'CROSS' ], 'crossFrag' );
		this.addCode( codes, [ 'EXPLOSION' ], 'explosionFrag' );
		this.addCode( codes, [ 'EXPLOSION2' ], 'explosion2Frag' );
		this.addCode( codes, [ 'CORONA' ], 'coronaFrag' );
		this.addCode( codes, [ 'LENSFLARE' ], 'lensFlareFrag' );
		this.addCode( codes, [ 'SUN' ], 'sunFrag' );
		this.addCode( codes, [ 'LASER' ], 'laserFrag' );
		this.addCode( codes, [ 'LASER2' ], 'laser2Frag' );
		this.addCode( codes, [ 'LIGHT' ], 'lightFrag' );
		this.addCode( codes, [ 'CLOUD' ], 'cloudFrag' );
		this.addCode( codes, [ 'CLOUD2' ], 'cloud2Frag' );
		this.addCode( codes, [ 'CLOUDS' ], 'cloudsFrag' );
		this.addCode( codes, [ 'MANDARA' ], 'mandaraFrag' );
		this.addCode( codes, [ 'COPY' ], 'copyFrag' );
		this.addCode( codes, [ 'CHECKER' ], 'checkerFrag' );
		this.addCode( codes, [ 'FLAMELANCE' ], 'flamelanceFrag' );
		this.addCode( codes, [ 'BONFIRE' ], 'bonfireFrag' );
		this.addCode( codes, [ 'SNOW' ], 'snowFrag' );
		this.addCode( codes, [ 'DIAMONDGEAR' ], 'diamondGearFrag' );
		this.addCode( codes, [ 'BRUSHSTROKE' ], 'brushStrokeFrag' );
		this.addCode( codes, [ 'SPECKLE' ], 'speckleFrag' );
		this.addCode( codes, [ 'BUBBLES' ], 'bubblesFrag' );
		this.addCode( codes, [ 'PENTAGON' ], 'pentagonFrag' );
		this.addCode( codes, [ 'GRUNGE' ], 'grungeFrag' );
		this.addCode( codes, [ 'ENERGY' ], 'energyFrag' );
		this.addCode( codes, [ 'INKSPLAT' ], 'inksplatFrag' );
		this.addCode( codes, [ 'PARTICLE' ], 'particleFrag' );
		this.addCode( codes, [ 'ELECTRIC' ], 'electricFrag' );
		this.addCode( codes, [ 'TILING' ], 'tilingFrag' );
		this.addCode( codes, [ 'CAUSTICS' ], 'causticsFrag' );
		this.addCode( codes, [ 'SQUIGGLES' ], 'squigglesFrag' );
		this.addCode( codes, [ 'WATERTURBULENCE' ], 'waterTurbulenceFrag' );
		this.addCode( codes, [ 'TRABECULUM' ], 'trabeculumFrag' );
		this.addCode( codes, [ 'BINARYMATRIX' ], 'binaryMatrixFrag' );
		this.addCode( codes, [ 'TEST' ], 'testFrag' );

		this.addCode( codes, [ 'TOON' ], 'toonFrag' );

		this.addCode( codes, [], 'fragEnd' );

		codes.push( '}' );
		return codes.join( '\n' );

	}

	createMaterial( uniforms ) {

		const material = new THREE$1.RawShaderMaterial( {
			uniforms: uniforms,
			vertexShader: this.generateVertexShader(),
			fragmentShader: this.generateFragmentShader(),
		} );

		if ( this.check( [ 'GLSL3' ] ) ) {

			material.glslVersion = THREE$1.GLSL3;

		}

		if ( this.check( [ 'INKSPLAT' ] ) ) {

			material.extensions.derivatives = true;

		}

		return material;

	}

	createMaterial( uniforms, options ) {

		const material = new THREE$1.RawShaderMaterial(
			Object.assign(
				{
					uniforms: uniforms,
					vertexShader: this.generateVertexShader(),
					fragmentShader: this.generateFragmentShader(),
				},
				options
			)
		);

		if ( this.check( [ 'GLSL3' ] ) ) {

			material.glslVersion = THREE$1.GLSL3;

		}

		if ( this.check( [ 'INKSPLAT' ] ) ) {

			material.extensions.derivatives = true;

		}

		return material;

	}

	createStandardMaterial( uniforms ) {

		const material = new THREE$1.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: this.generateVertexShader(),
			fragmentShader: this.generateFragmentShader(),
		} );

		return material;

	}

}

const FxgenShaderUtils = {

	SetShaderParameter( uniforms, key, value ) {

		if ( key in uniforms ) {

			if ( uniforms[ key ].value instanceof THREE$1.Color ) {

				if ( value instanceof THREE$1.Color ) {

					uniforms[ key ].value.copy( value );

				} else {

					uniforms[ key ].value.copy( new THREE$1.Color( value ) );

				}

			} else if (
				uniforms[ key ].value instanceof THREE$1.Color ||
				uniforms[ key ].value instanceof THREE$1.Vector2 ||
				uniforms[ key ].value instanceof THREE$1.Vector3 ||
				uniforms[ key ].value instanceof THREE$1.Vector4 ||
				uniforms[ key ].value instanceof THREE$1.Matrix3 ||
				uniforms[ key ].value instanceof THREE$1.Matrix4
			) {

				uniforms[ key ].value.copy( value );

			} else if ( uniforms[ key ].value instanceof THREE$1.CubeTexture || uniforms[ key ].value instanceof THREE$1.Texture ) {

				uniforms[ key ].value = value;

			} else if ( uniforms[ key ].value instanceof Array ) {

				for ( let i = 0; i < value.length; ++i ) {

					uniforms[ key ].value[ i ] = value[ i ];

				}

			} else {

				uniforms[ key ].value = value;

			}

		}

	},

	SetShaderArrayParameter( uniforms, arrayKey, index, key, value ) {

		if ( arrayKey in uniforms ) {

			if ( key in uniforms[ arrayKey ].value[ index ] ) {

				if (
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Color ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector2 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector3 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Vector4 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Matrix3 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Matrix4
				) {

					uniforms[ arrayKey ].value[ index ][ key ].copy( value );

				} else if (
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.CubeTexture ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE$1.Texture
				) {

					uniforms[ arrayKey ].value[ index ][ key ] = value;

				} else if ( uniforms[ arrayKey ].value[ index ][ key ] instanceof Array ) {

					for ( let i = 0; i < value.length; ++i ) {

						uniforms[ arrayKey ].value[ index ][ key ][ i ] = value[ i ];

					}

				} else {

					uniforms[ arrayKey ].value[ index ][ key ] = value;

				}

			}

		}

	},

	GetDefaultShaderParameters() {

		return {
			time: 0.0,
		};

	},

};

export { AreaLight, ClearMaskPass, ClearPass, Composer, CopyPass, EdgePass, FxgenShader, FxgenShaderUtils, GPUParticle, HeightField, MaskPass, Ocean, Pass, RectLight, RenderPass, SSAARenderPass, SSAOPass, ScreenPass, ScreenSprite, Shader, ShaderChunk$1 as ShaderChunk, ShaderLib, ShaderPass, ShaderUtils, ShadowMesh, Solar, TAARenderPass, TubeLight, UnrealBloomPass, ViewAlpha, ViewB, ViewDecodeDepth, ViewDecodeRGB, ViewDepth, ViewG, ViewR, ViewRGB, all, any, buildGause, buildKernel, clearTextOut, createPlaneReflectMatrix, createShadowedLight, degrees, dumpMatrix4, floatFormat, gauss, pow2, radians, textOut, textOutMatrix4 };
