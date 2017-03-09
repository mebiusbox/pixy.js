  float h = normalize(vWorldPosition + offset).y;
  reflectedLight.indirectDiffuse += mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));