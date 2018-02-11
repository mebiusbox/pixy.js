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
  },
  
  ssao: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.ssaoUniforms
    ]),
    vertexShader: ShaderChunk.ssaoVert,
    fragmentShader: ShaderChunk.ssaoFrag
  },
  
  ssao2: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.ssao2Uniforms
    ]),
    vertexShader: ShaderChunk.ssaoVert,
    fragmentShader: ShaderChunk.ssao2Frag
  },
  
  ssao2Blur: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.ssao2BlurUniforms
    ]),
    vertexShader: ShaderChunk.copyVert,
    fragmentShader: ShaderChunk.ssao2BlurFrag
  },
  
  ssao2Composite: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.ssao2CompositeUniforms
    ]),
    vertexShader: ShaderChunk.copyVert,
    fragmentShader: ShaderChunk.ssao2CompositeFrag
  },
  
  fxaa: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.antiAliasUniforms
    ]),
    vertexShader: ShaderChunk.antiAliasVert,
    fragmentShader: ShaderChunk.antiAliasFrag
  },
  
  colorBalance: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.colorBalanceUniforms
    ]),
    vertexShader: ShaderChunk.copyVert,
    fragmentShader: ShaderChunk.colorBalanceFrag
  },
  
  view: {
    uniforms: THREE.UniformsUtils.merge([
      ShaderChunk.viewUniforms
    ]),
    vertexShader: ShaderChunk.copyVert,
    fragmentShader: ShaderChunk.viewFrag
  }
};

export { ShaderLib };