vDepth = lightViewProjectionMatrix * vec4(vWorldPosition, 1.0);
vShadowMapUV = shadowMatrix * vec4(vWorldPosition, 1.0);