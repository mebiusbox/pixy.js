var AreaLight = function() {
  
  this.position = new THREE.Vector3();
  this.color = new THREE.Color(0xffffff);
  this.distance = 50.0;
  this.decay = 1.0;
  this.radius = 1.0;

};

Object.assign(AreaLight.prototype, {
  
  constructor: AreaLight
  
});

export { AreaLight };