  // float NoL = max(dot(directLight.direction, geometry.normal), 0.0);
  reflectedLight.directDiffuse += surfaceColor * directLight.color * NoL;

  float subLamb = max(smoothstep(-rollOff, 1.0, NoL) - smoothstep(0.0, 1.0, NoL), 0.0);
  reflectedLight.directDiffuse += subColor * subLamb * velvetStrength;

  float VoN = 1.0 - dot(geometry.viewDir, geometry.normal);
  reflectedLight.directSpecular += (vec3(VoN) * fuzzySpecColor) * velvetStrength;