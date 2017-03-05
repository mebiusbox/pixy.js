vec4 colorRGBA = texture2D(tDiffuse, uv);
material.diffuseColor.rgb *= colorRGBA.rgb;