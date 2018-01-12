  vec3 T = normalize(vTangent);
  vec3 B = normalize(vBinormal);
  vec3 vv = -geometry.viewDir * mat3(T, B, -geometry.normal);
  uv += parallaxHeight * vv.xy;