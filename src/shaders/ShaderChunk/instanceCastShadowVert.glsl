  vec3 vPos = (modelMatrix * vec4(position, 1.0)).xyz;
  float windStrength = (uv.y * uv.y) * (sin(grassTime + color.y * PI) * 0.5 + 0.5) * color.x;
  vPos += offsets;
  vPos += grassWindDirection * grassWindPower * windStrength;
  vec4 hpos = lightViewProjectionMatrix * vec4(vPos, 1.0);
  vShadowMapUV = hpos;