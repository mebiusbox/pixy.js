  float glow = 1.0 - max(0.0, dot(geometry.normal, geometry.viewDir));
  float glowPow = max(glow / (innerGlowBase * (1.0 - glow) + glow), 0.0) * innerGlowSub;
  glowPow = max(0.0, glowPow - innerGlowRange) * (1.0 / max(1.0 - innerGlowRange, 0.00001));
  glowPow = min(glowPow, 1.0);
  // glowPow = min(1.0, glowPow*step(innerGlowRange, glowPow));
  reflectedLight.indirectSpecular += innerGlowColor * glowPow;
  // reflectedLight.indirectSpecular += vec3(glowPow);
  // reflectedLight.indirectSpecular += vec3(glow);