var RectLight = function() {
  
  this.positions = [];
  this.normal = new THREE.Vector3(0,0,1);
  this.tangent = new THREE.Vector3(1,0,0);
  this.color = new THREE.Color(0xffffff);
  this.intensity = 1.0;
  this.width = 1.0;
  this.height = 1.0;
  this.distance = 50.0;
  this.decay = 1.0;
  this.matrix = new THREE.Matrix4();
  this.numPositions = 4;
};

Object.assign(RectLight.prototype, {
  
  constructor: RectLight
  
});

export { RectLight };