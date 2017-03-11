import { ShaderChunk } from './ShaderChunk';

var ShaderLib = {
  
  copy: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.copyUniforms
    ]),
    vertexShader: ShaderChunk.copyVert,
    fragmentShader: ShaderChunk.copyFrag
  },
  
  // convolution: {
  //   uniforms: THREE.UniformsUtils.merge([
  //     ShaderChunk.convolutionUniforms
  //   ]),
  //   vertexShader: ShaderChunk.convolutionVert,
  //   fragmentShader: ShaderChunk.convolutionFrag
  // },
  
  id: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.idUniforms
    ]),
    vertexShader: ShaderChunk.idVert,
    fragmentShader: ShaderChunk.idFrag
  },
  
  edge: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.edgeUniforms
    ]),
    vertexShader: ShaderChunk.edgeVert,
    fragmentShader: ShaderChunk.edgeFrag
  },
  
  edgeExpand: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.edgeExpandUniforms
    ]),
    vertexShader: ShaderChunk.edgeExpandVert,
    fragmentShader: ShaderChunk.edgeExpnadFrag
  },
  
  edgeID: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.edgeIDUniforms
    ]),
    vertexShader: ShaderChunk.edgeIDVert,
    fragmentShader: ShaderChunk.edgeIDFrag
  },
  
  edgeComposite: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.edgeCompositeUniforms
    ]),
    vertexShader: ShaderChunk.edgeCompositeVert,
    fragmentShader: ShaderChunk.edgeCompositeFrag
  },
  
  
  luminosityHighPass: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.luminosityHighPassUniforms
    ]),
    vertexShader: ShaderChunk.luminosityHighPassVert,
    fragmentShader: ShaderChunk.luminosityHighPassFrag
  },
  
  luminosity: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.luminosityUniforms
    ]),
    vertexShader: ShaderChunk.luminosityVert,
    fragmentShader: ShaderChunk.luminosityFrag
  },
  
  toneMap: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.toneMapUniforms
    ]),
    vertexShader: ShaderChunk.toneMapVert,
    fragmentShader: ShaderChunk.toneMapFrag
  }
    
};

export { ShaderLib };