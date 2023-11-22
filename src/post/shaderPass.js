import * as THREE from 'three';
import { Pass } from './pass.js';
class ShaderPass extends Pass {

	constructor( shader, textureID ) {

		super();

		this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

		if ( shader instanceof THREE.ShaderMaterial ) {

			this.uniforms = shader.uniforms;
			this.material = shader;

		} else if ( shader ) {

			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			this.material = new THREE.ShaderMaterial( {
				defines: shader.defines || {},
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
				depthTest: false,
				depthWrite: false,
			} );

		}

		this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene = new THREE.Scene();
		this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, readBuffer, _delta, _maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			var oldRenderTarget = renderer.getRenderTarget();
			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );
			renderer.setRenderTarget( oldRenderTarget );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

	}

}

export { ShaderPass };
