import { SSAARenderPass } from './ssaaRenderPass.js';
/**
 * Temporal Anti-Aliasing Render Pass
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 */
var TAARenderPass = function(scene, camera, params) {
  
  if (SSAARenderPass === undefined) {
    console.error("PIXY.TAARenderPass relise on PIXY.SSAARenderPass");
  }
  
  SSAARenderPass.call(this, scene, camera, params);
  
  this.sampleLevel = 0;
  this.accumulate = false;
};

TAARenderPass.JitterVectors = SSAARenderPass.JitterVectors;

TAARenderPass.prototype = Object.assign(Object.create(SSAARenderPass.prototype), {
  
  constructor: TAARenderPass,
  
  render: function(renderer, writeBuffer, readBuffer, delta) {
    
    if (!this.accumulate) {
      SSAARenderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta);
      this.accumulateIndex = -1;
      return;
    }
    
    var jitterOffsets = TAARenderPass.JitterVectors[5];
    if (!this.sampleRenderTarget) {
      this.sampleRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.eheight, this.params);
    }
    
    if (!this.holdRenderTarget) {
      this.holdRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.eheight, this.params);
    }
    
    if (this.accumulate && this.accumulateIndex === -1) {
      SSAARenderPass.prototype.render.call(this, renderer, this.holdRenderTarget, readBuffer, delta);
      this.accumulateIndex = 0;
    }
    
    var oldRenderTarget = renderer.getRenderTarget();
    var autoClear = renderer.autoClear;
    renderer.autoClear = false;
    
    var sampleWeight = 1.0 / jitterOffsets.length;
    if (this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length) {
      this.copyUniforms["opacity"].value = sampleWeight;
      this.copyUniforms["tDiffsue"].value = writeBuffer.texture;
      
      // render the scene multiple times, each slightly jitter offset from the last and accumulate the results
      var numSamplesPerFrame = Math.pow(2, this.sampleLevel);
      for (var i=0; i<numSamplesPerFrame; i++) {
        var j = this.accumulateIndex;
        var jitterOffset = jitterOffsets[j];
        if (this.camera.setViewOffset) {
          this.camera.setViewOffset(readBuffer.width, readBuffer.height, 
            jitterOffset[0] * 0.0625, jitterOffset[1] * 0.0625, // 0.0625 = 1/16
            readBuffer.width, readBuffer.height);
        }
        
        renderer.setRenderTarget(writeBuffer);
        renderer.clear();
        renderer.render(this.scene, this.camera);

        renderer.setRenderTarget(this.sampleRenderTarget);
        if (this.accumulateIndex === 0) renderer.clear();
        renderer.render(this.scene2, this.camera2);
        
        this.accumulateIndex++;
        if (this.accumulateIndex >= jitterOffsets.length) {
          break;
        }
      }
      
      if (this.camera.clearViewOffset) {
        this.camera.clearViewOffset();
      }
    }
    
    var accumulationWeight = this.accumulateIndex * sampleWeight;
    if (accumulationWeight > 0) {
      this.copyUniforms["opacity"].value = 1.0;
      this.copyUniforms["tDiffuse"].value = this.sampleRenderTarget.texture;
      renderer.setRenderTarget(writeBuffer);
      renderer.clear();
      renderer.render(this.scene2, this.camera2);
    }
    if (accumulationWeight < 1.0) {
      this.copyUniforms["opacity"].value = 1.0 - accumulationWeight;
      this.copyUniforms["tDiffuse"].value = this.holdRenderTarget.texture;
      renderer.setRenderTarget(writeBuffer);
      if (accumulationWeight === 0) renderer.clear();
      renderer.render(this.scene2, this.camera2);
    }
    
    renderer.setRenderTarget(oldRenderTarget);
    renderer.autoClear = autoClear;
  }
});

export { TAARenderPass };