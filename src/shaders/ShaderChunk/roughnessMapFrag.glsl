  vec4 roughnessRGBA = texture2D(tRoughness, uv);
  roughnessFactor *= roughnessRGBA.r;