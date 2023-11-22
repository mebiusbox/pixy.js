import * as THREE from 'three';
export const ambientHemisphereUniforms = {
	groundColor: { value: new THREE.Color( 0x404040 ) },
	skyDirection: { value: new THREE.Vector3( 0, 1, 0 ) },
};
