  float rim = 1.0 - saturate(dot(geometry.normal, geometry.viewDir));
  float LE = pow(max(dot(-geometry.viewDir, directLight.direction), 0.0), 30.0);
  reflectedLight.directSpecular += rimLightColor * rim * LE * rimLightCoef;