  vec4 color2RGBA = texture2D(tDiffuse2, uv);
  material.diffuseColor.rgb = (1.0 - color2RGBA.a) * material.diffuseColor.rgb + color2RGBA.rgb * color2RGBA.a;