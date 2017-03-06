  vec2 cloudsUV = vec2(vUv.x + cloudsTranslation, vUv.y);
  vec2 cloudsPerturb = texture2D(tCloudsPerturb, cloudsUV).xy * cloudsScale;
  cloudsPerturb.xy += cloudsUV + vec2(cloudsTranslation);
  vec3 sunLight = max(reflectedLight.indirectDiffuse, vec3(0.2));
  reflectedLight.indirectDiffuse += texture2D(tClouds, cloudsPerturb).rgb * cloudsBrightness * sunLight;
// reflectedLight.indirectDiffuse += texture2D(tClouds, vUv).rgb * cloudsBrightness;