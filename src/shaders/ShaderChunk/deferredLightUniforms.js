export var deferredLightUniforms = {
  gbuf0: { value: null },
  gbuf1: { value: null },
  tDepth: { value: null },
  tEnvMap: { value: null },
  metalness: { value: 1.0 },
  reflectionStrength: { value: 1.0 },
  pointLights: { value: [] },
  numPointLights: { value: 0 },
  viewInverse: { value: new THREE.Matrix4() },
  viewProjectionInverse: { value: new THREE.Matrix4() },
  viewPosition: { value: new THREE.Vector3() },
  cutoffDistance: { value: 10.0 },
  decayExponent: { value: 3.0 }
};