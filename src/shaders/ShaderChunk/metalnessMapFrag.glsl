  vec4 metalnessRGBA = texture2D(tMetalness, uv);
  metalnessFactor *= metalnessRGBA.r;