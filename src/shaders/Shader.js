import { ShaderChunk } from './ShaderChunk.js';

function Shader() {
  this.enables = {};
  this.uniforms = [];
  this.material = null;
}

Object.assign(Shader.prototype, {
  
  enable: function(key, value) {
    this.enables[key] = (value === undefined) ? 1 : value;
  },
  
  clear: function() {
    this.enables = {};
  },
  
  setParameter: function(key, value) {
    if (key in this.uniforms) {
      if (this.uniforms[key].value instanceof THREE.Color) {
        if (value instanceof THREE.Color) {
          this.uniforms[key].value.copy(value);  
        }
        else {
          this.uniforms[key].value.copy(new THREE.Color(value));
        }
      }
      else if (this.uniforms[key].value instanceof THREE.Color ||
          this.uniforms[key].value instanceof THREE.Vector2 ||
          this.uniforms[key].value instanceof THREE.Vector3 ||
          this.uniforms[key].value instanceof THREE.Vector4 ||
          this.uniforms[key].value instanceof THREE.Matrix3 ||
          this.uniforms[key].value instanceof THREE.Matrix4) {
        this.uniforms[key].value.copy(value);
      }
      else if (this.uniforms[key].value instanceof THREE.CubeTexture ||
               this.uniforms[key].value instanceof THREE.Texture) {
        this.uniforms[key].value = value;
      }
      else if (this.uniforms[key].value instanceof Array) {
        for (var i=0; i<value.length; ++i) {
          this.uniforms[key].value[i] = value[i];
        }
      }
      else {
        this.uniforms[key].value = value;
      }
    }
  },
  
  setParameters: function(values) {
    for (var key in values) {
      this.setParameter(key, values[key]);
    }
  },
  
  setArrayParameter: function(arrayKey, index , key, value) {
    if (arrayKey in this.uniforms) {
      if (key in this.uniforms[arrayKey].value[index]) {
        if (this.uniforms[arrayKey].value[index][key] instanceof THREE.Color ||
            this.uniforms[arrayKey].value[index][key] instanceof THREE.Vector2 ||
            this.uniforms[arrayKey].value[index][key] instanceof THREE.Vector3 ||
            this.uniforms[arrayKey].value[index][key] instanceof THREE.Vector4 ||
            this.uniforms[arrayKey].value[index][key] instanceof THREE.Matrix3 ||
            this.uniforms[arrayKey].value[index][key] instanceof THREE.Matrix4) {
          this.uniforms[arrayKey].value[index][key].copy(value);
        }
        else if (this.uniforms[arrayKey].value[index][key] instanceof THREE.CubeTexture ||
                 this.uniforms[arrayKey].value[index][key] instanceof THREE.Texture) {
          this.uniforms[arrayKey].value[index][key] = value;
        }
        else if (this.uniforms[arrayKey].value[index][key] instanceof Array) {
          for (var i=0; i<value.length; ++i) {
            this.uniforms[arrayKey].value[index][key][i] = value[i];
          }
        }
        else {
          this.uniforms[arrayKey].value[index][key] = value;
        }
      }
    }
  },
  
  setLightParameter: function(index, light, camera) {
    
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    
    if (light instanceof THREE.DirectionalLight) {
      var direction = light.position.clone().applyMatrix4(camera.matrixWorldInverse);
      var targetPos = light.target.position.clone().applyMatrix4(camera.matrixWorldInverse);
      direction.sub(targetPos).normalize();
      this.setDirectLightParameter(index, direction, light.color);
    }
    else if (light instanceof THREE.PointLight) {
      var viewPos = light.position.clone();
      viewPos.applyMatrix4(camera.matrixWorldInverse);
      this.setPointLightParameter(index, viewPos, light.color, light.distance, light.decay);
    }
    else if (light instanceof THREE.SpotLight) {
      var viewPos = light.position.clone();
      viewPos.applyMatrix4(camera.matrixWorldInverse);
      var viewDir = viewPos.clone().normalize();
      this.setSpotLightParameter(index, viewPos, viewDir, light.color, light.distance, light.decay,
        Math.cos(light.angle), Math.cos(light.angle * (1.0 - light.penumbra)));
    }
    else if (light instanceof THREE.AmbientLight) {
      this.setParameter("ambientColor", light.color);
    }
    else if (light instanceof PIXY.AreaLight) {
      var viewPos = light.position.clone();
      viewPos.applyMatrix4(camera.matrixWorldInverse);
      this.setAreaLightParameter(index, viewPos, light.color, light.distance, light.decay, light.radius);
    }
    else if (light instanceof PIXY.TubeLight) {
      var start = new THREE.Vector3().copy(light.start);
      start.applyMatrix4(camera.matrixWorldInverse);
      var end = new THREE.Vector3().copy(light.end);
      end.applyMatrix4(camera.matrixWorldInverse);
      this.setTubeLightParameter(index, start, end, light.color, light.distance, light.decay, light.radius);
    }
    else if (light instanceof PIXY.RectLight) {
      
      var matrix = new THREE.Matrix4();
      matrix.copy(camera.matrixWorldInverse);
      matrix.multiply(light.matrix);
      
      var positions = [];
      for (var i=0; i<light.positions.length; ++i) {
        var p = new THREE.Vector3().copy(light.positions[i]);
        p.applyMatrix4(matrix);
        positions.push(p);
      }
      
      var normal = new THREE.Vector3(0,0,1).applyMatrix4(matrix);
      var tangent = new THREE.Vector3(1,0,0).applyMatrix4(matrix);
      
      this.setRectLightParameter(index, positions, normal, tangent, light.width, light.height, light.color, light.intensity, light.distance, light.decay);
    }
  },
  
  setDirectLightParameter: function(index, direction, color) {
    this.setArrayParameter("directLights", index, "direction", direction);
    this.setArrayParameter("directLights", index, "color", color);
  },
  
  setPointLightParameter: function(index, position, color, distance, decay) {
    this.setArrayParameter("pointLights", index, "position", position);
    this.setArrayParameter("pointLights", index, "color", color);
    this.setArrayParameter("pointLights", index, "distance", distance);
    this.setArrayParameter("pointLights", index, "decay", decay);
  },
  
  setSpotLightParameter: function(index, position, direction, color, distance, decay, coneCos, penumbraCos) {
    this.setArrayParameter("spotLights", index, "position", position);
    this.setArrayParameter("spotLights", index, "direction", direction);
    this.setArrayParameter("spotLights", index, "color", color);
    this.setArrayParameter("spotLights", index, "distance", distance);
    this.setArrayParameter("spotLights", index, "decay", decay);
    this.setArrayParameter("spotLights", index, "coneCos", coneCos);
    this.setArrayParameter("spotLights", index, "penumbraCos", penumbraCos);
  },
  
  setAreaLightParameter: function(index, position, color, distance, decay, radius) {
    this.setArrayParameter("areaLights", index, "position", position);
    this.setArrayParameter("areaLights", index, "color", color);
    this.setArrayParameter("areaLights", index, "distance", distance);
    this.setArrayParameter("areaLights", index, "decay", decay);
    this.setArrayParameter("areaLights", index, "radius", radius);
  },
  
  setTubeLightParameter: function(index, start, end, color, distance, decay, radius) {
    this.setArrayParameter("tubeLights", index, "start", start);
    this.setArrayParameter("tubeLights", index, "end", end);
    this.setArrayParameter("tubeLights", index, "color", color);
    this.setArrayParameter("tubeLights", index, "distance", distance);
    this.setArrayParameter("tubeLights", index, "decay", decay);
    this.setArrayParameter("tubeLights", index, "radius", radius);
  },
  
  setRectLightParameter: function(index, positions, normal, tangent, width, height, color, intensity, distance, decay) {
    this.setArrayParameter("rectLights", index, "numPositions", positions.length);
    for (var i=0; i<positions.length; ++i) {
      this.uniforms.rectLights.value[index].positions[i].copy(positions[i]);
    }
    this.setArrayParameter("rectLights", index, "normal", normal);
    this.setArrayParameter("rectLights", index, "tangent", tangent);
    this.setArrayParameter("rectLights", index, "width", width);
    this.setArrayParameter("rectLights", index, "height", height);
    this.setArrayParameter("rectLights", index, "color", color);
    this.setArrayParameter("rectLights", index, "intensity", intensity);
    this.setArrayParameter("rectLights", index, "distance", distance);
    this.setArrayParameter("rectLights", index, "decay", decay);
  },
  
  ////////////////////////////////////////////////////////////////////////////
  
  // +AAA : OR
  // -BBB : NOT
  isEnable: function(keys) {
    
    if (!keys) return true;
    
    if (keys instanceof Array) {
      if (keys.length === 0) {
        return true;
      }
    
      var check = 0;
      for (var i in keys) {
        if (keys[i][0] === '-') {
          if (this.isEnable(keys[i].substr(1))) {
            return false;
          }
        }
        else if (keys[i][0] === '+') {
          if (check === 0) {
            check = 1;
          }
          if (this.isEnable(keys[i].substr(1))) {
            check = 2;
          }
        }
        else {
          if (this.isEnable(keys[i]) === false) {
            return false;
          }
        }
      }
      
      if (check > 0 && check < 2) {
        return false;
      }
      
      return true;
    }
    else {
      return keys in this.enables;
    }
    
    return false;
  },
  
  _addUniform: function(uniforms, keys, chunk) {
    if (this.isEnable(keys)) {
      uniforms.push(ShaderChunk[chunk]);
    }
  },
  
  // MARK: UNIFORMS
  _generateUniforms: function() {
    var result = [];
    
    result.push({
      "diffuseColor": { value: new THREE.Color() },
      "opacity": { value: 1.0 },
    });
    
    var numDirectLight = this.enables["DIRECTLIGHT"] || 0;
    var numPointLight = this.enables["POINTLIGHT"] || 0;
    var numSpotLight = this.enables["SPOTLIGHT"] || 0;
    if (numDirectLight > 0) result.push(ShaderChunk.lightsDirectUniforms);
    if (numPointLight > 0) result.push(ShaderChunk.lightsPointUniforms);
    if (numSpotLight > 0) result.push(ShaderChunk.lightsSpotUniforms);
    
    var numAreaLight = this.enables["AREALIGHT"] || 0;
    var numTubeLight = this.enables["TUBELIGHT"] || 0;
    var numRectLight = this.enables["RECTLIGHT"] || 0;
    if (numAreaLight > 0) result.push(ShaderChunk.lightsAreaLightUniforms);
    if (numTubeLight > 0) result.push(ShaderChunk.lightsTubeLightUniforms);
    if (numRectLight > 0) result.push(ShaderChunk.lightsRectLightUniforms);
    
    this._addUniform(result, ["AMBIENT"], "ambientUniforms");
    this._addUniform(result, ["AMBIENT", "HEMISPHERE"], "ambientHemisphereUniforms");
    this._addUniform(result, ["PHONG"], "phongUniforms");
    this._addUniform(result, ["PHONG", "SPECULARMAP"], "specularMapUniforms");
    this._addUniform(result, ["PHONG", "-SPECULARMAP"], "specularUniforms");
    this._addUniform(result, ["STANDARD"], "standardUniforms");
    this._addUniform(result, ["ROUGHNESSMAP"], "roughnessMapUniforms");
    this._addUniform(result, ["METALNESSMAP"], "metalnessMapUniforms");
    this._addUniform(result, ["TOON"], "toonUniforms");
    this._addUniform(result, ["REFLECTION"], "reflectionUniforms");
    this._addUniform(result, ["REFLECTION", "FRESNEL"], "fresnelUniforms");
    this._addUniform(result, ["VELVET"], "velvetUniforms");
    this._addUniform(result, ["INNERGLOW"], "innerGlowUniforms");
    this._addUniform(result, ["LINEGLOW"], "lineGlowUniforms");
    this._addUniform(result, ["RIMLIGHT"], "rimLightUniforms");
    this._addUniform(result, ["COLORMAP"], "colorMapUniforms");
    this._addUniform(result, ["NORMALMAP"], "normalMapUniforms");
    this._addUniform(result, ["BUMPMAP"], "bumpMapUniforms");
    this._addUniform(result, ["+BUMPOFFSET","+PARALLAXMAP"], "parallaxMapUniforms");
    this._addUniform(result, ["PARALLAXOCCLUSIONMAP"], "parallaxOcclusionMapUniforms");
    this._addUniform(result, ["DISTORTION"], "distortionUniforms");
    this._addUniform(result, ["+UVSCROLL","+UVSCROLL2"], "uvScrollUniforms");
    this._addUniform(result, ["UVSCALE"], "uvScaleUniforms");
    this._addUniform(result, ["GLASS"], "glassUniforms");
    this._addUniform(result, ["ANISOTROPY"], "anisotropyUniforms");
    this._addUniform(result, ["AOMAP"], "aoMapUniforms");
    this._addUniform(result, ["LIGHTMAP"], "lightMapUniforms");
    this._addUniform(result, ["BILLBOARD"], "billboardUniforms");
    this._addUniform(result, ["FOG"], "fogUniforms");
    this._addUniform(result, ["HEIGHTFOG"], "heightFogUniforms");
    this._addUniform(result, ["HEIGHTFOG", "HEIGHTFOGMAP"], "heightFogMapUniforms");
    this._addUniform(result, ["PROJECTIONMAP"], "projectionMapUniforms");
    this._addUniform(result, ["DISPLACEMENTMAP"], "displacementMapUniforms");
    this._addUniform(result, ["CLIPPINGPLANE"], "clippingPlaneUniforms");
    this._addUniform(result, ["SKY"], "skyUniforms");
    this._addUniform(result, ["SKYDOME"], "skyDomeUniforms");
    this._addUniform(result, ["GRASS"], "grassUniforms");
    this._addUniform(result, ["OVERLAY"], "overlayUniforms");
    this._addUniform(result, ["OVERLAYNORMAL"], "overlayNormalUniforms");
    this._addUniform(result, ["+DITHER"], "timeUniforms");
    this._addUniform(result, ["CASTSHADOW"], "castShadowUniforms");
    this._addUniform(result, ["RECEIVESHADOW"], "receiveShadowUniforms");
    this._addUniform(result, ["DEPTHSHADOW"], "depthShadowUniforms");
    this._addUniform(result, ["CLOUDS"], "cloudsUniforms");
    this._addUniform(result, ["TONEMAPPING"], "toneMappingUniforms");
    this._addUniform(result, ["DEFERRED_GEOMETRY"], "deferredGeometryUniforms");
    this._addUniform(result, ["DEFERRED_LIGHT"], "deferredLightUniforms");
    this._addUniform(result, ["VIEW"], "viewUniforms");
    this._addUniform(result, ["EMISSIVE"], "emissiveUniforms");
    this._addUniform(result, ["EMISSIVEMAP"], "emissiveMapUniforms");
    return THREE.UniformsUtils.clone(THREE.UniformsUtils.merge(result));
  },
  
  _addCode: function(codes, keys, chunk, chunk2) {
    if (this.isEnable(keys)) {
      codes.push("// begin [" + chunk + "]");
      codes.push(ShaderChunk[chunk]);
      codes.push("// end [" + chunk + "]");
      codes.push("");
    }
    else if (chunk2 !== undefined) {
      codes.push("// begin [" + chunk2 + "]");
      codes.push(ShaderChunk[chunk2]);
      codes.push("// end [" + chunk2 + "]");
      codes.push("");
    }
  },
  
  // MARK: VERTEX
  _generateVertexShader: function() {
    var codes = [];
    
    // DEFFERED
    
    if (this.isEnable("DEFERRED_GEOMETRY")) {
      this._addCode(codes, [], "deferredGeometryVert");
      return codes.join("\n");
    }
    if (this.isEnable("DEFERRED_LIGHT")) {
      this._addCode(codes, [], "deferredLightVert");
      return codes.join("\n");
    }
    
    // FORWARD
    
    this._addCode(codes, [], "common");
    this._addCode(codes, ["+CASTSHADOW", "+RECEIVESHADOW"], "packing");
    this._addCode(codes, [], "worldPositionVertFragPars");
    codes.push("varying vec3 vViewPosition;");
    codes.push("varying vec3 vNormal;");
    codes.push("");
    
    this._addCode(codes, ["+COLORMAP","+NORMALMAP","+BUMPMAP","+PROJECTIONMAP","+OVERLAY","+DEPTHSHADOW","+CLOUDS", "+VIEW", "+EMISSIVEMAP"], "uvVertFragPars");
    this._addCode(codes, ["+NORMALMAP","+BUMPOFFSET","+PARALLAXOCCLUSIONMAP", "+ANISOTROPY","+OVERLAYNORMAL"], "tangentVertPars");
    this._addCode(codes, ["+UVSCROLL","+UVSCROLL2"], "uvScrollVertPars");
    this._addCode(codes, ["+GLASS","+DITHER"], "screenVertPars");
    this._addCode(codes, ["DISTORTION"], "distortionVertPars");
    this._addCode(codes, ["ANISOTROPY"], "anisotropyVertPars");
    this._addCode(codes, ["FOG"], "fogVertPars");
    this._addCode(codes, ["HEIGHTFOG"], "heightFogVertPars");
    this._addCode(codes, ["PROJECTIONMAP"], "projectionMapVertPars");
    this._addCode(codes, ["DISPLACEMENTMAP"], "displacementMapVertPars");
    this._addCode(codes, ["GRASS"], "grassVertPars");
    this._addCode(codes, ["CASTSHADOW", "GRASS"], "instanceCastShadowVertPars");
    this._addCode(codes, ["CASTSHADOW", "-GRASS"], "castShadowVertPars");
    this._addCode(codes, ["RECEIVESHADOW"], "receiveShadowVertPars");
    
    if (this.isEnable(["BILLBOARD"])) {
      this._addCode(codes, [], "billboardVertPars");
      this._addCode(codes, [], "billboardVert");
      this._addCode(codes, ["BILLBOARDY"], "billboardYVert", "billboardDefaultVert");
      this._addCode(codes, ["BILLBOARDROTZ"], "billboardRotZVertEnd", "billboardVertEnd");
    }
    else if (this.isEnable(["CASTSHADOW"])) {
      codes.push("void main() {");
      this._addCode(codes, ["GRASS"], "instanceCastShadowVert");
      this._addCode(codes, ["-GRASS"], "castShadowVert");
    }
    else {
      codes.push("void main() {");
      codes.push("  vec3 transformed = position;");
      codes.push("  vec3 objectNormal = vec3(normal);");
      
      this._addCode(codes, ["DISPLACEMENTMAP"], "displacementMapVert");
      this._addCode(codes, [], "worldPositionVert");
      this._addCode(codes, ["GRASS"], "grassVert");
      
      codes.push("  vec4 mvPosition = viewMatrix * vec4(vWorldPosition, 1.0);");
      codes.push("  vec4 hpos = projectionMatrix * mvPosition;");
    
      if (this.isEnable(["+NORMALMAP","+ANISOTROPY","+OVERLAYNORMAL"])) {
        codes.push("  vNormal.xyz = inverseTransformDirection(objectNormal, modelMatrix);");
      }
      else {
        codes.push("  vNormal.xyz = normalMatrix * objectNormal;");
      }
    
      codes.push("  vViewPosition = -mvPosition.xyz;");
      codes.push("");
    }
    
    // chunk here
    if (this.isEnable(["+COLORMAP","+NORMALMAP","+BUMPMAP","+OVERLAY","+DEPTHSHADOW","+CLOUDS","+VIEW","+EMISSIVEMAP"])) {
      this._addCode(codes, ["UVPROJECTION"], "uvProjectionVert", "uvVert");
      this._addCode(codes, ["UVSCROLL"], "uvScrollVert");
      this._addCode(codes, ["DISTORTION"], "distortionVert");
      this._addCode(codes, ["UVSCROLL2"], "uvScroll2Vert");
    }
    
    this._addCode(codes, ["+NORMALMAP","+BUMPOFFSET","+PARALLAXOCCLUSIONMAP", "+ANISOTROPY","+OVERLAYNORMAL"], "tangentVert");
    this._addCode(codes, ["+GLASS","+DITHER"], "screenVert");
    this._addCode(codes, ["GLASS"], "glassVert");
    this._addCode(codes, ["ANISOTRPY"], "anisotropyVert");
    this._addCode(codes, ["FOG"], "fogVert");
    this._addCode(codes, ["HEIGHTFOG"], "heightFogVert");
    this._addCode(codes, ["PROJECTIONMAP"], "projectionMapVert");
    this._addCode(codes, ["RECEIVESHADOW"], "receiveShadowVert");
    
    codes.push("  gl_Position = hpos;");
    codes.push("}");
    
    return codes.join("\n");
  },
  
  // MARK: FRAGMENTS
  _generateFragmentShader: function() {
    var codes = [];
    
    // DEFERRED
    
    if (this.isEnable("DEFERRED_GEOMETRY")) {
      this._addCode(codes, [], "deferredGeometryFrag");
      return codes.join("\n");
    }
    if (this.isEnable("DEFERRED_LIGHT")) {
      this._addCode(codes, [], "deferredLightFrag");
      return codes.join("\n");
    }
    
    // FORWARD
    
    if (this.isEnable("VIEW")) {
      this._addCode(codes, [], "viewFrag");
      return codes.join("\n");
    }
    
    this._addCode(codes, [], "common");
    
    if (this.isEnable(["CASTSHADOW"])) {
      this._addCode(codes, [], "packing");
      this._addCode(codes, [], "castShadowFragPars");
      this._addCode(codes, ["GRASS"], "uvVertFragPars");
      this._addCode(codes, ["GRASS"], "colorMapFragPars");
      
      codes.push("");
      codes.push("void main() {");
      
      this._addCode(codes, ["GRASS"], "instanceColorMapDiscardFrag");
      this._addCode(codes, [], "castShadowFrag");
      
      codes.push("}");
      return codes.join("\n");
    }
    
    if (this.isEnable(["DEPTHSHADOW"])) {
      this._addCode(codes, [], "packing");
      this._addCode(codes, [], "uvVertFragPars");
      this._addCode(codes, [], "depthShadowFragPars");
      
      codes.push("");
      codes.push("void main() {");
      
      this._addCode(codes, [], "depthShadowFrag");
      
      codes.push("}");
      return codes.join("\n");
    }
    
    if (this.isEnable(["DEPTH"])) {
      // this._addCode(codes, [], "packing");
      this._addCode(codes, [], "depthFragPars");
      
      codes.push("");
      codes.push("void main() {");
      
      this._addCode(codes, [], "depthFrag");
      
      codes.push("}");
      return codes.join("\n");
    }
    
    this._addCode(codes, ["RECEIVESHADOW"], "packing");
    this._addCode(codes, ["AMBIENT"], "ambientFragPars");
    this._addCode(codes, ["AMBIENT", "HEMISPHERE"], "ambientHemisphereFragPars");
    // this._addCode(codes, ["DEPTH"], "depthFragPars");
    
    var numDirectLight = this.enables["DIRECTLIGHT"] || 0;
    var numPointLight = this.enables["POINTLIGHT"] || 0;
    var numSpotLight = this.enables["SPOTLIGHT"] || 0;
    codes.push(this._generateLightsFragPars(numDirectLight, numPointLight, numSpotLight));
    
    var numAreaLight = this.enables["AREALIGHT"] || 0;
    var numTubeLight = this.enables["TUBELIGHT"] || 0;
    var numRectLight = this.enables["RECTLIGHT"] || 0;
    codes.push(this._generateAreaLightsFragPars(numAreaLight, numTubeLight, numRectLight));
    
    codes.push("uniform vec3 diffuseColor;");
    codes.push("uniform float opacity;");
    codes.push("varying vec3 vNormal;");
    codes.push("varying vec3 vViewPosition;");
    codes.push("");
    
    this._addCode(codes, [], "worldPositionVertFragPars");
    this._addCode(codes, ["STANDARD"], "bsdfs");
    this._addCode(codes, ["STANDARD"], "standardFragPars");
    this._addCode(codes, ["STANDARD", "ROUGHNESSMAP"], "roughnessMapFragPars");
    this._addCode(codes, ["STANDARD", "METALNESSMAP"], "metalnessMapFragPars");
    this._addCode(codes, ["PHONG"], "phongFragPars");
    this._addCode(codes, ["PHONG", "SPECULARMAP"], "specularMapFragPars");
    this._addCode(codes, ["PHONG", "-SPECULARMAP"], "specularFragPars");
    this._addCode(codes, ["TOON"], "toonFragPars");
    this._addCode(codes, ["REFLECTION"], "reflectionFragPars");
    this._addCode(codes, ["REFLECTION", "FRESNEL"], "fresnelFragPars");
    this._addCode(codes, ["REFLECTION", "-FRESNEL", "STANDARD"], "lightsPars");
    this._addCode(codes, ["VELVET"], "velvetFragPars");
    this._addCode(codes, ["INNERGLOW"], "innerGlowFragPars");
    this._addCode(codes, ["LINEGLOW"], "lineGlowFragPars");
    this._addCode(codes, ["RIMLIGHT"], "rimLightFragPars");
    this._addCode(codes, ["+COLORMAP","+NORMALMAP","+PROJECTIONMAP","+OVERLAY","+CLOUDS","+EMISSIVEMAP"], "uvVertFragPars");
    this._addCode(codes, ["UVSCALE"], "uvScaleFragPars");
    this._addCode(codes, ["COLORMAP"], "colorMapFragPars");
    this._addCode(codes, ["+NORMALMAP","+BUMPOFFSET","+PARALLAXOCCLUSIONMAP", "+ANISOTROPY","+OVERLAYNORMAL"], "tangentFragPars");
    this._addCode(codes, ["NORMALMAP"], "normalMapFragPars");
    this._addCode(codes, ["+BUMPOFFSET", "+PARALLAXMAP"], "parallaxMapFragPars");
    this._addCode(codes, ["PARALLAXOCCLUSIONMAP"], "parallaxOcclusionMapFragPars");
    this._addCode(codes, ["BUMPMAP"], "bumpMapFragPars");
    this._addCode(codes, ["PROJECTIONMAP"], "projectionMapFragPars");
    this._addCode(codes, ["DISTORTION"], "distortionFragPars");
    this._addCode(codes, ["GLASS"], "glassFragPars");
    this._addCode(codes, ["ANISOTROPY"], "anisotropyFragPars");
    this._addCode(codes, ["AOMAP"], "aoMapFragPars");
    this._addCode(codes, ["LIGHTMAP"], "lightMapFragPars");
    this._addCode(codes, ["FOG"], "fogFragPars");
    this._addCode(codes, ["HEIGHTFOG"], "heightFogFragPars");
    this._addCode(codes, ["HEIGHTFOG", "HEIGHTFOGMAP"], "heightFogMapFragPars");
    this._addCode(codes, ["CLIPPINGPLANE"], "clippingPlaneFragPars");
    this._addCode(codes, ["SKY"], "skyFragPars");
    this._addCode(codes, ["SKYDOME"], "skyDomeFragPars");
    this._addCode(codes, ["OVERLAY"], "overlayFragPars");
    this._addCode(codes, ["OVERLAYNORMAL"], "overlayNormalFragPars");
    this._addCode(codes, ["DITHER"], "ditherFragPars");
    this._addCode(codes, ["+DITHER"], "timeFragPars");
    this._addCode(codes, ["RECEIVESHADOW"], "receiveShadowFragPars");
    this._addCode(codes, ["CLOUDS"], "cloudsFragPars");
    this._addCode(codes, ["TONEMAPPING"], "toneMappingFragPars");
    this._addCode(codes, ["EMISSIVE"], "emissiveFragPars");
    this._addCode(codes, ["EMISSIVEMAP"], "emissiveMapFragPars");

    
    // if (this.check(["TONEMAPPING"])) {
    //   codes.push("vec3 toneMapping(vec3) { return " + this.enables["TONEMAPPING"] + "ToneMapping(x); }");
    // }
    
    if (numAreaLight > 0) {
      this._addCode(codes, [], "standardAreaLightFrag");
    }
    if (numTubeLight > 0) {
      this._addCode(codes, [], "standardTubeLightFrag");
    }
    if (numRectLight > 0) {
      this._addCode(codes, [], "standardRectLightFrag");
    }
    
    if (numDirectLight > 0 || numPointLight > 0 || numSpotLight > 0) {
    
      codes.push("void updateLight(inout IncidentLight directLight) {");
        
        this._addCode(codes, ["-SKY", "-NOLIT", "RECEIVESHADOW"], "receiveShadowFrag");
        
      codes.push("}");
      codes.push("");
      codes.push("void computeLight(const in IncidentLight directLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {");
      
        // lighting chunk here
        this._addCode(codes, ["PHONG", "TOON"], "toonFrag");
        this._addCode(codes, ["PHONG", "-TOON"], "phongFrag");
        this._addCode(codes, ["STANDARD", "ORENNAYAR"], "standardOrenNayarFrag");
        this._addCode(codes, ["STANDARD", "-ORENNAYAR"], "standardFrag");
        this._addCode(codes, ["-STANDARD", "-PHONG"], "lambertFrag");
        this._addCode(codes, ["VELVET"], "velvetFrag");
        this._addCode(codes, ["RIMLIGHT"], "rimLightFrag");
        this._addCode(codes, ["ANISOTROPY"], "anisotropyFrag");
      
      codes.push("}");
      codes.push("");
    }
    
    codes.push("void main() {");
    
      this._addCode(codes, ["CLIPPINGPLANE"], "clippingPlaneFrag");
      this._addCode(codes, [], "beginFrag");
      this._addCode(codes, ["DEBUG"], "beginFragDebug");
      // this._addCode(codes, ["CLIPPINGPLANEALPHA"], "clippingPlaneFrag");
      
      // chunk here
      this._addCode(codes, ["AMBIENT", "HEMISPHERE"], "ambientHemisphereFrag");
      this._addCode(codes, ["AMBIENT", "-HEMISPHERE"], "ambientFrag");
      this._addCode(codes, ["+COLORMAP", "+NORMALMAP", "+BUMPMAP", "+OVERLAY", "+CLOUDS", "+EMISSIVEMAP"], "uvFrag");
      this._addCode(codes, ["UVSPHERICAL"], "uvSphericalFrag");
      this._addCode(codes, ["UVHEMISPHERICAL"], "uvHemiSphericalFrag");
      this._addCode(codes, ["UVSCALE"], "uvScaleFrag");
      this._addCode(codes, ["PARALLAXMAP"], "parallaxMapFrag");
      this._addCode(codes, ["PARALLAXOCCLUSIONMAP"], "parallaxOcclusionMapFrag");
      this._addCode(codes, ["BUMPOFFSET"], "parallaxFrag");
      this._addCode(codes, ["DISTORTION"], "distortionFrag");
      this._addCode(codes, ["COLORMAP"], "colorMapFrag");
      this._addCode(codes, ["COLORMAP", "COLORMAPALPHA"], "colorMapAlphaFrag");
      this._addCode(codes, ["OPACITY"], "opacityFrag");
      this._addCode(codes, ["DITHER"], "ditherFrag");
      this._addCode(codes, ["DISCARD"], "discardFrag");
      this._addCode(codes, ["OVERLAY"], "overlayFrag");
      this._addCode(codes, ["OVERLAYNORMAL"], "overlayNormalFrag");
      this._addCode(codes, ["NORMALMAP"], "normalMapFrag");
      this._addCode(codes, ["BUMPMAP"], "bumpMapFrag");
      this._addCode(codes, ["PHONG", "SPECULARMAP"], "specularMapFrag");
      this._addCode(codes, ["PHONG", "-SPECULARMAP"], "specularFrag");
      this._addCode(codes, ["STANDARD"], "roughnessFrag");
      this._addCode(codes, ["STANDARD", "ROUGHNESSMAP"], "roughnessMapFrag");
      this._addCode(codes, ["STANDARD"], "metalnessFrag");
      this._addCode(codes, ["STANDARD", "METALNESSMAP"], "metalnessMapFrag");
      this._addCode(codes, ["STANDARD"], "lightsStandardFrag");
      this._addCode(codes, ["SKY"], "skyFrag");
      this._addCode(codes, ["-SKY", "NOLIT"], "nolitFrag");
      if (this.isEnable(["-SKY", "-NOLIT"])) {
        codes.push(this._generateLightsFrag(numDirectLight, numPointLight, numSpotLight));
        codes.push(this._generateAreaLightsFrag(numAreaLight, numTubeLight, numRectLight));
      }
      this._addCode(codes, ["SKYDOME"], "skyDomeFrag");
      this._addCode(codes, ["REFLECTION", "FRESNEL"], "fresnelFrag");
      this._addCode(codes, ["REFLECTION", "-FRESNEL", "STANDARD"], "reflectionStandardFrag");
      this._addCode(codes, ["REFLECTION", "-FRESNEL", "-STANDARD"], "reflectionFrag");
      this._addCode(codes, ["LIGHTMAP"], "lightMapFrag");
      this._addCode(codes, ["GLASS"], "glassFrag");
      this._addCode(codes, ["AOMAP"], "aoMapFrag");
      this._addCode(codes, ["PROJECTIONMAP"], "projectionMapFrag");
      this._addCode(codes, ["INNERGLOW", "INNERGLOWSUBTRACT"], "innerGlowSubtractFrag");
      this._addCode(codes, ["INNERGLOW", "-INNERGLOWSUBTRACT"], "innerGlowFrag");
      this._addCode(codes, ["LINEGLOW"], "lineGlowFrag");
      // this._addCode(codes, ["DEPTH"], "depthFrag");
      this._addCode(codes, ["CLOUDS"], "cloudsFrag");
      
      this._addCode(codes, ["EMISSIVE"], "emissiveFrag");
      this._addCode(codes, ["EMISSIVEMAP"], "emissiveMapFrag");
      this._addCode(codes, [], "accumulateFrag");
      
      this._addCode(codes, ["FOG"], "fogFrag");
      this._addCode(codes, ["HEIGHTFOG", "HEIGHTFOGMAP"], "heightFogMapFrag");
      this._addCode(codes, ["HEIGHTFOG", "-HEIGHTFOGMAP"], "heightFogFrag");
      this._addCode(codes, ["TONEMAPPING"], "toneMappingFrag");
      
      this._addCode(codes, [], "endFrag");
      this._addCode(codes, ["DEBUG"], "endFragDebug");
    codes.push("}");
    
    return codes.join("\n");
  },
  
  _generateLightsFragPars: function(numDirect, numPoint, numSpot) {
    if (numDirect <= 0 && numPoint <= 0 && numSpot <= 0) {
      return "";
    }
    
    var code = [];
    code.push(ShaderChunk["lightsFragPars"]);
    
    if (numDirect > 0) {
      code.push("#define PIXY_DIRECT_LIGHTS_NUM " + numDirect);
      code.push("uniform DirectLight directLights[ PIXY_DIRECT_LIGHTS_NUM ];");
    }
    
    if (numPoint > 0) {
      code.push("#define PIXY_POINT_LIGHTS_NUM " + numPoint);
      code.push("uniform PointLight pointLights[ PIXY_POINT_LIGHTS_NUM ];");
    }
    
    if (numSpot > 0) {
      code.push("#define PIXY_SPOT_LIGHTS_NUM " + numSpot);
      code.push("uniform SpotLight spotLights[ PIXY_SPOT_LIGHTS_NUM ];");
    }
    
    return code.join("\n");
  },
  
  _generateAreaLightsFragPars: function(numArea, numTube, numRect) {
    if (numArea <= 0 && numTube <= 0 && numRect <= 0) {
      return "";
    }
    
    var code = [];
    code.push(ShaderChunk["lightsFragPars"]);
    
    if (numArea > 0) {
      code.push("#define PIXY_AREA_LIGHTS_NUM " + numArea);
      code.push("uniform AreaLight areaLights[ PIXY_AREA_LIGHTS_NUM ];");
    }
    
    if (numTube > 0) {
      code.push("#define PIXY_TUBE_LIGHTS_NUM " + numTube);
      code.push("uniform TubeLight tubeLights[ PIXY_TUBE_LIGHTS_NUM ];");
    }
    
    if (numRect > 0) {
      code.push("#define PIXY_RECT_LIGHTS_NUM " + numRect);
      code.push("uniform RectLight rectLights[ PIXY_RECT_LIGHTS_NUM ];");
    }
    
    return code.join("\n");
  },
  
  _generateLightsFrag: function(numDirect, numPoint, numSpot) {
    if (numDirect <= 0 && numPoint <= 0 && numSpot <= 0) {
      return "";
    }
    
    var code = [];
    
    code.push("  IncidentLight directLight;");
    
    if (numDirect == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsDirectFragUnroll"]);
    }
    else if (numDirect > 0) {
      code.push(ShaderChunk["lightsDirectFrag"]);
    }
    
    if (numPoint == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsPointFragUnroll"]);
    }
    else if (numPoint > 0) {
      code.push(ShaderChunk["lightsPointFrag"]);
    }
    
    if (numSpot == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsSpotFragUnroll"]);
    }
    else if (numSpot > 0) {
      code.push(ShaderChunk["lightsSpotFrag"]);
    }
    
    return code.join("\n");
  },
  
  _generateAreaLightsFrag: function(numArea, numTube, numRect) {
    if (numArea <= 0 && numTube <= 0 && numRect <= 0) {
      return "";
    }
    
    var code = [];
    
    code.push("  IncidentLight directLight;");
    
    if (numArea == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsAreaLightFragUnroll"]);
    }
    else if (numArea > 0) {
      code.push(ShaderChunk["lightsAreaLightFrag"]);
    }
    
    if (numTube == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsTubeLightFragUnroll"]);
    }
    else if (numTube > 0) {
      code.push(ShaderChunk["lightsTubeLightFrag"]);
    }
    
    if (numRect == 1) {
      // THREE.WebGLProgram: gl.getProgramInfoLog() C:\fakepath(496,3-100): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll
      code.push(ShaderChunk["lightsRectLightFragUnroll"]);
    }
    else if (numRect > 0) {
      code.push(ShaderChunk["lightsRectLightFrag"]);
    }
    
    return code.join("\n");
  },
  
  build: function(options) {
    this.uniforms = this._generateUniforms();
    
    var params = {
      uniforms: this.uniforms,
      vertexShader: this._generateVertexShader(),
      fragmentShader: this._generateFragmentShader()
    };
    
    if (this.isEnable(["+DEFERRED_GEOMETRY", "+DEFERRED_LIGHT"])) {
      this.material = new THREE.RawShaderMaterial(Object.assign(params, options));
      return;
    }
    
    this.material = new THREE.ShaderMaterial(Object.assign(params, options));
    
    if (/* this.isEnable('NORMALMAP') || */this.isEnable('BUMPMAP') || this.isEnable('PARALLAXOCCLUSIONMAP')) {
      this.material.extensions.derivatives = true;
    };
    
    if (this.isEnable(['STANDARD', 'REFLECTION']) || this.isEnable('PARALLAXOCCLUSIONMAP')) {
      this.material.extensions.shaderTextureLOD = true;
    };
  }
});

export { Shader };
