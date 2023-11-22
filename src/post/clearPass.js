import { Pass } from './pass.js';

// CLEAR PASS
class ClearPass extends Pass {

	constructor( clearColor, clearAlpha ) {

		super();

		this.needsSwap = false;
		this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
		this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
		// this.clearDepth;
		// this.colorMask;

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		let oldClearColor, oldClearAlpha, oldAutoClearDepth;

		if ( this.clearColor ) {

			oldClearColor = new THREE.Color();
			renderer.getClearColor( oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			oldAutoClearDepth = renderer.autoClearDepth;
			renderer.autoClearDepth = this.clearDepth;

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( this.colorMask[ 0 ], this.colorMask[ 1 ], this.colorMask[ 2 ], this.colorMask[ 3 ] );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.autoClearDepth = oldAutoClearDepth;

		}

		if ( this.colorMask ) {

			renderer.getContext().colorMask( true, true, true, true );

		}

	}

}

export { ClearPass };
