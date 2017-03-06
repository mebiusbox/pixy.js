  {
    vec4 Vp = viewMatrix * vec4(projectionMapPos, 1.0);
    vec3 Ln = normalize(Vp.xyz - projectionPos);
    vec4 lightContrib = texture2DProj(tProjectionMap, projectionUv);
    reflectedLight.indirectSpecular += projectionColor * lightContrib.xyz * max(dot(Ln,geometry.normal),0.0);
  }