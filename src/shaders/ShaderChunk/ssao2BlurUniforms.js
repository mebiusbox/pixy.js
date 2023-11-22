import * as THREE from 'three';
export const ssao2BlurUniforms = {
	tAO: { value: null },
	blurParams: { value: new THREE.Vector4() },
};
