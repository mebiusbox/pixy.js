  getSpotDirectLightIrradiance(spotLights[0], geometry, directLight);
  if (directLight.visible) {
    updateLight(directLight);
    computeLight(directLight, geometry, material, reflectedLight);
  }