import { ShaderLib } from '../shaders/ShaderLib.js';
import { ScreenPass } from './screenPass.js';

var EdgePass = function(aspect, strength, color, idedge, resolution) {
  
  ScreenPass.call(this);
  
  this.aspect = aspect;
  this.strength = strength;
  this.color = color;
  this.idedge = idedge;
  this.source = null;
  
  var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
  this.edgeBuffer = new THREE.WebGLRenderTarget(resolution, resolution, pars);
  this.edgeExpandBuffer = new THREE.WebGLRenderTarget(resolution, resolution, pars);
  
  var edgeShader = ShaderLib.edge;
  this.edgeUniforms = THREE.UniformsUtils.clone(edgeShader.uniforms);
  this.edgeMaterial = new THREE.ShaderMaterial({
    uniforms: this.edgeUniforms,
    vertexShader: edgeShader.vertexShader,
    fragmentShader: edgeShader.fragmentShader
  });
  
  var edgeExpandShader = ShaderLib.edgeExpand;
  this.edgeExpandUniforms = THREE.UniformsUtils.clone(edgeExpandShader.uniforms);
  this.edgeExpandMaterial = new THREE.ShaderMaterial({
    uniforms: this.edgeExpandUniforms,
    vertexShader: edgeExpandShader.vertexShader,
    fragmentShader: edgeExpandShader.fragmentShader
  });
  
  var edgeIDShader = ShaderLib.edgeID;
  this.idUniforms = THREE.UniformsUtils.clone(edgeIDShader.uniforms);
  this.idMaterial = new THREE.ShaderMaterial({
    uniforms: this.idUniforms,
    vertexShader: edgeIDShader.vertexShader,
    fragmentShader: edgeIDShader.fragmentShader
  });
  
  var compositeShader = ShaderLib.edgeComposite;
  this.compositeUniforms = THREE.UniformsUtils.clone(compositeShader.uniforms);
  this.compositeMaterial = new THREE.ShaderMaterial({
    uniforms: this.compositeUniforms,
    vertexShader: compositeShader.vertexShader,
    fragmentShader: compositeShader.fragmentShader
  });
};

EdgePass.prototype = Object.assign(Object.create(ScreenPass.prototype), {
  
  constructor: EdgePass,
  
  render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
    
    if (this.idedge) {
      this.idUniforms.aspect.value = this.aspect;
      this.idUniforms.step.value = 1.0;
      this.idUniforms.tDiffuse.value = this.source;
      this.quad.material = this.idMaterial;
      renderer.render(this.scene, this.camera, this.edgeBuffer);
      this.quad.material = null;
    } else {
      this.edgeUniforms.aspect.value = this.aspect;
      this.edgeUniforms.tDiffuse.value = this.source;
      this.quad.material = this.edgeMaterial;
      renderer.render(this.scene, this.camera, this.edgeBuffer);
      this.quad.material = null;
    }
    
    var edgeTexture = this.edgeBuffer.texture;
    if (this.strength > 0.0) {
      this.edgeExpandUniforms.aspect.value = this.aspect;
      this.edgeExpandUniforms.strength.value = this.strength;
      this.edgeExpandUniforms.tDiffuse.value = this.edgeBuffer.texture;
      this.quad.material = this.edgeExpandMaterial;
      renderer.render(this.scene, this.camera, this.edgeExpandBuffer);
      this.quad.material = null;
      edgeTexture = this.edgeExpandBuffer.texture;
    }
    
    
    this.compositeUniforms.edgeColor.value = this.color;
    // this.compositeUniforms.edgeColor.value = new THREE.Vector3(1.0, 0.0, 0.0);
    this.compositeUniforms.tEdge.value = edgeTexture;
    this.compositeUniforms.tDiffuse.value = readBuffer.texture;
    this.quad.material = this.compositeMaterial;
    renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    this.quad.material = null;
    
    // this.quad.material = new THREE.MeshBasicMaterial({map: this.edgeBuffer.texture});
    // this.quad.material = new THREE.MeshBasicMaterial({map: this.source});
    // renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    // this.quad.material = null;
  }
});

export { EdgePass };