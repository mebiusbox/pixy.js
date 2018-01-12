  vec4 distortionNormal = texture2D(tDistortion, vUv2);
  vec3 distortion = (distortionNormal.rgb - vec3(0.5)) * distortionStrength;
  uv += distortion.xy;
// float distortionInfluence = 1.0;
// material.diffuseColor.rgb *= texture2D(tDiffuse, vUv + distortion.xy * distortionInfluence).rgb;
// material.diffuseColor.rgb *= texture2D(tDiffuse, vUv2 + distortion.xy).rgb;
// material.diffuseColor.rgb *= texture2D(tDiffuse, uv + distortion.xy).rgb;