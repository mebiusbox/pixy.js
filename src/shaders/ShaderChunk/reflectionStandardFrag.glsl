  {
    float blinnExponent = GGXRoughnessToBlinnExponent(material.specularRoughness);
    
    vec3 irradiance = getLightProbeIndirectIrradiance(geometry.normal, blinnExponent, 10);
    irradiance *= PI; // punctual light
    vec3 diffuse = irradiance * DiffuseLambert(material.diffuseColor);
    reflectedLight.indirectDiffuse += diffuse;
    
    float NoV = saturate(dot(geometry.normal, geometry.viewDir));
    vec3 radiance = getLightProbeIndirectRadiance(geometry.viewDir, geometry.normal, blinnExponent, 10);
    vec3 specular = radiance * EnvBRDFApprox(material.specularColor, material.specularRoughness, NoV);
    reflectedLight.indirectSpecular += specular * reflectionStrength;
  }