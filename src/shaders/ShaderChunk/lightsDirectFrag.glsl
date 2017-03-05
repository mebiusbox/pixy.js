for (int i=0; i<PIXY_DIRECT_LIGHTS_NUM; ++i) {
  getDirectLightIrradiance(directLights[i], geometry, directLight);
  if (directLight.visible) {
    updateLight(directLight);
    computeLight(directLight, geometry, material, reflectedLight);
  }
}