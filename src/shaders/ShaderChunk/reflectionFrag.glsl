vec3 cameraToVertex = normalize(vWorldPosition - cameraPosition);

// Transforming Normal Vectors with the Inverse Transformation
vec3 worldNormal = inverseTransformDirection(geometry.normal, viewMatrix);

vec3 vReflect = reflect(cameraToVertex, worldNormal);
vReflect.x = -vReflect.x; // flip
reflectedLight.indirectSpecular += textureCube(tEnvMap, vReflect).rgb * reflectionStrength;