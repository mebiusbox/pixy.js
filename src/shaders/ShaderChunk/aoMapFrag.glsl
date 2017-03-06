  float obscure = texture2D(tAO, vUv).r * aoStrength;
  reflectedLight.directDiffuse *= obscure;
  reflectedLight.directDiffuse += reflectedLight.directSpecular * obscure;
  reflectedLight.directSpecular = vec3(0.0);