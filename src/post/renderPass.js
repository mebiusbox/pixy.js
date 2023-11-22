import { Pass } from './pass.js';
class RenderPass extends Pass {

	constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		super();

		this.scene = scene;
		this.camera = camera;
		this.overrideMaterial = overrideMaterial || null;
		this.clearColor = clearColor || 0;
		this.clearAlpha = clearAlpha || 0;
		this.clear = true;
		this.clearDepth = true;
		// this.colorMask = null;
		this.needsSwap = false;

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		const oldAutoClear = renderer.autoClear;
		const oldAutoClearDepth = renderer.autoClearDepth;
		renderer.autoClear = false;
		renderer.autoClearDepth = this.clearDepth;

		this.scene.overrideMaterial = this.overrideMaterial;

		let oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = new THREE.Color();
			renderer.getClearColor( oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		const oldRenderTarget = renderer.getRenderTarget();
		renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
		renderer.autoClearDepth = oldAutoClearDepth;

	}

}

export { RenderPass };
