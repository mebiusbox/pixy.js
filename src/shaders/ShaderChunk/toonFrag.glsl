float NoL = dot(directLight.direction, geometry.normal);
vec3 H = normalize(geometry.viewDir + directLight.direction);
float HoN = max(dot(H, geometry.normal), 0.0);

vec2 toonUV = vec2(NoL * 0.495 + 0.5, 1.0 - (HoN * 0.98 + 0.01));
vec3 toonColor = texture2D(tToon, toonUV).rgb;
reflectedLight.directDiffuse += material.diffuseColor * directLight.color * toonColor;

// reflectedLight.directSpecular += material.specularStrength * directLight.color * toonColor;