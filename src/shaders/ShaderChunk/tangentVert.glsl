vNormal = normalize(normalMatrix * normal);
vTangent = normalize(normalMatrix * tangent.xyz);
vBinormal = normalize(cross(vNormal, vTangent) * tangent.w);
