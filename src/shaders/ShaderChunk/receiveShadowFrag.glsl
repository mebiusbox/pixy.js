float shadowDepth = unpackRGBAToDepth(texture2DProj(tShadow, vShadowMapUV));
float shadowColor = (shadowDepth * vDepth.w < vDepth.z-shadowBias) ? 1.0 - shadowDensity : 1.0;
directLight.color *= vec3(shadowColor);