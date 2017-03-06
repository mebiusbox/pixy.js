  float fogParamA = fogFar / (fogFar - fogNear);
  float fogParamB = -1.0 / (fogFar - fogNear);
  float fogFactor = 1.0 - (fogParamA + hpos.w * fogParamB);
  vFogFactor = clamp(fogFactor, 0.0, 1.0) * fogAlpha;