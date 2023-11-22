import * as THREE from 'three';
class AreaLight {

	constructor() {

		this.position = new THREE.Vector3();
		this.color = new THREE.Color( 0xffffff );
		this.distance = 50.0;
		this.decay = 1.0;
		this.radius = 1.0;

	}

}

export { AreaLight };
