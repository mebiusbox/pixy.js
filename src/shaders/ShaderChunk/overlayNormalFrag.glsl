  vec4 baseNormal = texture2D(tOverlay1Normal, uv * overlay1Scale);
  mat4 normals;
  normals[0] = texture2D(tOverlay2Normal, uv * overlay2Scale) * mtrlWeights.x;
  normals[1] = texture2D(tOverlay3Normal, uv * overlay3Scale) * mtrlWeights.y;
  normals[2] = texture2D(tOverlay4Normal, uv * overlay4Scale) * mtrlWeights.z;
  normals[3] = texture2D(tOverlay5Normal, uv * overlay5Scale) * mtrlWeights.w;
  vec3 overlayNormal = (baseNormal * baseMaterialWeight + normals * mtrlWeights).xyz;
  overlayNormal = overlayNormal - vec3(0.5);
  geometry.normal = normalize(vNormal + overlayNormal.x * vTangent + overlayNormal.y * vBinormal);