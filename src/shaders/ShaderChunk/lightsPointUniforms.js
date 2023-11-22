import * as THREE from 'three';
export const lightsPointUniforms = {
	pointLights: {
		value: [
			{
				position: new THREE.Vector3(),
				color: new THREE.Color(),
				distance: 1.0,
				decay: 0.0,
			},
		],
	},
};
