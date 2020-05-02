import { Pass } from './pass.js';

//// SCREEN PASS

var ScreenPass = function() {
  
  Pass.call(this);
  
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), null);
  this.scene.add(this.quad);
};

ScreenPass.prototype = Object.assign(Object.create(Pass.prototype), {
  
  constructor: ScreenPass,
  
  render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
    var oldRenderTarget = renderer.getRenderTarget();
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderTarget(writeBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(oldRenderTarget);
    renderer.autoClear = oldAutoClear;
  }
});

export { ScreenPass };