material.specularRoughness = roughnessFactor;

float luminance = 0.3 * material.diffuseColor.x + 0.6 * material.diffuseColor.y + 0.1 * material.diffuseColor.z;
vec3 tint = luminance > 0.0 ? material.diffuseColor / luminance : vec3(1.0);
specularColor = mix(0.5 * 0.08 * mix(vec3(1.0), tint, SpecularTint), material.diffuseColor, Metallic);

//material.specularColor = mix(vec3(0.04), material.diffuseColor, metalnessFactor);
//material.diffuseColor = material.diffuseColor * (1.0 - metalnessFactor);
Metallic = metalnessFactor;