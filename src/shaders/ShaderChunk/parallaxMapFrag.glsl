  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, -vNormal);
  uv += (texture2D(tNormal, vUv).a * parallaxHeight + parallaxScale) * vv.xy;