export var FxgenShaderUtils = {
  
  SetShaderParameter: function(uniforms, key, value) {
    if (key in uniforms) {
      if (uniforms[key].value instanceof THREE.Color) {
        if (value instanceof THREE.Color) {
          uniforms[key].value.copy(value);  
        }
        else {
          uniforms[key].value.copy(new THREE.Color(value));
        }
      }
      else if (uniforms[key].value instanceof THREE.Color ||
          uniforms[key].value instanceof THREE.Vector2 ||
          uniforms[key].value instanceof THREE.Vector3 ||
          uniforms[key].value instanceof THREE.Vector4 ||
          uniforms[key].value instanceof THREE.Matrix3 ||
          uniforms[key].value instanceof THREE.Matrix4) {
        uniforms[key].value.copy(value);
      }
      else if (uniforms[key].value instanceof THREE.CubeTexture ||
               uniforms[key].value instanceof THREE.Texture) {
        uniforms[key].value = value;
      }
      else if (uniforms[key].value instanceof Array) {
        for (var i=0; i<value.length; ++i) {
          uniforms[key].value[i] = value[i];
        }
      }
      else {
        uniforms[key].value = value;
      }
    }
  },
  
  SetShaderArrayParameter: function(uniforms, arrayKey, index, key, value) {
    if (arrayKey in uniforms) {
      if (key in uniforms[arrayKey].value[index]) {
        if (uniforms[arrayKey].value[index][key] instanceof THREE.Color ||
            uniforms[arrayKey].value[index][key] instanceof THREE.Vector2 ||
            uniforms[arrayKey].value[index][key] instanceof THREE.Vector3 ||
            uniforms[arrayKey].value[index][key] instanceof THREE.Vector4 ||
            uniforms[arrayKey].value[index][key] instanceof THREE.Matrix3 ||
            uniforms[arrayKey].value[index][key] instanceof THREE.Matrix4) {
          uniforms[arrayKey].value[index][key].copy(value);
        }
        else if (uniforms[arrayKey].value[index][key] instanceof THREE.CubeTexture ||
                 uniforms[arrayKey].value[index][key] instanceof THREE.Texture) {
          uniforms[arrayKey].value[index][key] = value;
        }
        else if (uniforms[arrayKey].value[index][key] instanceof Array) {
          for (var i=0; i<value.length; ++i) {
            uniforms[arrayKey].value[index][key][i] = value[i];
          }
        }
        else {
          uniforms[arrayKey].value[index][key] = value;
        }
      }
    }
  },
  
  GetDefaultShaderParameters: function() {
    return {
      time: 0.0
    };
  },
  
  GenerateShaderParametersGUI: function(folders, effectController, callback) {
    var gui = new dat.GUI();
    
    // if (folders.indexOf('Color') >= 0) {
    //   h = gui.addFolder("Color");
    //   h.addColor(effectController, "baseColor");
    //   h.add(effectController, "opacity", 0.0, 1.0).onChange(callback);
    // }
  
    return gui;
  }
};