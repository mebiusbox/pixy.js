import * as THREE from 'three';
export const lineGlowUniforms = {
	lineGlowPlane: { value: new THREE.Vector4( 0, 1, 0, 0 ) },
	lineGlowColor: { value: new THREE.Color( 0xffffff ) },
	lineGlowRange: { value: 1.0 },
	lineGlowPower: { value: 1.0 },
};
