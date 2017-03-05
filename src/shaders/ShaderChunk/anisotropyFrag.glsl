// vec3 H = normalize(directLight.direction + geometry.viewDir);

// reflectedLight.directDiffuse += material.diffuseColor * AnisotropyDiffuseTerm(material.diffuseColor, anisotropyColor, geometry.normal, directLight.direction, geometry.viewDir) * NoL * anisotropyStrength;
reflectedLight.directSpecular += AnisotropySpecularTerm(anisotropyExponent, geometry.normal, H, directLight.direction, geometry.viewDir, vTangent, vBinormal, anisotropyFresnel) * anisotropyColor * NoL * anisotropyStrength;

// vec3 vObjPosition = normalize(geometry.position);
// vec3 asHL = normalize(directLight.direction + vObjPosition);
// vec3 asHH = normalize(asHL + geometry.viewDir);
// float asHHU = dot(asHH, vTangent);
// float asHHV = dot(asHH, vBinormal);
// float asHHN = dot(asHH, vNormal);
// float asHHK = dot(asHH, asHL);
// float asHNU = 1.0;
// float asHNV = anisotropyExponent;
// float asHTerm1 = sqrt((asHNU + 1.0) * (asHNV + 1.0)) / (8.0 * PI);
// float asHexponent = ((asHNU * asHHU * asHHU) + (asHNV * asHHV * asHHV)) / (1.0 - asHHN * asHHN);
// float asHTerm2 = pow(asHHN, asHexponent);
// float asHFresnelTerm = (anisotropyFresnel + (1.0 - anisotropyFresnel) * (1.0 - (pow2(asHHK) * pow3(asHHK))));
// float asHSpecTerm = min(1.0, asHTerm1 * asHTerm2 * asHFresnelTerm * anisotropyStrength);
// reflectedLight.directSpecular += asHSpecTerm * NoL * anisotropyColor;