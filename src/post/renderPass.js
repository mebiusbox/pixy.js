import { Pass } from './pass.js';

//// RENDER PASS

var RenderPass = function(scene, camera, overrideMaterial, clearColor, clearAlpha) {
  
  Pass.call(this);
  
  this.scene = scene;
  this.camera = camera;
  this.overrideMaterial = overrideMaterial;
  this.clearColor = clearColor;
  this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 0;
  this.clear = true;
  this.clearDepth = true;
  // this.colorMask = null;
  this.needsSwap = false;
};

RenderPass.prototype = Object.assign(Object.create(Pass.prototype), {
  
  constructor: RenderPass,
  
  render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
    
    var oldAutoClear = renderer.autoClear;
    var oldAutoClearDepth = renderer.autoClearDepth;
    renderer.autoClear = false;
    renderer.autoClearDepth = this.clearDepth;
    
    this.scene.overrideMaterial = this.overrideMaterial;
    
    var oldClearColor, oldClearAlpha;
    
    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }
    
    if (this.colorMask) {
      renderer.getContext().colorMask(this.colorMask[0], this.colorMask[1], this.colorMask[2], this.colorMask[3]);
    }
    
    var oldRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(oldRenderTarget);
    
    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }
    
    if (this.colorMask) {
      renderer.getContext().colorMask(true, true, true, true);
    }
    
    this.scene.overrideMaterial = null;
    renderer.autoClear = oldAutoClear;
    renderer.autoClearDepth = oldAutoClearDepth;
  }
});

export { RenderPass };