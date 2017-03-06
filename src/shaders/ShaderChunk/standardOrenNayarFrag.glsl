vec3 N = geometry.normal;
vec3 L = directLight.direction;
vec3 V = geometry.viewDir;

float NoL = saturate(dot(N, L));
float NoV = saturate(dot(N, V));
vec3 H = normalize(L+V);
float NoH = saturate(dot(N, H));
float VoH = saturate(dot(V, H));
float LoV = saturate(dot(L, V));
        
float a = pow2(material.specularRoughness);

vec3 cdiff = DiffuseOrenNayar(material.diffuseColor, NoV, NoL, LoV, material.specularRoughness);
vec3 cspec = PBR_Specular_CookTorrance(material.specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);

vec3 irradiance = directLight.color * NoL;
irradiance *= PI; // punctual light

reflectedLight.directDiffuse += cdiff * directLight.color * PI;
reflectedLight.directSpecular += cspec * irradiance;