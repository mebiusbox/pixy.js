import * as THREE from 'three';
export const anisotropyUniforms = {
	anisotropyExponent: { value: 100.0 },
	anisotropyStrength: { value: 1.0 },
	anisotropyFresnel: { value: 0.5 },
	anisotropyColor: { value: new THREE.Color() },
};
