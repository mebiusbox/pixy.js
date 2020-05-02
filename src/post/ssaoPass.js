import { ShaderLib } from '../shaders/ShaderLib.js';
import { ScreenPass } from './screenPass.js';
import { radians } from '../utils.js';

var SSAOPass = function(parameters) {
  
  ScreenPass.call(this);
  
  this.angleBias = parameters.angleBias || 40.0;
  this.radius = parameters.radius || 4.5;
  this.maxRadius = parameters.maxRadius || 0.5;
  this.strength = parameters.strength || 10.0;
  this.resolution = parameters.resolution || new THREE.Vector2(512,512);
  this.depthTexture = parameters.depthTexture || null;
  this.sceneCamera = parameters.camera || null;
  this.downsampling = parameters.downsampling || 2;
  this.ssaoOnly = false;
  
  var pars = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    generateMipmaps: false,
    stencilBuffer: false
  };
  
  this.rtBlur1 = new THREE.WebGLRenderTarget(this.resolution.x/this.downsampling, this.resolution.y/this.downsampling, pars);
  this.rtBlur2 = new THREE.WebGLRenderTarget(this.resolution.x/this.downsampling, this.resolution.y/this.downsampling, pars);
  
  this.makeUniforms = THREE.UniformsUtils.clone(ShaderLib.ssao2.uniforms);
  this.makeMaterial = new THREE.ShaderMaterial({
    uniforms: this.makeUniforms,
    vertexShader: ShaderLib.ssao2.vertexShader,
    fragmentShader: ShaderLib.ssao2.fragmentShader,
    depthTest: false,
    depthWrite: false
  });
  
  this.blurXUniforms = THREE.UniformsUtils.clone(ShaderLib.ssao2Blur.uniforms);
  this.blurXMaterial = new THREE.ShaderMaterial({
    uniforms: this.blurXUniforms,
    vertexShader: ShaderLib.ssao2Blur.vertexShader,
    fragmentShader: ShaderLib.ssao2Blur.fragmentShader,
    depthTest: false,
    depthWrite: false
  });
  
  this.blurYUniforms = THREE.UniformsUtils.clone(ShaderLib.ssao2Blur.uniforms);
  this.blurYMaterial = new THREE.ShaderMaterial({
    uniforms: this.blurYUniforms,
    vertexShader: ShaderLib.ssao2Blur.vertexShader,
    fragmentShader: ShaderLib.ssao2Blur.fragmentShader,
    depthTest: false,
    depthWrite: false
  });
  
  var INV_LN2 = 1.44269504;
  var SQRT_LN2 = 0.832554611;
  var blurSigma = (4.0 + 1.0) * 0.5;
  var blurFalloff = INV_LN2 / (2.0 * blurSigma * blurSigma);
  var blurDepthThreshold = 2.0 * SQRT_LN2 * 0.2;
  var texSizeInvWidth = 1.0 / this.resolution.x;
  var texSizeInvHeight = 1.0 / this.resolution.y;
  this.blurXUniforms.tAO.value = this.rtBlur1.texture;
  this.blurXUniforms.blurParams.value.set(texSizeInvWidth, 0.0, blurFalloff, 1.0);
  this.blurYUniforms.tAO.value = this.rtBlur2.texture;
  this.blurYUniforms.blurParams.value.set(0.0, texSizeInvWidth, blurFalloff, 1.0);
  
  this.compositeUniforms = THREE.UniformsUtils.clone(ShaderLib.ssao2Composite.uniforms);
  this.compositeMaterial = new THREE.ShaderMaterial({
    uniforms: this.compositeUniforms,
    vertexShader: ShaderLib.ssao2Composite.vertexShader,
    fragmentShader: ShaderLib.ssao2Composite.fragmentShader,
    depthTest: false, depthWrite: false
  });
  
  this.viewUniforms = THREE.UniformsUtils.clone(ShaderLib.view.uniforms);
  this.viewMaterial = new THREE.ShaderMaterial({
    uniforms: this.viewUniforms,
    vertexShader: ShaderLib.view.vertexShader,
    fragmentShader: ShaderLib.view.fragmentShader,
    depthTest: false, depthWrite: false
  });
  this.viewUniforms.type.value = PIXY.ViewR;
  // this.viewUniforms.type.value = PIXY.ViewRGB;
};

SSAOPass.prototype = Object.assign(Object.create(ScreenPass.prototype), {
  
  constructor: SSAOPass,
  
  render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
    
    if (maskActive) {
      renderer.context.disable(renderer.context.STENCIL_TEST);
    }
    
    var rad = this.radius;
    var rad2 = rad*rad;
    var negInvRad2 = -1.0 / rad2;
    
    var angleBias = radians(this.angleBias);
    var tanAngleBias = Math.tan(angleBias);
    
    var cot = 1.0 / Math.tan(radians(this.sceneCamera.fov*0.5));
    var resX = this.resolution.x;
    var resY = this.resolution.y;
    var maxRadius = this.maxRadius * Math.min(this.resolution.x, this.resolution.y);
    var invAoResX = 1.0 / this.resolution.x;
    var invAoResY = 1.0 / this.resolution.y;
    var focal1 = cot * (this.resolution.y / this.resolution.x);
    var focal2 = cot;
    var invFocal1 = 1.0 / focal1;
    var invFocal2 = 1.0 / focal2;
    var uvToVA0 = 2.0 * invFocal1;
    var uvToVA1 = -2.0 * invFocal2;
    var uvToVB0 = -1.0 * invFocal1;
    var uvToVB1 = 1.0 * invFocal2;
    
    this.makeUniforms.radiusParams.value.set(rad, rad2, negInvRad2, maxRadius);
    this.makeUniforms.biasParams.value.set(angleBias, tanAngleBias, this.strength, 1.0);
    this.makeUniforms.screenParams.value.set(resX, resY, invAoResX, invAoResY);
    this.makeUniforms.uvToViewParams.value.set(uvToVA0, uvToVA1, uvToVB0, uvToVB1);
    this.makeUniforms.focalParams.value.set(focal1, focal2, invFocal1, invFocal2);
    this.makeUniforms.cameraParams.value.set(this.sceneCamera.near, this.sceneCamera.far);
    this.makeUniforms.tDepth.value = this.depthTexture;

    var oldRenderTarget = renderer.getRenderTarget();
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    
    // MAKE SSAO
    this.quad.material = this.makeMaterial;
    renderer.setRenderTarget(this.rtBlur1);
    renderer.render(this.scene, this.camera);
    
    for (var i=0; i<2; ++i) {
      this.quad.material = this.blurXMaterial;
      renderer.setRenderTarget(this.rtBlur2);
      renderer.render(this.scene, this.camera);
      
      this.quad.material = this.blurYMaterial;
      renderer.setRenderTarget(this.rtBlur1);
      renderer.render(this.scene, this.camera);
    }
    
    var target = this.rtBlur1;
    
    if (this.ssaoOnly) {
      this.quad.material = this.viewMaterial;
      this.viewUniforms.tDiffuse.value = target.texture;
    }
    else {
      this.quad.material = this.compositeMaterial;
      this.compositeUniforms.tDiffuse.value = readBuffer.texture;
      this.compositeUniforms.tAO.value = target.texture;
    }
    
    renderer.setRenderTarget(writeBuffer);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(oldRenderTarget);
    renderer.autoClear = oldAutoClear;
  }
});

export { SSAOPass };