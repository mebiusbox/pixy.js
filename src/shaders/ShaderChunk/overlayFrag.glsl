// https://github.com/GameTechDev/CloudsGPUPro6/blob/master/fx/Terrain.fx
// https://github.com/GameTechDev/CloudySky/blob/master/fx/Terrain.fx

vec4 mtrlWeights = texture2D(tOverlayMask, uv);
mtrlWeights /= max(dot(mtrlWeights, vec4(1.0,1.0,1.0,1.0)), 1.0);
float baseMaterialWeight = clamp(1.0 - dot(mtrlWeights, vec4(1,1,1,1)), 0.0, 1.0);
vec4 baseMaterialDiffuse = texture2D(tOverlay1, uv * overlay1Scale);
mat4 materialColors;
materialColors[0] = texture2D(tOverlay2, uv * overlay2Scale) * mtrlWeights.x;
materialColors[1] = texture2D(tOverlay3, uv * overlay3Scale) * mtrlWeights.y;
materialColors[2] = texture2D(tOverlay4, uv * overlay4Scale) * mtrlWeights.z;
materialColors[3] = texture2D(tOverlay5, uv * overlay5Scale) * mtrlWeights.w;
material.diffuseColor.rgb *= (baseMaterialDiffuse * baseMaterialWeight + materialColors * mtrlWeights).rgb;