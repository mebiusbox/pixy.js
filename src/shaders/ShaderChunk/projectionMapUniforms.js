import * as THREE from 'three';
export const projectionMapUniforms = {
	tProjectionMap: { value: null },
	projectionMapMatrix: { value: new THREE.Matrix4() },
	projectionMapPos: { value: new THREE.Vector3() },
	projectionColor: { value: new THREE.Color() },
};
