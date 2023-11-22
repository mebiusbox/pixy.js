import * as THREE from 'three';
export const antiAliasUniforms = {
	tDiffuse: { value: null },
	resolution: { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) },
};
