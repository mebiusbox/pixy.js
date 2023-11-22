import * as THREE from 'three';
class TubeLight {

	constructor() {

		this.start = new THREE.Vector3();
		this.end = new THREE.Vector3();
		this.color = new THREE.Color( 0xffffff );
		this.distance = 50.0;
		this.decay = 1.0;
		this.radius = 1.0;

	}

}


export { TubeLight };
