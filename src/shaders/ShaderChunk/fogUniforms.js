import * as THREE from 'three';
export const fogUniforms = {
	fogAlpha: { value: 1.0 },
	fogFar: { value: 50.0 },
	fogNear: { value: 1.0 },
	fogColor: { value: new THREE.Color() },
};
