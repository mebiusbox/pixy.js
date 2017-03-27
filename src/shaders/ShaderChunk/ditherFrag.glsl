  // float threshold = bayer(1, vScreenPos.xy * 10.0);
  // material.opacity = step(threshold, material.opacity);
  mat4 StippleThresholdMatrix = mat4(
    1.0 / 17.0, 9.0 / 17.0, 3.0 / 17.0, 11.0 / 17.0,
    13.0 / 17.0, 5.0 / 17.0, 15.0 / 17.0, 7.0 / 17.0,
    4.0 / 17.0, 12.0 / 17.0, 2.0 / 17.0, 10.0 / 17.0,
    16.0 / 17.0, 8.0 / 17.0, 14.0 / 17.0, 6.0 / 17.0);
  
  vec4 thresholdVec = StippleThresholdMatrix[3];
  float scrX = abs(mod(gl_FragCoord.x, 4.0));
  if (scrX <= 1.0) {
    thresholdVec = StippleThresholdMatrix[0];
  }
  else if (scrX <= 2.0) {
    thresholdVec = StippleThresholdMatrix[1];
  }
  else if (scrX <= 3.0) {
    thresholdVec = StippleThresholdMatrix[2];
  }
  
  float threshold = thresholdVec.w;
  float scrY = abs(mod(gl_FragCoord.y, 4.0));
  if (scrY <= 1.0) {
    threshold = thresholdVec.x;
  }
  else if (scrY <= 2.0) {
    threshold = thresholdVec.y;
  }
  else if (scrX <= 3.0) {
    threshold = thresholdVec.z;
  }
  if (material.opacity < threshold) {
    discard;
  }