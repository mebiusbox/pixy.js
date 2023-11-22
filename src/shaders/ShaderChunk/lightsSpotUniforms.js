import * as THREE from 'three';
export const lightsSpotUniforms = {
	spotLights: {
		value: [
			{
				position: new THREE.Vector3( 0, 0, 10 ),
				direction: new THREE.Vector3( 0, 0, - 1 ),
				color: new THREE.Color(),
				distance: 10.0,
				decay: 0.0,
				coneCos: Math.PI / 4.0,
				penumbraCos: 1.0,
			},
		],
	},
};
