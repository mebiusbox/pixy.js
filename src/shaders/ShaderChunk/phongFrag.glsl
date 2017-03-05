float NoL = max(dot(directLight.direction, geometry.normal), 0.0);
reflectedLight.directDiffuse += material.diffuseColor * directLight.color * NoL;

vec3 H = normalize(geometry.viewDir + directLight.direction);
float HoN = dot(H, geometry.normal);
float pw = max(HoN / (shininess * (1.0 - HoN) + HoN), 0.0);
float specPow = step(0.0, NoL) * pw;
reflectedLight.directSpecular += specPow * material.specularStrength * directLight.color * NoL;
