import * as THREE from 'three';
export const lightsDirectUniforms = {
	directLights: {
		value: [
			{
				direction: new THREE.Vector3( 0, 0, 1 ),
				color: new THREE.Color( 0xffffff ),
			},
		],
	},
};
