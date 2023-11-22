import * as THREE from 'three';
export const colorBalanceUniforms = {
	// x: cyan red, y: magenta green, z: yellow blue, w: tone
	cColorBalanceShadows: { value: new THREE.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalanceMidtones: { value: new THREE.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalanceHighlights: { value: new THREE.Vector3( 0.0, 0.0, 0.0 ) },
	cColorBalancePreserveLuminosity: { value: false },
};
