for (int i=0; i<PIXY_SPOT_LIGHTS_NUM; ++i) {
  getSpotDirectLightIrradiance(spotLights[i], geometry, directLight);
  if (directLight.visible) {
    updateLight(directLight);
    computeLight(directLight, geometry, material, reflectedLight);
  }
}