  float d = vShadowMapUV.z / vShadowMapUV.w;
  gl_FragColor = packDepthToRGBA(d);