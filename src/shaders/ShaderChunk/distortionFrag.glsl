  vec4 distortionNormal = texture2D(tDistortion, vUv);
  vec3 distortion = (distortionNormal.rgb - vec3(0.5)) * distortionStrength;
// float distortionInfluence = 1.0;
// material.diffuseColor.rgb *= texture2D(tDiffuse, vUv + distortion.xy * distortionInfluence).rgb;
  material.diffuseColor.rgb *= texture2D(tDiffuse, vUv2 + distortion.xy).rgb;