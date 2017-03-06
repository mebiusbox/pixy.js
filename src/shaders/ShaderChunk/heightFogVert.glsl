  float heightFogParamA = heightFogFar / (heightFogFar - heightFogNear);
  float heightFogParamB = -1.0 / (heightFogFar - heightFogNear);
  float heightFogFactor = 1.0 - (heightFogParamA + vWorldPosition.y * heightFogParamB);
  vHeightFogFactor = clamp(heightFogFactor, 0.0, 1.0) * heightFogAlpha;