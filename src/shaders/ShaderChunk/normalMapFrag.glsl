  vec4 normalRGBA = texture2D(tNormal, uv);
  vec3 bump = (normalRGBA.rgb - vec3(0.5)) * bumpiness;
  geometry.normal = normalize(vNormal + bump.x * vTangent + bump.y * vBinormal);
// geometry.normal = perturbNormal2Arb(-vViewPosition, normalize(vNormal));