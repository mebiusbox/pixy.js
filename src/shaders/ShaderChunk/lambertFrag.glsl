  float NoL = max(dot(directLight.direction, geometry.normal), 0.0);
  reflectedLight.directDiffuse += material.diffuseColor * directLight.color * NoL;