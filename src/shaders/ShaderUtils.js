export var ShaderUtils = {
  
  UpdateShaderParameters: function(shader, parameters, camera) {
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    var viewMatrix = camera.matrixWorldInverse; // alias
    
    if (shader.isEnable(['AMBIENT','HEMISPHERE'])) {
      shader.uniforms.skyDirection.value.set(parameters.skyDirectionX, parameters.skyDirectionY, parameters.skyDirectionZ).normalize().transformDirection(viewMatrix);
    }
    
    var numDirectLight = shader.enables['DIRECTLIGHT'] || 0;
    var numPointLight = shader.enables['POINTLIGHT'] || 0;
    var numSpotLight = shader.enables['SPOTLIGHT'] || 0;
    if (numDirectLight > 0) {
      for (var i=0; i<numDirectLight; ++i) {
        shader.uniforms.directLights.value[i].direction.set(parameters.directLightX, parameters.directLightY, parameters.directLightZ).normalize().transformDirection(viewMatrix);
      }
    }
    
    if (numPointLight > 0) {
      for (var i=0; i<numPointLight; ++i) {
        shader.uniforms.pointLights.value[i].position.set(parameters.pointLightX, parameters.pointLightY, parameters.pointLightZ);
        shader.uniforms.pointLights.value[i].position.applyMatrix4(viewMatrix);
      }
    }
    
    if (numSpotLight > 0) {
      for (var i=0; i<numSpotLight; ++i) {
        shader.uniforms.spotLights.value[i].position.set(parameters.spotLightX, parameters.spotLightY, parameters.spotLightZ);
        shader.uniforms.spotLights.value[i].position.applyMatrix4(viewMatrix);
        shader.uniforms.spotLights.value[i].direction.copy(shader.uniforms.spotLights.value[i].position).normalize();
      }
    }
  },

  GenerateShaderParametersGUI: function(shader, callback) {
  
    var gui = new dat.GUI();
    var h;
    var parameters = {};
    if (callback === undefined) callback = function(key, value) {};
    var updateCallback = function(key, value) {
      shader.uniforms[key].value = value;
      callback(key, value);
    };

    {
      h = gui.addFolder("Base");
      
      if (shader.isEnable("SKYDOME")) {
        parameters.topColor = shader.uniforms.topColor.value.getHex();
        parameters.bottomColor = shader.uniforms.bottomColor.value.getHex();
        parameters.exponent = shader.uniforms.exponent.value;
      
        h.addColor(parameters, "topColor").onChange(function(value) {
          shader.uniforms.topColor.value.setHex(value);
          callback("topColor", value);
        });
        h.addColor(parameters, "bottomColor").onChange(function(value) {
          shader.uniforms.bottomColor.value.setHex(value);
          callback("bottomColor", value);
        });
        h.add(parameters, "exponent", 0.0, 1.0).onChange(function(value) { updateCallback("exponent", value); });
      }
      else {
        parameters.baseColor = shader.uniforms.diffuseColor.value.getHex();
        parameters.opacity = shader.uniforms.opacity.value;
      
        h.addColor(parameters, "baseColor").onChange(function(value) {
          shader.uniforms.diffuseColor.value.setHex(value);
          callback("baseColor", value);
        });
        h.add(parameters, "opacity", 0.0, 1.0).onChange(function(value) { updateCallback("opacity", value); });
      }
      
      if (shader.isEnable("STANDARD")) {
        parameters.roughness = shader.uniforms.roughness.value;
        parameters.metalness = shader.uniforms.metalness.value;
        h.add(parameters, "roughness", 0.0, 1.0, 0.01).onChange(function(value) { updateCallback("roughness", value); });
        h.add(parameters, "metalness", 0.0, 1.0, 0.01).onChange(function(value) { updateCallback("metalness", value); });
      }
    }
    
    if (shader.isEnable(['+PHONG', '+FRESNEL', '+REFLECTION', '+ANISOTROPY'])) {
      h = gui.addFolder("Specular");
      
      if (shader.isEnable('FRESNEL')) {
        parameters.fresnelExponent = shader.uniforms.fresnelExponent.value;
        parameters.fresnelReflectionScale = shader.uniforms.fresnelReflectionScale.value;
        h.add(parameters, "fresnelExponent", 0.0, 5.0, 0.025).name("fresnel exponent").onChange(function(value) { updateCallback("fresnelExponent", value); });
        h.add(parameters, "fresnelReflectionScale", 0.0, 1.0, 0.025).name("fresnel scale").onChange(function(value) { updateCallback("fresnelReflectionScale", value); });
      }
      
      if (shader.isEnable('REFLECTION')) {
        parameters.reflectionStrength = shader.uniforms.reflectionStrength.value;
        h.add(parameters, "reflectionStrength", 0.0, 1.0, 0.025).name("reflectionStrength").onChange(function(value) { updateCallback("reflectionStrength", value); });
      }
        
      if (shader.isEnable('PHONG')) {
        parameters.shininess = shader.uniforms.shininess.value;
        h.add(parameters, "shininess", 1.0, 400.0, 1.0).onChange(function(value) { updateCallback("shininess", value); });
      }
      
      if (shader.isEnable(['+PHONG', '+SPECULARMAP'])) {
        parameters.specularStrength = shader.uniforms.specularStrength.value;
        h.add(parameters, "specularStrength", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("specularStrength", value); });
      }
      
      if (shader.isEnable('ANISOTROPY')) {
        parameters.anisotropyExponent = shader.uniforms.anisotropyExponent.value;
        parameters.anisotropyStrength = shader.uniforms.anisotropyStrength.value;
        parameters.anisotropyFresnel = shader.uniforms.anisotropyFresnel.value;
        parameters.anisotropyColor = shader.uniforms.anisotropyColor.value.getHex();
        h.add(parameters, "anisotropyExponent", 0.0, 5000.0, 1.0).onChange(function(value) { updateCallback("anisotropyExponent", value); });
        h.add(parameters, "anisotropyStrength", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("anisotropyStrength", value); });
        h.add(parameters, "anisotropyFresnel", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("anisotropyFresnel", value); });
        h.addColor(parameters, "anisotropyColor").onChange(function(value) {
          shader.uniforms.anisotropyColor.value.setHex(value);
          callback("anisotropyColor", value);
        });
      }
    }
    
    if (shader.isEnable(['+NORMALMAP', '+BUMPMAP', '+PARALLAXMAP'])) {
      h = gui.addFolder("Bump");
      
      if (shader.isEnable(['+NORMALMAP', '+BUMPMAP'])) {
        parameters.bumpiness = shader.uniforms.bumpiness.value;
        h.add(parameters, "bumpiness", 0.0, 1.0, 0.01).onChange(function(value) { updateCallback("bumpiness", value); });
      }
      
      if (shader.isEnable('PARALLAXMAP')) {
        parameters.parallaxHeight = shader.uniforms.parallaxHeight.value;
        parameters.parallaxScale = shader.uniforms.parallaxScale.value;
        h.add(parameters, "parallaxHeight", -1.0, 1.0, 0.025).onChange(function(value) { updateCallback("parallaxHeight", value); });
        h.add(parameters, "parallaxScale", -1.0, 1.0, 0.025).onChange(function(value) { updateCallback("parallaxScale", value); });
      }
    }
    
    if (shader.isEnable("AOMAP")) {
      h = gui.addFolder("Ambient Occlusion");
      parameters.aoStrength = shader.uniforms.aoStrength.value;
      h.add(parameters, "aoStrength", 0.0, 1.0, 0.01).onChange(function(value) { updateCallback("aoStrength", value); });
    }
    
    if (shader.isEnable('VELVET')) {
      h = gui.addFolder("Velvet");
      
      parameters.surfaceColor = shader.uniforms.surfaceColor.value.getHex();
      parameters.fuzzySpecColor = shader.uniforms.fuzzySpecColor.value.getHex();
      parameters.subColor = shader.uniforms.subColor.value.getHex();
      parameters.rollOff = shader.uniforms.rollOff.value;
      parameters.velvetStrength = shader.uniforms.velvetStrength.value;
      h.addColor(parameters, "surfaceColor").onChange(function(value) {
        shader.unifomrs.surfaceColor.value.setHex(value);
        callback("surfaceColor", value);
      });
      h.addColor(parameters, "fuzzySpecColor").onChange(function(value) {
        shader.uniforms.fuzzySpecColor.value.setHex(value);
        callback("fuzzySpecColor", value);
      });
      h.addColor(parameters, "subColor").onChange(function(value) {
        shader.uniforms.subColor.value.setHex(value);
        callback("subColor", value);
      });
      h.add(parameters, "rollOff", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("rollOff", value); });
      h.add(parameters, "velvetStrength", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("velvetStrength", value); });
    }
    
    if (shader.isEnable('INNERGLOW')) {
      h = gui.addFolder("InnerGlow");
      
      parameters.innerGlowColor = shader.uniforms.innerGlowColor.value.getHex();
      parameters.innerGlowBase = shader.uniforms.innerGlowBase.value;
      parameters.innerGlowSub = shader.uniforms.innerGlowSub.value;
      parameters.innerGlowRange = shader.uniforms.innerGlowRange.value;
      h.addColor(parameters, "innerGlowColor").onChange(function(value) {
        shader.uniforms.innerGlowColor.value.setHex(value);
        callback("innerGlowColor", value);
      });
      h.add(parameters, "innerGlowBase", 0.0, 128.0, 0.1).onChange(function(value) { updateCallback("innerGlowBase", value); });
      h.add(parameters, "innerGlowSub", 0.0, 10.0, 0.05).onChange(function(value) { updateCallback("innerGlowSub", value); });
      h.add(parameters, "innerGlowRange", 0.0, 1.0, 0.05).onChange(function(value) { updateCallback("innerGlowRange", value); });
    }
    
    if (shader.isEnable('LINEGLOW')) {
      h = gui.addFolder("LineGlow");
      
      parameters.lineGlowRange = shader.uniforms.lineGlowRange.value;
      parameters.lineGlowPower = shader.uniforms.lineGlowPower.value;
      parameters.lineGlowPlaneX = shader.uniforms.lineGlowPlane.value.x;
      parameters.lineGlowPlaneY = shader.uniforms.lineGlowPlane.value.y;
      parameters.lineGlowPlaneZ = shader.uniforms.lineGlowPlane.value.z;
      
      var cb = function(value) {
        shader.uniforms.lineGlowPlane.value.set(parameters.lineGlowPlaneX, parameters.lineGlowPlaneY, parameters.lineGlowPlaneZ,
          shader.uniforms.lineGlowPlane.value.w);
        callback("lienGlowPlane", shader.uniforms.lineGlowPlane.value);
      };
      
      // h.addColor(effectparametersController, "lineGlowColor").onChange(callback);
      h.add(parameters, "lineGlowRange", 0.0, 5.0, 0.05).onChange(function(value) { updateCallback("lineGlowRange", value); });
      h.add(parameters, "lineGlowPower", 0.0, 10.0, 0.05).onChange(function(value) { updateCallback("lineGlowPower", value); });
      h.add(parameters, "lineGlowPlaneX", 0.0, 1.0, 0.05).onChange(cb);
      h.add(parameters, "lineGlowPlaneY", 0.0, 1.0, 0.05).onChange(cb);
      h.add(parameters, "lineGlowPlaneZ", 0.0, 1.0, 0.05).onChange(cb);
    }
    
    if (shader.isEnable('DISTORTION')) {
      h = gui.addFolder("Distortion");
      
      parameters.distortionStrength = shader.uniforms.distortionStrength.value;
      h.add(parameters, "distortionStrength", -5.0, 5.0, 0.05).onChange(function(value) { updateCallback("distortionStrength", value); });
    }
    
    if (shader.isEnable('UVSCROLL')) {
      h = gui.addFolder('UV Scroll');
      
      parameters.uvScrollSpeedU = shader.uniforms.uvScrollSpeedU.value;
      parameters.uvScrollSpeedV = shader.uniforms.uvScrollSpeedV.value;
      h.add(parameters, "uvScrollSpeedU", -5.0, 5.0, 0.01).onChange(function(value) { updateCallback("uvScrollSpeedU", value); });
      h.add(parameters, "uvScrollSpeedV", -5.0, 5.0, 0.01).onChange(function(value) { updateCallback("uvScrollSpeedV", value); });
    }
    
    if (shader.isEnable('GLASS')) {
      h = gui.addFolder('Glass');
      
      parameters.glassStrength = shader.uniforms.glassStrength.value;
      parameters.glassCurvature = shader.uniforms.glassCurvature.value;
      h.add(parameters, "glassStrength", 0.0, 1.0, 0.01).onChange(function(value) { updateCallback("glassStrength", value); });
      h.add(parameters, "glassCurvature", 0.0, 2.0, 0.01).onChange(function(value) { updateCallback("glassCurvature", value); });
    }
    
    if (shader.isEnable('AMBIENT')) {
      h = gui.addFolder("Ambient Light");
      
      parameters.ambientColor = shader.uniforms.ambientColor.value.getHex();
      h.addColor(parameters, "ambientColor").onChange(function(value) {
        shader.uniforms.ambientColor.value.setHex(value);
        callback("ambientColor", value);
      });
      
      if (shader.isEnable('HEMISPHERE')) {
        // var skyDirectionCallback = function(value) {
        //   shader.uniforms.skyDirection.value.set(parameters.skyDirectionX, parameters.skyDirectionY, parameters.skyDirectionZ);
        //   callback("skyDirection", shader.uniforms.skyDirection.value);
        // };
        
        parameters.skyDirectionX = shader.uniforms.skyDirection.value.x;
        parameters.skyDirectionY = shader.uniforms.skyDirection.value.y;
        parameters.skyDirectionZ = shader.uniforms.skyDirection.value.z;
        parameters.groundColor = shader.uniforms.groundColor.value.getHex();
        h.add(parameters, "skyDirectionX", 0.0, 1.0, 0.025).onChange(function(value) { callback("skyDirectionX", value); });
        h.add(parameters, "skyDirectionY", 0.0, 1.0, 0.025).onChange(function(value) { callback("skyDirectionY", value); });
        h.add(parameters, "skyDirectionZ", 0.0, 1.0, 0.025).onChange(function(value) { callback("skyDirectionZ", value); });
        // h.add(parameters, "skyDirectionX", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
        // h.add(parameters, "skyDirectionY", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
        // h.add(parameters, "skyDirectionZ", 0.0, 1.0, 0.025).onChange(skyDirectionCallback);
        h.addColor(parameters, "groundColor").onChange(function(value) {
          shader.uniforms.groundColor.value.setHex(value);
          callback("groundColor", value);
        });
      }
    }
    
    var numDirectLight = shader.enables['DIRECTLIGHT'] || 0;
    var numPointLight = shader.enables['POINTLIGHT'] || 0;
    var numSpotLight = shader.enables['SPOTLIGHT'] || 0;
    if (numDirectLight > 0 || numPointLight > 0 || numSpotLight > 0) {
      
      if (numDirectLight > 0) {
        h = gui.addFolder("Direct Light");
        
        parameters.directLightX = shader.uniforms.directLights.value[0].direction.x;
        parameters.directLightY = shader.uniforms.directLights.value[0].direction.y;
        parameters.directLightZ = shader.uniforms.directLights.value[0].direction.z;
        parameters.directLightColor = shader.uniforms.directLights.value[0].color.getHex();
        
        // var directLightDirCallback = function(value) {
        //   shader.uniforms.directLights.value[0].direction.set(parameters.directLightX, parameters.directLightY, parameters.directLightZ).normalize();
        //   callback("directLightDirection", shader.uniforms.directLights.value[0].direction);
        // };
        // h.add(parameters, "directLightX", -1.0, 1.0, 0.025).name("x").onChange(directLightDirCallback);
        // h.add(parameters, "directLightY", -1.0, 1.0, 0.025).name("y").onChange(directLightDirCallback);
        // h.add(parameters, "directLightZ", -1.0, 1.0, 0.025).name("z").onChange(directLightDirCallback);
        h.add(parameters, "directLightX", -1.0, 1.0, 0.025).name("x").onChange(function(value) { callback("directLightX", value); });
        h.add(parameters, "directLightY", -1.0, 1.0, 0.025).name("y").onChange(function(value) { callback("directLightY", value); });
        h.add(parameters, "directLightZ", -1.0, 1.0, 0.025).name("z").onChange(function(value) { callback("directLightZ", value); });
        h.addColor(parameters, "directLightColor").name("color").onChange(function(value) {
          shader.uniforms.directLights.value[0].color.setHex(value);
          callback("directLightColor", value);
        });
      }
      
      if (numPointLight > 0) {
        h = gui.addFolder("Point Light");
        
        parameters.pointLightX = shader.uniforms.pointLights.value[0].position.x;
        parameters.pointLightY = shader.uniforms.pointLights.value[0].position.y;
        parameters.pointLightZ = shader.uniforms.pointLights.value[0].position.z;
        parameters.pointLightColor = shader.uniforms.pointLights.value[0].color.getHex();
        parameters.pointLightDistance = shader.uniforms.pointLights.value[0].distance;
        parameters.pointLightDecay = shader.uniforms.pointLights.value[0].decay;
        // var pointLightPosCallback = function(value) {
        //   shader.uniforms.pointLights.value[0].position.set(parameters.pointLightX, parameters.pointLightY, parameters.pointLightZ);
        //   callback("pointLightPosition", shader.uniforms.pointLights.value[0].position);
        // };
        // 
        // h.add(parameters, "pointLightX", -10.0, 10.0, 0.025).name("x").onChange(pointLightPosCallback);
        // h.add(parameters, "pointLightY", -10.0, 10.0, 0.025).name("y").onChange(pointLightPosCallback);
        // h.add(parameters, "pointLightZ", -10.0, 10.0, 0.025).name("z").onChange(pointLightPosCallback);
        h.add(parameters, "pointLightX", -10.0, 10.0, 0.025).name("x").onChange(function(value) { callback("pointLightX", value); });
        h.add(parameters, "pointLightY", -10.0, 10.0, 0.025).name("y").onChange(function(value) { callback("pointLightY", value); });
        h.add(parameters, "pointLightZ", -10.0, 10.0, 0.025).name("z").onChange(function(value) { callback("pointLightZ", value); });
        h.addColor(parameters, "pointLightColor").name("color").onChange(function(value) {
          shader.uniforms.pointLights.value[0].color.setHex(value);
          callback("pointLightColor", value);
        });
        h.add(parameters, "pointLightDistance", 0.0, 100.0, 1.0).onChange(function(value) {
          shader.uniforms.pointLights.value[0].distance = value;
          callback("pointLightDistance", value);
        });
        h.add(parameters, "pointLightDecay", 0.0, 10.0, 0.025).onChange(function(value) {
          shader.uniforms.pointLights.value[0].decay = value;
          callback("pointLightDecay", value);
        });
      }
      
      if (numSpotLight > 0) {
        h = gui.addFolder("Spot Light");
        
        parameters.spotLightX = shader.uniforms.spotLights.value[0].position.x;
        parameters.spotLightY = shader.uniforms.spotLights.value[0].position.y;
        parameters.spotLightZ = shader.uniforms.spotLights.value[0].position.z;
        parameters.spotLightColor = shader.uniforms.spotLights.value[0].color.getHex();
        parameters.spotLightDistance = shader.uniforms.spotLights.value[0].distance;
        parameters.spotLightDecay = shader.uniforms.spotLights.value[0].decay;
        parameters.spotLightAngle = shader.uniforms.spotLights.value[0].coneCos;
        parameters.spotLightPenumbra = shader.uniforms.spotLights.value[0].penumbraCos;
        // var spotLightPosCallback = function(value) {
        //   shader.uniforms.spotLights.value[0].position.set(parameters.spotLightX, parameters.spotLightY, parameters.spotLightZ);
        //   shader.uniforms.spotLights.value[0].direction.copy(shader.uniforms.spotLights.value[0].position).normalize();
        //   callback("spotLightPosition", shader.uniforms.spotLights.value[0].position);
        // };
        // 
        // h.add(parameters, "spotLightX", -10.0, 10.0, 0.025).name("x").onChange(spotLightPosCallback);
        // h.add(parameters, "spotLightY", -10.0, 10.0, 0.025).name("y").onChange(spotLightPosCallback);
        // h.add(parameters, "spotLightZ", -10.0, 10.0, 0.025).name("z").onChange(spotLightPosCallback);
        h.add(parameters, "spotLightX", -10.0, 10.0, 0.025).name("x").onChange(function(value) { callback("spotLightX", value); });
        h.add(parameters, "spotLightY", -10.0, 10.0, 0.025).name("y").onChange(function(value) { callback("spotLightY", value); });
        h.add(parameters, "spotLightZ", -10.0, 10.0, 0.025).name("z").onChange(function(value) { callback("spotLightZ", value); });
        h.addColor(parameters, "spotLightColor").name("color").onChange(function(value) {
          shader.uniforms.spotLights.value[0].color.setHex(value);
          callback("spotLightColor", value);
        });
        h.add(parameters, "spotLightDistance", 0.0, 50.0, 1.0).onChange(function(value) {
          shader.uniforms.spotLights.value[0].distance = value;
          callback("spotLightDistance", value); 
        });
        h.add(parameters, "spotLightDecay", 1.0, 10.0, 0.025).onChange(function(value) {
          shader.uniforms.spotLights.value[0].decay = value;
          callback("spotLightDecay", value); 
        });
        h.add(parameters, "spotLightAngle", 0.0001, Math.PI/2.0, 0.025).onChange(function(value) {
          shader.uniforms.spotLights.value[0].coneCos = Math.cos(value);
          callback("spotLightConeCos", value); 
        });
        h.add(parameters, "spotLightPenumbra", 0.0, 1.0, 0.025).onChange(function(value) {
          shader.uniforms.spotLights.value[0].penumbraCos = Math.cos(parameters.spotLightAngle * (1.0 - value));
          callback("spotLightPenumbraCos", value); 
        });
      }
    }
    
    if (shader.isEnable('RIMLIGHT')) {
      h = gui.addFolder("Rim Light");
      
      parameters.rimLightColor = shader.uniforms.rimLightColor.value.getHex();
      parameters.rimLightCoef = shader.uniforms.rimLightCoef.value;
      h.addColor(parameters, "rimLightColor").onChange(function(value) {
        shader.uniforms.rimLightColor.value.setHex(value);
        callback("rimLightColor", value);
      });
      h.add(parameters, "rimLightCoef", 0.0, 1.0, 0.05).onChange(function(value) { updateCallback("rimLightCoef", value); });
    }
    
    if (shader.isEnable('LIGHTMAP')) {
      h = gui.addFolder('Light Map');
      
      parameters.lightMapPower = shader.uniforms.lightMapPower.value;
      parameters.lightMapStrength = shader.uniforms.lightMapStrength.value;
      h.add(parameters, "lightMapPower", 0.0, 10.0, 0.025).onChange(function(value) { updateCallback("lightMapPower", value); });
      h.add(parameters, "lightMapStrength", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("lightMapStrength", value); });
    }

    if (shader.isEnable(['+FOG', '+HEIGHTFOG'])) {
      h = gui.addFolder("Fog");
      
      if (shader.isEnable('FOG')) {
        parameters.fogAlpha = shader.uniforms.fogAlpha.value;
        parameters.fogFar = shader.uniforms.fogFar.value;
        parameters.fogNear = shader.uniforms.fogNear.value;
        parameters.fogColor = shader.uniforms.fogColor.value.getHex();
        h.add(parameters, "fogAlpha", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("fogAlpha", value); });
        h.add(parameters, "fogFar", 0.0, 100.0, 0.1).onChange(function(value) { updateCallback("fogFar", value); });
        h.add(parameters, "fogNear", 0.0, 100.0, 0.1).onChange(function(value) { updateCallback("fogNear", value); });
        h.addColor(parameters, "fogColor").onChange(function(value) {
          shader.uniforms.fogColor.value.setHex(value);
          callback("fogColor", value);
        });
      }
      
      if (shader.isEnable("HEIGHTFOG")) {
        parameters.heightFogAlpha = shader.uniforms.heightFogAlpha.value;
        parameters.heightFogFar = shader.uniforms.heightFogFar.value;
        parameters.heightFogNear = shader.uniforms.heightFogNear.value;
        parameters.heightFogColor = shader.uniforms.heightFogColor.value.getHex();
        h.add(parameters, "heightFogAlpha", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("heightFogAlpha", value); });
        h.add(parameters, "heightFogFar", 0.0, 100.0, 0.1).onChange(function(value) { updateCallback("heightFogFar", value); });
        h.add(parameters, "heightFogNear", 0.0, 100.0, 0.1).onChange(function(value) { updateCallback("heightFogNear", value); });
        h.addColor(parameters, "heightFogColor").onChange(function(value) {
          shader.uniforms.heightFogColor.value.setHex(value);
          callback("heightFogColor", value);
        });
      }
    }
    
    // if (shader.isEnable("PROJECTIONMAP")) {
    //   h = gui.addFolder("Projection Map");
    //   
    //   parameters.projectionScale = shader.uniforms.projectionScale.value;
    //   h.add(parameters, "projectionScale", 0.0, 10.0, 0.025).onChange(function(value) { updateCallback("projectionScale", value); });
    // }
    
    if (shader.isEnable('DISPLACEMENT')) {
      h = gui.addFolder("Displacement");
      
      parameters.displacementScale = shader.uniforms.displacementScale.value;
      parameters.displacementBias = shader.uniforms.displacementBias.value;
      h.add(parameters, "displacementScale", 0.0, 10.0, 0.025).onChange(function(value) { updateCallback("displacementScale", value); });
      h.add(parameters, "displacementBias", 0.0, 10.0, 0.025).onChange(function(value) { updateCallback("displacementBias", value); });
    }
    
    if (shader.isEnable("SKY")) {
      h = gui.addFolder("Sky");
      
      parameters.skyTurbidity = shader.uniforms.skyTurbidity.value;
      parameters.skyRayleigh = shader.uniforms.skyRayleigh.value;
      parameters.skyMieCoefficient = shader.uniforms.skyMieCoefficient.value;
      parameters.skyMieDirectionalG = shader.uniforms.skyMieDirectionalG.value;
      parameters.skyLuminance = shader.uniforms.skyLuminance.value;
      // parameters.skyInclinataion = shader.uniforms.skyInclination.value;
      // parameters.skyAzimuth = shader.uniforms.skyAzimuth.value;
      h.add(parameters, "skyTurbidity", 1.0, 20.0, 0.1).onChange(function(value) { updateCallback("skyTurbidity", value); });
      h.add(parameters, "skyRayleigh", 0.0, 4.0, 0.001).onChange(function(value) { updateCallback("skyRayleigh", value); });
      h.add(parameters, "skyMieCoefficient", 0.0, 0.1, 0.001).onChange(function(value) { updateCallback("skyMieCoefficient", value); });
      h.add(parameters, "skyMieDirectionalG", 0.0, 1.0, 0.001).onChange(function(value) { updateCallback("skyMieDirectionalG", value); });
      h.add(parameters, "skyLuminance", 0.0, 2.0, 0.1).onChange(function(value) { updateCallback("skyLuminance", value); });
      // h.add(parameters, "skyInclination", 0, 1.0, 0.001).onChange(function(value) { updateCallback("skyInclination", value); });
      // h.add(parameters, "skyAzimuth", 0, 1.0, 0.001).onChange(function(value) { updateCallback("skyAzimuth", value); });
    }
    
    if (shader.isEnable("GRASS")) {
      h = gui.addFolder("Grass");
      
      parameters.grassWindDirectionX = shader.uniforms.grassWindDirection.value.x;
      parameters.grassWindDirectionY = shader.uniforms.grassWindDirection.value.y;
      parameters.grassWindDirectionZ = shader.uniforms.grassWindDirection.value.z;
      parameters.grassWindPower = shader.uniforms.grassWindPower.value;
      
      var grassCallback = function(value) {
        shader.uniforms.grassWindDirection.value.set(parameters.grassWindDirectionX, parameters.grassWindDirectionY, parameters.grassWindDirectionZ);
        callback("grassWindDirection", shader.uniforms.grassWindDirection.value);
      };
      
      h.add(parameters, "grassWindDirectionX", 0.0, 1.0, 0.025).onChange(grassCallback);
      h.add(parameters, "grassWindDirectionY", 0.0, 1.0, 0.025).onChange(grassCallback);
      h.add(parameters, "grassWindDirectionZ", 0.0, 1.0, 0.025).onChange(grassCallback);
      h.add(parameters, "grassWindPower", 0.0, 2.0, 0.025).onChange(function(value) { updateCallback("grassWindPower", value); });
    }
    
    if (shader.isEnable("CLOUDS")) {
      h = gui.addFolder("Clouds");
      
      parameters.cloudsScale = shader.uniforms.cloudsScale.value;
      parameters.cloudsBrightness = shader.uniforms.cloudsBrightness.value;
      // parameters.cloudsSpeed = shader.uniforms.cloudsSpeed.value;
      h.add(parameters, "cloudsScale", 0.0, 1.0).onChange(function(value) { updateCallback("cloudsScale", value); });
      h.add(parameters, "cloudsBrightness", 0.0, 1.0).onChange(function(value) { updateCallback("cloudsBrightness", value); });
      // h.add(parameters, "cloudsSpeed", 0.0, 2.0).onChange(function(value) { updateCallback("cloudsSpeed", value); });
    }
    
    if (shader.isEnable("GODRAY")) {
      h = gui.addFolder("GodRay");
      
      parameters.godRayStrength = shader.uniforms.godRayStrength.value;
      parameters.godRayIntensity = shader.uniforms.godRayIntensity.value;
      parameters.godRaySunColor = shader.uniforms.godRaySunColor.value.getHex();
      parameters.godRayBgColor = shader.uniforms.godRayBgColor.value.getHex();
      h.add(parameters, "godRayStrength", 0.0, 1.0).onChange(function(value) { updateCallback("godRayStrength", value); });
      h.add(parameters, "godRayIntensity", 0.0, 2.0).onChange(function(value) { updateCallback("godRayIntensity", value); });
      h.addColor(parameters, "godRaySunColor").onChange(function(value) {
        shader.uniforms.godRaySunColor.value.setHex(value);
        callback("godRaySunColor", value);
      });
      h.addColor(parameters, "godRayBgColor").onChange(function(value) {
        shader.uniforms.godRayBgColor.value.setHex(value);
        callback("godRayBgColor", value);
      });
    }
    
    if (shader.isEnable("RECEIVESHADOW")) {
      h = gui.addFolder("Shadow");
      
      parameters.shadowBias = shader.uniforms.shadowBias.value;
      parameters.shadowDensity = shader.uniforms.shadowDensity.value;
      h.add(parameters, "shadowBias", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("shadowBias", value); });
      h.add(parameters, "shadowDensity", 0.0, 1.0, 0.025).onChange(function(value) { updateCallback("shadowDensity", value); });
    }
    
    if (shader.isEnable("TONEMAPPING")) {
      h = gui.addFolder("ToneMapping", 0, 10);
      
      parameters.toneMappingExposure = shader.uniforms.toneMappingExposure.value;
      parameters.toneMappingWhitePoint = shader.uniforms.toneMappingWhitePoint.value;
      h.add(parameters, "toneMappingExposure", 0.0, 10.0).onChange(function(value) { updateCallback("toneMappingExposure", value); });
      h.add(parameters, "toneMappingWhitePoint", 0.0, 10.0).onChange(function(value) { updateCallback("toneMappingWhitePoint", value); });
    }
    
    return {gui: gui, parameters: parameters};
  }
};

