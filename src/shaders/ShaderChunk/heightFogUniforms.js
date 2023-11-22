import * as THREE from 'three';
export const heightFogUniforms = {
	heightFogAlpha: { value: 1.0 },
	heightFogFar: { value: 50.0 },
	heightFogNear: { value: 1.0 },
	heightFogColor: { value: new THREE.Color() },
};
