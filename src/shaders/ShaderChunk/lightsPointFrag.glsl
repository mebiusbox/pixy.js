for (int i=0; i<PIXY_POINT_LIGHTS_NUM; ++i) {
  getPointDirectLightIrradiance(pointLights[i], geometry, directLight);
  if (directLight.visible) {
    updateLight(directLight);
    computeLight(directLight, geometry, material, reflectedLight);
  }
}
