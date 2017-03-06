material.specularRoughness = roughnessFactor;
material.specularColor = mix(vec3(0.04), material.diffuseColor, metalnessFactor);
material.diffuseColor = material.diffuseColor * (1.0 - metalnessFactor);