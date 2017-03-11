import { ShaderLib } from '../shaders/ShaderLib.js';
import { ShaderPass } from './shaderPass.js';

var CopyPass = function() {
  
  ShaderPass.call(this, ShaderLib.copy);
  
};

CopyPass.prototype = Object.assign(Object.create(ShaderPass.prototype), {
  
  constructor: CopyPass
  
});

export { CopyPass };