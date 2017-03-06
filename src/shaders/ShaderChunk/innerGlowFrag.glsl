  float glow = 1.0 - max(0.0, dot(geometry.normal, geometry.viewDir));
  float glowPow = max(glow / (innerGlowBase * (1.0 - glow) + glow), 0.0) * innerGlowSub;
  glowPow = max(0.0, glowPow - innerGlowRange) * (1.0 / (1.0 - innerGlowRange));
  reflectedLight.indirectSpecular += innerGlowColor * glowPow;