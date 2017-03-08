  vec4 hpos = lightViewProjectionMatrix * modelMatrix * vec4(position, 1.0);
  vShadowMapUV = hpos;