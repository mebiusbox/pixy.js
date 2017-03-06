  vec3 cameraToVertex = normalize(vWorldPosition - cameraPosition);

  // Transforming Normal Vectors with the Inverse Transformation
  vec3 worldNormal = inverseTransformDirection(geometry.normal, viewMatrix);

  float krmin = reflectionStrength * fresnelReflectionScale;
  float invFresnelExponent = 1.0 / fresnelExponent;
  float ft = pow(abs(dot(worldNormal, cameraToVertex)), invFresnelExponent);
  float fresnel = mix(reflectionStrength, krmin, ft);
  vec3 vReflect = reflect(cameraToVertex, worldNormal);
  vReflect.x = -vReflect.x; // flip
  reflectedLight.indirectSpecular += textureCube(tEnvMap, vReflect).rgb * fresnel;