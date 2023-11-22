import * as THREE from 'three';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { ScreenPass } from './screenPass.js';

class EdgePass extends ScreenPass {

	constructor( aspect, strength, color, idedge, resolution ) {

		super();

		this.aspect = aspect;
		this.strength = strength;
		this.color = color;
		this.idedge = idedge;
		this.source = null;

		const pars = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false,
		};
		this.edgeBuffer = new THREE.WebGLRenderTarget( resolution, resolution, pars );
		this.edgeExpandBuffer = new THREE.WebGLRenderTarget( resolution, resolution, pars );

		const edgeShader = ShaderLib.edge;
		this.edgeUniforms = THREE.UniformsUtils.clone( edgeShader.uniforms );
		this.edgeMaterial = new THREE.ShaderMaterial( {
			uniforms: this.edgeUniforms,
			vertexShader: edgeShader.vertexShader,
			fragmentShader: edgeShader.fragmentShader,
		} );

		const edgeExpandShader = ShaderLib.edgeExpand;
		this.edgeExpandUniforms = THREE.UniformsUtils.clone( edgeExpandShader.uniforms );
		this.edgeExpandMaterial = new THREE.ShaderMaterial( {
			uniforms: this.edgeExpandUniforms,
			vertexShader: edgeExpandShader.vertexShader,
			fragmentShader: edgeExpandShader.fragmentShader,
		} );

		const edgeIDShader = ShaderLib.edgeID;
		this.idUniforms = THREE.UniformsUtils.clone( edgeIDShader.uniforms );
		this.idMaterial = new THREE.ShaderMaterial( {
			uniforms: this.idUniforms,
			vertexShader: edgeIDShader.vertexShader,
			fragmentShader: edgeIDShader.fragmentShader,
		} );

		const compositeShader = ShaderLib.edgeComposite;
		this.compositeUniforms = THREE.UniformsUtils.clone( compositeShader.uniforms );
		this.compositeMaterial = new THREE.ShaderMaterial( {
			uniforms: this.compositeUniforms,
			vertexShader: compositeShader.vertexShader,
			fragmentShader: compositeShader.fragmentShader,
		} );

	}

	render( renderer, writeBuffer, readBuffer, _delta, _maskActive ) {

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		if ( this.idedge ) {

			this.idUniforms.aspect.value = this.aspect;
			this.idUniforms.step.value = 1.0;
			this.idUniforms.tDiffuse.value = this.source;
			this.quad.material = this.idMaterial;
			renderer.setRenderTarget( this.edgeBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;

		} else {

			this.edgeUniforms.aspect.value = this.aspect;
			this.edgeUniforms.tDiffuse.value = this.source;
			this.quad.material = this.edgeMaterial;
			renderer.setRenderTarget( this.edgeBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;

		}

		const edgeTexture = this.edgeBuffer.texture;
		if ( this.strength > 0.0 ) {

			this.edgeExpandUniforms.aspect.value = this.aspect;
			this.edgeExpandUniforms.strength.value = this.strength;
			this.edgeExpandUniforms.tDiffuse.value = this.edgeBuffer.texture;
			this.quad.material = this.edgeExpandMaterial;
			renderer.setRenderTarget( this.edgeExpandBuffer );
			renderer.render( this.scene, this.camera );
			this.quad.material = null;
			edgeTexture = this.edgeExpandBuffer.texture;

		}

		this.compositeUniforms.edgeColor.value = this.color;
		// this.compositeUniforms.edgeColor.value = new THREE.Vector3(1.0, 0.0, 0.0);
		this.compositeUniforms.tEdge.value = edgeTexture;
		this.compositeUniforms.tDiffuse.value = readBuffer.texture;
		this.quad.material = this.compositeMaterial;
		renderer.setRenderTargeT( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		this.quad.material = null;

		// this.quad.material = new THREE.MeshBasicMaterial({map: this.edgeBuffer.texture});
		// this.quad.material = new THREE.MeshBasicMaterial({map: this.source});
		// renderer.render(this.scene, this.camera, writeBuffer, this.clear);
		// this.quad.material = null;

		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

}

export { EdgePass };
