export var ssaoUniforms = {
  tDiffuse:     { value: null },
  tDepth:       { value: null },
  size:        { value: new THREE.Vector2(512, 512) },
  cameraNear:  { value: 1 },
  cameraFar:   { value: 100 },
  onlyAO:      { value: 0 },
  aoClamp:     { value: 0.5 },
  lumInfluence: { value: 0.5 }
};