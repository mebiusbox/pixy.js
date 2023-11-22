import * as THREE from 'three';
export const ssao2Uniforms = {
	tDiffuse: { value: null },
	tDepth: { value: null },
	angleBias: { value: 40.0 },
	radius: { value: 4.5 },
	maxRadius: { value: 0.5 },
	strength: { value: 10.0 },

	radiusParams: { value: new THREE.Vector4() },
	biasParams: { value: new THREE.Vector4() },
	screenParams: { value: new THREE.Vector4() },
	uvToViewParams: { value: new THREE.Vector4() },
	focalParams: { value: new THREE.Vector4() },
	cameraParams: { value: new THREE.Vector2() },
};
