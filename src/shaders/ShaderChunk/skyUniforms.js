import * as THREE from 'three';
export const skyUniforms = {
	// tSky: { value: null },
	skyLuminance: { value: 1.0 },
	skyTurbidity: { value: 2.0 },
	skyRayleigh: { value: 1.0 },
	skyMieCoefficient: { value: 0.005 },
	skyMieDirectionalG: { value: 0.8 },
	skySunPosition: { value: new THREE.Vector3() },
};
